import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../theme/useTheme";

const PLANTNET_KEY = process.env.EXPO_PUBLIC_PLANTNET_KEY;

const PLANTNET_ORGANS: Record<string, string> = {
  fleurs: "flower",
  arbres: "leaf",
  champignons: "other",
};

type Result = {
  commonName: string;
  scientificName: string;
  score: number;
};

type Props = {
  domainId: string;
  onIdentified?: (name: string, photoUri: string) => void;
};

export default function IdentifyButton({ domainId, onIdentified }: Props) {
  const c = useTheme(domainId);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  if (!PLANTNET_ORGANS[domainId]) return null;

  async function handleIdentify() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission refusée", "Autorise l'accès à l'appareil photo.");
      return;
    }

    const picked = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (picked.canceled) return;

    setLoading(true);
    setResults([]);

    try {
      const uri = picked.assets[0].uri;

      const formData = new FormData();
      formData.append("images", {
        uri,
        type: "image/jpeg",
        name: "photo.jpg",
      } as any);
      formData.append("organs", PLANTNET_ORGANS[domainId]);

      const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${PLANTNET_KEY}&lang=fr&nb-results=3&include-related-images=false`;

      const res = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Erreur ${res.status}: ${err}`);
      }

      const data = await res.json();

      const parsed: Result[] = (data.results ?? [])
        .slice(0, 3)
        .map((r: any) => ({
          scientificName: r.species?.scientificNameWithoutAuthor ?? "—",
          commonName:
            r.species?.commonNames?.[0] ??
            r.species?.scientificNameWithoutAuthor ??
            "—",
          score: Math.round((r.score ?? 0) * 100),
        }));

      setResults(parsed);

      if (parsed.length > 0 && onIdentified) {
        onIdentified(parsed[0].commonName, uri);
      }
    } catch (e: any) {
      console.error("PlantNet error:", e);
      Alert.alert("Erreur", `Identification impossible : ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.btn,
          { backgroundColor: c.backgroundCard, borderColor: c.border },
        ]}
        onPress={handleIdentify}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color={c.text} />
        ) : (
          <Text style={[styles.btnText, { color: c.text }]}>
            🌿 Identifier par photo
          </Text>
        )}
      </TouchableOpacity>

      {results.length > 0 && (
        <View style={[styles.results, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.resultsTitle, { color: c.textSecondary }]}>
            Résultats
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
  container: {
    gap: 10,
  },
  btn: {
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "500",
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
  commonName: {
    fontSize: 14,
    fontWeight: "500",
  },
  sciName: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
