import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../theme/useTheme';
import { loadPlantnetKey } from '../storage/catalogue';

type Result = {
  commonName: string;
  scientificName: string;
  score: number;
};

type Props = {
  onIdentified?: (name: string, photoUri: string) => void;
};

export default function IdentifyMineralButton({ onIdentified }: Props) {
  const c = useTheme('mineraux');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  async function handleIdentify() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission refusée', 'Autorise l\'accès à l\'appareil photo.');
      return;
    }

    const picked = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (picked.canceled) return;

    const uri = picked.assets[0].uri;
    setPhotoUri(uri);
    setLoading(true);
    setResults([]);

    try {
      const apiKey = await loadPlantnetKey();

      if (!apiKey) throw new Error('Clé Pl@ntNet manquante');

      // Tentative PlantNet rocks
      const formData = new FormData();
      formData.append('images', { uri, type: 'image/jpeg', name: 'photo.jpg' } as any);
      formData.append('organs', 'other');

      const url = `https://my-api.plantnet.org/v2/identify/rocks?api-key=${apiKey}&lang=fr&nb-results=3&include-related-images=false`;

      const res = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error(`PlantNet rocks: ${res.status}`);

      const data = await res.json();
      const parsed: Result[] = (data.results ?? []).slice(0, 3).map((r: any) => ({
        scientificName: r.species?.scientificNameWithoutAuthor ?? '—',
        commonName: r.species?.commonNames?.[0] ?? r.species?.scientificNameWithoutAuthor ?? '—',
        score: Math.round((r.score ?? 0) * 100),
      }));

      setResults(parsed);
      if (parsed.length > 0 && onIdentified) {
        onIdentified(parsed[0].commonName, uri);
      }

    } catch (e: any) {
      // Fallback Google Lens
      Alert.alert(
        'Identification minéral',
        'Pl@ntNet ne supporte pas encore les minéraux de façon stable.\n\nVoulez-vous ouvrir Google Lens pour identifier ce minéral ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Google Lens',
            onPress: async () => {
              try {
                const canShare = await Sharing.isAvailableAsync();
                if (canShare && uri) {
                  await Sharing.shareAsync(uri, {
                    dialogTitle: 'Identifier ce minéral',
                    mimeType: 'image/jpeg',
                  });
                } else {
                  Alert.alert('Partage indisponible', 'Le partage n\'est pas disponible sur cet appareil.');
                }
              } catch {
                Alert.alert('Erreur', 'Impossible d\'ouvrir le partage.');
              }
            }
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: c.backgroundCard, borderColor: c.border }]}
        onPress={handleIdentify}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color={c.text} />
        ) : (
          <Text style={[styles.btnText, { color: c.text }]}>💎 Identifier ce minéral</Text>
        )}
      </TouchableOpacity>

      {results.length > 0 && (
        <View style={[styles.results, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.resultsTitle, { color: c.textSecondary }]}>Résultats Pl@ntNet</Text>
          {results.map((r, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.resultRow, i < results.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: c.border }]}
              onPress={() => photoUri && onIdentified?.(r.commonName, photoUri)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.commonName, { color: c.text }]}>{r.commonName}</Text>
                <Text style={[styles.sciName, { color: c.textSecondary }]}>{r.scientificName}</Text>
              </View>
              <View style={[styles.scorePill, {
                backgroundColor: r.score >= 70 ? '#EAF3DE' : r.score >= 40 ? '#FFF3CD' : '#FFE0E0'
              }]}>
                <Text style={[styles.scoreText, {
                  color: r.score >= 70 ? '#3B6D11' : r.score >= 40 ? '#856404' : '#721c24'
                }]}>
                  {r.score}%
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Bouton Google Lens direct */}
      {photoUri && results.length === 0 && !loading && (
        <TouchableOpacity
          style={[styles.lensBtn, { borderColor: c.border }]}
          onPress={async () => {
            const canShare = await Sharing.isAvailableAsync();
            if (canShare && photoUri) {
              await Sharing.shareAsync(photoUri, {
                dialogTitle: 'Identifier ce minéral',
                mimeType: 'image/jpeg',
              });
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.lensBtnText, { color: c.textSecondary }]}>
            🔍 Ouvrir dans Google Lens
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  btn: {
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  btnText: { fontSize: 14, fontWeight: '500' },
  results: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  resultsTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    padding: 14,
    paddingBottom: 8,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  commonName: { fontSize: 14, fontWeight: '500' },
  sciName: { fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scoreText: { fontSize: 12, fontWeight: '600' },
  lensBtn: {
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  lensBtnText: { fontSize: 14, fontWeight: '500' },
});