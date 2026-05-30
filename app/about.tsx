import { useRouter } from "expo-router";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "./theme/useTheme";

export default function AboutScreen() {
  const router = useRouter();
  const c = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text
            style={[styles.backText, { color: c.accent ?? c.textSecondary }]}
          >
            ← Accueil
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View
            style={[
              styles.logoWrap,
              { backgroundColor: c.backgroundCard, borderColor: c.border },
            ]}
          >
            <Text style={styles.logoEmoji}>🌿</Text>
          </View>
          <Text style={[styles.appName, { color: c.text }]}>NatureScope</Text>
          <Text style={[styles.tagline, { color: c.accent ?? "#C4853A" }]}>
            Capture Earth's Wonders
          </Text>
          <Text style={[styles.version, { color: c.textSecondary }]}>
            Version 1.0.0
          </Text>
        </View>

        {/* À propos */}
        <View style={[styles.card, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.cardLabel, { color: c.accent ?? "#C4853A" }]}>
            À propos
          </Text>
          <Text style={[styles.cardText, { color: c.text }]}>
            NatureScope te permet de cataloguer tes observations du monde
            naturel — objets célestes, fleurs, arbres, oiseaux, minéraux,
            champignons et pays visités. Suis ta progression et constitue ta
            collection personnelle au fil de tes aventures.
          </Text>
        </View>

        {/* Contenu */}
        <View style={[styles.card, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.cardLabel, { color: c.accent ?? "#C4853A" }]}>
            Contenu
          </Text>
          {[
            {
              icon: "🔭",
              label: "Astronomie",
              detail: "219 objets (Messier + Caldwell)",
            },
            { icon: "🌸", label: "Fleurs", detail: "100 espèces" },
            { icon: "🌲", label: "Arbres", detail: "80 espèces" },
            { icon: "🦅", label: "Oiseaux", detail: "150 espèces" },
            { icon: "💎", label: "Minéraux", detail: "80 minéraux et roches" },
            { icon: "🍄", label: "Champignons", detail: "80 espèces" },
            { icon: "🌍", label: "Pays", detail: "195 pays du monde" },
          ].map((item, i, arr) => (
            <View
              key={item.label}
              style={[
                styles.row,
                i < arr.length - 1 && {
                  borderBottomWidth: 0.5,
                  borderBottomColor: c.border,
                },
              ]}
            >
              <Text style={styles.rowIcon}>{item.icon}</Text>
              <Text style={[styles.rowLabel, { color: c.text }]}>
                {item.label}
              </Text>
              <Text style={[styles.rowDetail, { color: c.textSecondary }]}>
                {item.detail}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor: c.backgroundCard,
              flexDirection: "row",
              alignItems: "center",
            },
          ]}
          onPress={() => router.push("/plantnet-setup")}
        >
          <Text style={{ fontSize: 20, marginRight: 12 }}>🌿</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowLabel, { color: c.text }]}>
              Clé API Pl@ntNet
            </Text>
            <Text style={[styles.rowDetail, { color: c.textSecondary }]}>
              Configurer l'identification de plantes
            </Text>
          </View>
          <Text style={[styles.link, { color: c.accent ?? "#C4853A" }]}>›</Text>
        </TouchableOpacity>

        {/* Sources */}
        <View style={[styles.card, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.cardLabel, { color: c.accent ?? "#C4853A" }]}>
            Sources
          </Text>
          {[
            {
              label: "Données Messier & Caldwell",
              url: "https://www.messier-objects.com",
              desc: "Bases de données astronomiques",
            },
            {
              label: "Identification Pl@ntNet",
              url: "https://plantnet.org",
              desc: "INRAE — reconnaissance végétale",
            },
          ].map((s, i, arr) => (
            <View
              key={s.label}
              style={[
                styles.row,
                i < arr.length - 1 && {
                  borderBottomWidth: 0.5,
                  borderBottomColor: c.border,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: c.text }]}>
                  {s.label}
                </Text>
                <Text style={[styles.rowDetail, { color: c.textSecondary }]}>
                  {s.desc}
                </Text>
              </View>
              <TouchableOpacity onPress={() => Linking.openURL(s.url)}>
                <Text style={[styles.link, { color: c.accent ?? "#C4853A" }]}>
                  ↗
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Technologies */}
        <View style={[styles.card, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.cardLabel, { color: c.accent ?? "#C4853A" }]}>
            Technologies
          </Text>
          {[
            { label: "React Native", detail: "Framework mobile" },
            { label: "Expo", detail: "Plateforme de développement" },
            { label: "AsyncStorage", detail: "Stockage local" },
            { label: "expo-location", detail: "GPS" },
            { label: "react-native-maps", detail: "Cartographie" },
            { label: "Pl@ntNet API", detail: "Reconnaissance végétale" },
          ].map((item, i, arr) => (
            <View
              key={item.label}
              style={[
                styles.row,
                i < arr.length - 1 && {
                  borderBottomWidth: 0.5,
                  borderBottomColor: c.border,
                },
              ]}
            >
              <Text style={[styles.rowLabel, { color: c.text }]}>
                {item.label}
              </Text>
              <Text style={[styles.rowDetail, { color: c.textSecondary }]}>
                {item.detail}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.footer, { color: c.textSecondary }]}>
          Fait avec ❤️ et Claude
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backText: { fontSize: 14, fontWeight: "500" },
  body: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 48,
    alignItems: "center",
  },
  hero: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 16,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  logoEmoji: { fontSize: 40 },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  version: { fontSize: 12, marginTop: 2 },
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    gap: 0,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 22,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  rowIcon: { fontSize: 18 },
  rowLabel: { fontSize: 14, fontWeight: "500", flex: 1 },
  rowDetail: { fontSize: 13 },
  link: { fontSize: 18, fontWeight: "600" },
  footer: { fontSize: 13, marginTop: 8 },
});
