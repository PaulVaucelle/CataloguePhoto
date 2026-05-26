import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { createDomain } from "./storage/catalogue";
import { useTheme } from "./theme/useTheme";

const PRESET_COLORS = [
  "#E05C5C",
  "#E07A5C",
  "#E0A85C",
  "#E0D05C",
  "#8ACA5C",
  "#5DCAA5",
  "#5CA8CA",
  "#5C6ECA",
  "#8A5CCA",
  "#CA5CA8",
  "#CA5C7A",
  "#888888",
];

export default function CreateDomainScreen() {
  const router = useRouter();
  const c = useTheme();
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!label.trim()) {
      Alert.alert("Nom requis", "Donne un nom à ton domaine.");
      return;
    }
    if (!icon.trim()) {
      Alert.alert("Icône requise", "Ajoute un emoji comme icône.");
      return;
    }
    setSaving(true);
    await createDomain(label.trim(), icon.trim(), color);
    setSaving(false);
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backText, { color: c.textSecondary }]}>
            ← Annuler
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.text }]}>Nouveau domaine</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview */}
        <View style={[styles.preview, { backgroundColor: c.backgroundCard }]}>
          <View style={[styles.previewIcon, { backgroundColor: color + "22" }]}>
            <Text style={styles.previewEmoji}>{icon || "?"}</Text>
          </View>
          <Text style={[styles.previewLabel, { color: c.text }]}>
            {label || "Mon domaine"}
          </Text>
          <Text style={[styles.previewSub, { color: c.textSecondary }]}>
            0 objets
          </Text>
          <View style={[styles.previewBar, { backgroundColor: c.border }]}>
            <View
              style={[
                styles.previewFill,
                { backgroundColor: color, width: "0%" },
              ]}
            />
          </View>
        </View>

        {/* Nom */}
        <View style={[styles.card, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.cardTitle, { color: c.textSecondary }]}>
            Nom du domaine
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: c.text, borderBottomColor: c.border },
            ]}
            value={label}
            onChangeText={setLabel}
            placeholder="Ex: Champignons, Minéraux..."
            placeholderTextColor={c.placeholder}
            maxLength={30}
          />
        </View>

        {/* Icône */}
        <View style={[styles.card, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.cardTitle, { color: c.textSecondary }]}>
            Icône (emoji)
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.emojiInput,
              { color: c.text, borderBottomColor: c.border },
            ]}
            value={icon}
            onChangeText={(t) => setIcon(t.slice(-2))}
            placeholder="🍄"
            placeholderTextColor={c.placeholder}
            maxLength={2}
          />
          <Text style={[styles.inputHint, { color: c.textSecondary }]}>
            Tape ou colle un seul emoji
          </Text>
        </View>

        {/* Couleur */}
        <View style={[styles.card, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.cardTitle, { color: c.textSecondary }]}>
            Couleur
          </Text>
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((col) => (
              <TouchableOpacity
                key={col}
                style={[
                  styles.colorDot,
                  { backgroundColor: col },
                  color === col && styles.colorDotSelected,
                ]}
                onPress={() => setColor(col)}
              />
            ))}
          </View>
        </View>

        {/* Bouton créer */}
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: color }]}
          onPress={handleCreate}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.createBtnText}>
            {saving ? "Création..." : "Créer le domaine"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backText: { fontSize: 14, marginBottom: 8 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  body: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 48,
  },
  preview: {
    borderRadius: 16,
    padding: 20,
    alignItems: "flex-start",
    gap: 4,
  },
  previewIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  previewEmoji: { fontSize: 28 },
  previewLabel: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  previewSub: { fontSize: 12, marginBottom: 8 },
  previewBar: {
    width: "100%",
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  previewFill: { height: 3, borderRadius: 2 },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  emojiInput: {
    fontSize: 28,
    textAlign: "center",
  },
  inputHint: {
    fontSize: 12,
    marginTop: -4,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },
  colorDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  createBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  createBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
