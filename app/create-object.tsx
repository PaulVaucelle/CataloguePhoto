import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { addObject } from "./storage/catalogue";
import { useTheme } from "./theme/useTheme";

export default function CreateObjectScreen() {
  const router = useRouter();
  const c = useTheme();
  const { domainId, domainLabel, domainIcon, domainColor } =
    useLocalSearchParams<{
      domainId: string;
      domainLabel: string;
      domainIcon: string;
      domainColor: string;
    }>();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!name.trim()) {
      Alert.alert("Nom requis", "Donne un nom à cet objet.");
      return;
    }
    setSaving(true);
    await addObject(domainId, name.trim(), type.trim() || "Personnalisé");
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
        <View style={styles.headerRow}>
          <Text style={styles.headerIcon}>{domainIcon}</Text>
          <View>
            <Text style={[styles.title, { color: c.text }]}>Nouvel objet</Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>
              {domainLabel}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={[styles.card, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.cardTitle, { color: c.textSecondary }]}>
            Nom
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: c.text, borderBottomColor: c.border },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Amanite des césars..."
            placeholderTextColor={c.placeholder}
            autoFocus
            maxLength={60}
          />
        </View>

        <View style={[styles.card, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.cardTitle, { color: c.textSecondary }]}>
            Catégorie (optionnel)
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: c.text, borderBottomColor: c.border },
            ]}
            value={type}
            onChangeText={setType}
            placeholder="Ex: Comestible, Rare..."
            placeholderTextColor={c.placeholder}
            maxLength={40}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.addBtn,
            { backgroundColor: domainColor || c.btnPrimary },
          ]}
          onPress={handleAdd}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>
            {saving ? "Ajout..." : "Ajouter l'objet"}
          </Text>
        </TouchableOpacity>
      </View>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: { fontSize: 32 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 13, marginTop: 2 },
  body: {
    paddingHorizontal: 20,
    gap: 12,
  },
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
  addBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
