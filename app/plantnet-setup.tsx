import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { savePlantnetKey } from "./storage/catalogue";
import { useTheme } from "./theme/useTheme";

export default function PlantnetSetupScreen() {
  const router = useRouter();
  const c = useTheme();
  const [key, setKey] = useState("");
  const [testing, setTesting] = useState(false);

  async function handleTest() {
    if (!key.trim()) {
      Alert.alert("Clé requise", "Saisis ta clé API Pl@ntNet.");
      return;
    }
    setTesting(true);
    try {
      // Test rapide avec une requete minimale
      const res = await fetch(
        `https://my-api.plantnet.org/v2/identify/all?api-key=${key.trim()}&lang=fr&nb-results=1`,
        { method: "POST", body: new FormData() },
      );
      // 400 = requete invalide mais cle valide, 401 = cle invalide
      if (res.status === 401) {
        Alert.alert(
          "Clé invalide",
          "Cette clé API n'est pas reconnue par Pl@ntNet. Vérifie et réessaie.",
        );
      } else {
        await savePlantnetKey(key.trim());
        Alert.alert(
          "Clé enregistrée !",
          "Ta clé Pl@ntNet est maintenant active.",
          [{ text: "Continuer", onPress: () => router.back() }],
        );
      }
    } catch {
      // Si le test echoue pour une autre raison, on sauvegarde quand meme
      await savePlantnetKey(key.trim());
      Alert.alert(
        "Clé enregistrée",
        "Clé sauvegardée. Elle sera utilisée pour les identifications.",
        [{ text: "Continuer", onPress: () => router.back() }],
      );
    } finally {
      setTesting(false);
    }
  }

  function handleSkip() {
    Alert.alert(
      "Passer cette étape ?",
      "Sans clé API, l'identification de plantes ne sera pas disponible.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Passer", onPress: () => router.back() },
      ],
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.body}>
        {/* Illustration */}
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: c.backgroundCard, borderColor: c.border },
          ]}
        >
          <Text style={styles.icon}>🌿</Text>
        </View>

        <Text style={[styles.title, { color: c.text }]}>
          Identification Pl@ntNet
        </Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Pour identifier tes plantes, arbres et champignons par photo, tu as
          besoin d'une clé API Pl@ntNet personnelle — c'est gratuit et prend 2
          minutes.
        </Text>

        {/* Étapes */}
        <View style={[styles.stepsCard, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.stepsTitle, { color: c.accent ?? "#C4853A" }]}>
            Comment obtenir ta clé
          </Text>
          {[
            { num: "1", text: "Va sur my.plantnet.org" },
            { num: "2", text: "Crée un compte gratuit" },
            { num: "3", text: "Copie ta clé API" },
          ].map((step, i, arr) => (
            <View
              key={step.num}
              style={[
                styles.step,
                i < arr.length - 1 && {
                  borderBottomWidth: 0.5,
                  borderBottomColor: c.border,
                },
              ]}
            >
              <View
                style={[
                  styles.stepNum,
                  { backgroundColor: (c.accent ?? "#C4853A") + "22" },
                ]}
              >
                <Text
                  style={[styles.stepNumText, { color: c.accent ?? "#C4853A" }]}
                >
                  {step.num}
                </Text>
              </View>
              <Text style={[styles.stepText, { color: c.text }]}>
                {step.text}
              </Text>
            </View>
          ))}
          <TouchableOpacity
            style={[
              styles.linkBtn,
              { backgroundColor: (c.accent ?? "#C4853A") + "18" },
            ]}
            onPress={() => Linking.openURL("https://my.plantnet.org")}
          >
            <Text
              style={[styles.linkBtnText, { color: c.accent ?? "#C4853A" }]}
            >
              Ouvrir my.plantnet.org →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Saisie clé */}
        <View style={[styles.inputCard, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.inputLabel, { color: c.accent ?? "#C4853A" }]}>
            Ta clé API
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: c.text, borderBottomColor: c.border },
            ]}
            value={key}
            onChangeText={setKey}
            placeholder="2a...Xk8f"
            placeholderTextColor={c.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Boutons */}
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: c.text }]}
          onPress={handleTest}
          disabled={testing}
          activeOpacity={0.8}
        >
          {testing ? (
            <ActivityIndicator size="small" color={c.background} />
          ) : (
            <Text style={[styles.primaryBtnText, { color: c.background }]}>
              Enregistrer la clé
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip}>
          <Text style={[styles.skipText, { color: c.textSecondary }]}>
            Passer cette étape
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: "center",
    gap: 16,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 4,
  },
  icon: { fontSize: 40 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  stepsCard: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    gap: 0,
  },
  stepsTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: {
    fontSize: 13,
    fontWeight: "700",
  },
  stepText: {
    fontSize: 14,
  },
  linkBtn: {
    marginTop: 12,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  linkBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  inputCard: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    fontFamily: "monospace",
  },
  primaryBtn: {
    width: "100%",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  skipText: {
    fontSize: 14,
    marginTop: 4,
  },
});
