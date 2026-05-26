import { useRouter } from "expo-router";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BackgroundField from "./components/BackgroundField";
import { useTheme } from "./theme/useTheme";

export default function AboutScreen() {
  const router = useRouter();
  const c = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <BackgroundField domainId="astro" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backText, { color: c.textSecondary }]}>
            ← Accueil
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🔭</Text>
          <Text style={[styles.appName, { color: c.text }]}>
            CataloguePhoto
          </Text>
          <Text style={[styles.version, { color: c.textSecondary }]}>
            Version 1.0.0
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.cardTitle, { color: c.textSecondary }]}>
            À propos
          </Text>
          <Text style={[styles.cardText, { color: c.text }]}>
            CataloguePhoto te permet de cataloguer tes photos d'objets célestes,
            de fleurs, d'arbres et d'oiseaux. Suis ta progression et constitue
            ta collection personnelle au fil de tes sorties.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.cardTitle, { color: c.textSecondary }]}>
            Contenu
          </Text>
          {[
            { icon: "🔭", label: "Astronomie", detail: "110 objets Messier" },
            { icon: "🌸", label: "Fleurs", detail: "40 espèces" },
            { icon: "🌲", label: "Arbres", detail: "40 espèces" },
            { icon: "🦅", label: "Oiseaux", detail: "60 espèces" },
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

        <View style={[styles.card, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.cardTitle, { color: c.textSecondary }]}>
            Données astronomiques
          </Text>
          <Text style={[styles.cardText, { color: c.text }]}>
            Les données des objets Messier sont issues du catalogue de Charles
            Messier (1774) et des bases de données astronomiques publiques.
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://www.messier-objects.com")}
          >
            <Text style={[styles.link, { color: "#5DCAA5" }]}>
              messier-objects.com →
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.cardTitle, { color: c.textSecondary }]}>
            Technologies
          </Text>
          {[
            { label: "React Native", detail: "Framework mobile" },
            { label: "Expo", detail: "Plateforme de dev" },
            { label: "AsyncStorage", detail: "Stockage local" },
            { label: "expo-location", detail: "GPS" },
            { label: "react-native-maps", detail: "Cartographie" },
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
  backText: { fontSize: 14 },
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
  heroIcon: { fontSize: 56 },
  appName: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  version: { fontSize: 13 },
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 22,
  },
  link: {
    fontSize: 14,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  rowIcon: { fontSize: 18 },
  rowLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  rowDetail: { fontSize: 13 },
  footer: {
    fontSize: 13,
    marginTop: 8,
  },
});
