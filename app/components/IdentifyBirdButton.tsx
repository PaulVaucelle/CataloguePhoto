import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Location from "expo-location";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../theme/useTheme";

const BIRDNET_URL = "https://birdnet.cornell.edu/api/v2/analyze";
const MAX_DURATION = 10000; // 10 secondes max

type Result = {
  commonName: string;
  scientificName: string;
  score: number;
};

type Props = {
  onIdentified?: (name: string) => void;
};

export default function IdentifyBirdButton({ onIdentified }: Props) {
  const c = useTheme("oiseaux");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [duration, setDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  function startPulse() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }

  function stopPulse() {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  }

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission refusée", "Autorise l'accès au microphone.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync({
        android: {
          extension: ".wav",
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 48000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".wav",
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 48000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      });

      await rec.startAsync();
      recordingRef.current = rec;
      setRecording(true);
      setDuration(0);
      setResults([]);
      startPulse();

      // Compteur et arret automatique apres 10s
      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed += 1;
        setDuration(elapsed);
        if (elapsed >= MAX_DURATION / 1000) {
          stopRecording();
        }
      }, 1000);
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        `Impossible de démarrer l\'enregistrement : ${e.message}`,
      );
    }
  }

  async function stopRecording() {
    if (!recordingRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);
    stopPulse();
    setRecording(false);
    setLoading(true);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) throw new Error("Fichier audio introuvable");

      await analyze(uri);
    } catch (e: any) {
      Alert.alert("Erreur", `Analyse impossible : ${e.message}`);
      setLoading(false);
    }
  }

  async function analyze(uri: string) {
    try {
      // Recupere la position pour affiner l'identification
      let lat = 0,
        lon = 0;
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
        lat = loc.coords.latitude;
        lon = loc.coords.longitude;
      } catch {}

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const body = JSON.stringify({
        audio: base64,
        lat,
        lon,
        locale: "fr",
        sensitivity: 1.0,
        sf_thresh: 0.03,
      });

      const res = await fetch(BIRDNET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body,
      });

      if (!res.ok) throw new Error(`BirdNET: ${res.status}`);

      const data = await res.json();

      const parsed: Result[] = (data.results ?? [])
        .slice(0, 3)
        .map((r: any) => ({
          scientificName: r.scientific_name ?? "—",
          commonName: r.common_name ?? r.scientific_name ?? "—",
          score: Math.round((r.confidence ?? 0) * 100),
        }));

      setResults(parsed);

      if (parsed.length > 0 && onIdentified) {
        onIdentified(parsed[0].commonName);
      }
    } catch (e: any) {
      Alert.alert(
        "Erreur BirdNET",
        `Identification impossible : ${e.message}\n\nVérifie ta connexion internet.`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Bouton enregistrement */}
      <View style={styles.recordRow}>
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseAnim }],
              borderColor: recording ? "#378ADD" : "transparent",
            },
          ]}
        />
        <TouchableOpacity
          style={[
            styles.recordBtn,
            {
              backgroundColor: recording ? "#cc3333" : "#378ADD",
            },
          ]}
          onPress={recording ? stopRecording : startRecording}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.recordIcon}>{recording ? "⏹" : "🎙️"}</Text>
          )}
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.recordLabel, { color: c.text }]}>
            {loading
              ? "Analyse en cours..."
              : recording
                ? `Enregistrement... ${duration}s / 10s`
                : "Identifier un oiseau par son chant"}
          </Text>
          <Text style={[styles.recordSub, { color: c.textSecondary }]}>
            {recording
              ? "Appuie pour arrêter"
              : "Appuie et enregistre le chant"}
          </Text>
        </View>
      </View>

      {/* Barre de progression enregistrement */}
      {recording && (
        <View style={[styles.progressBg, { backgroundColor: c.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(duration / 10) * 100}%`,
                backgroundColor: "#378ADD",
              },
            ]}
          />
        </View>
      )}

      {/* Résultats */}
      {results.length > 0 && (
        <View style={[styles.results, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.resultsTitle, { color: c.textSecondary }]}>
            Résultats BirdNET
          </Text>
          {results.map((r, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.resultRow,
                i < results.length - 1 && {
                  borderBottomWidth: 0.5,
                  borderBottomColor: c.border,
                },
              ]}
              onPress={() => onIdentified?.(r.commonName)}
            >
              <Text style={styles.birdIcon}>🐦</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.commonName, { color: c.text }]}>
                  {r.commonName}
                </Text>
                <Text style={[styles.sciName, { color: c.textSecondary }]}>
                  {r.scientificName}
                </Text>
              </View>
              <View
                style={[
                  styles.scorePill,
                  {
                    backgroundColor:
                      r.score >= 70
                        ? "#EAF3DE"
                        : r.score >= 40
                          ? "#FFF3CD"
                          : "#FFE0E0",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.scoreText,
                    {
                      color:
                        r.score >= 70
                          ? "#3B6D11"
                          : r.score >= 40
                            ? "#856404"
                            : "#721c24",
                    },
                  ]}
                >
                  {r.score}%
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    position: "relative",
  },
  pulseRing: {
    position: "absolute",
    left: -8,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
  },
  recordBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#378ADD",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  recordIcon: { fontSize: 22 },
  recordLabel: { fontSize: 14, fontWeight: "500" },
  recordSub: { fontSize: 12, marginTop: 2 },
  progressBg: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  results: {
    borderRadius: 14,
    overflow: "hidden",
  },
  resultsTitle: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    padding: 14,
    paddingBottom: 8,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  birdIcon: { fontSize: 20 },
  commonName: { fontSize: 14, fontWeight: "500" },
  sciName: { fontSize: 12, fontStyle: "italic", marginTop: 2 },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scoreText: { fontSize: 12, fontWeight: "600" },
});
