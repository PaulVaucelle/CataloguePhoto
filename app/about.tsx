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

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={[styles.backText, { color: c.textSecondary }]}>
          ← Accueil
        </Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[styles.emoji]}>🔭</Text>
        <Text style={[styles.title, { color: c.text }]}>CataloguePhoto</Text>
        <Text style={[styles.version, { color: c.textSecondary }]}>
          Version 1.0.0
        </Text>

        <View style={[styles.card, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>À propos</Text>
          <Text style={[styles.cardText, { color: c.textSecondary }]}>
            CataloguePhoto est une application mobile pour cataloguer vos photos
            d'objets célestes, de fleurs, d'arbres et d'oiseaux. Suivez votre
            progression et constituez votre collection personnelle au fil de vos
            sorties.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>Contenu</Text>
          {[
            { icon: "🔭", label: "Astronomie", detail: "110 objets Messier" },
            { icon: "🌸", label: "Fleurs", detail: "40 espèces" },
            { icon: "🌲", label: "Arbres", detail: "40 espèces" },
            { icon: "🦅", label: "Oiseaux", detail: "60 espèces" },
          ].map((item) => (
            <View key={item.label} style={styles.contentRow}>
              <Text style={styles.contentIcon}>{item.icon}</Text>
              <Text style={[styles.contentLabel, { color: c.text }]}>
                {item.label}
              </Text>
              <Text style={[styles.contentDetail, { color: c.textSecondary }]}>
                {item.detail}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>
            Données astronomiques
          </Text>
          <Text style={[styles.cardText, { color: c.textSecondary }]}>
            Les données des objets Messier (constellation, magnitude, distance)
            sont issues du catalogue de Charles Messier (1774) et des bases de
            données astronomiques publiques.
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
          <Text style={[styles.cardTitle, { color: c.text }]}>
            Technologies
          </Text>
          {[
            { label: "React Native", detail: "Framework mobile" },
            { label: "Expo", detail: "Plateforme de développement" },
            { label: "AsyncStorage", detail: "Stockage local" },
            { label: "expo-image-picker", detail: "Accès caméra et galerie" },
          ].map((item) => (
            <View key={item.label} style={styles.techRow}>
              <Text style={[styles.techLabel, { color: c.text }]}>
                {item.label}
              </Text>
              <Text style={[styles.techDetail, { color: c.textSecondary }]}>
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
  container: {
    flex: 1,
    paddingTop: 60,
  },
  backBtn: {
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  backText: {
    fontSize: 14,
  },
  body: {
    padding: 20,
    alignItems: "center",
    gap: 14,
    paddingBottom: 40,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  version: {
    fontSize: 13,
    marginBottom: 4,
  },
  card: {
    width: "100%",
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    lineHeight: 20,
  },
  link: {
    fontSize: 13,
    marginTop: 4,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  contentIcon: {
    fontSize: 18,
  },
  contentLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  contentDetail: {
    fontSize: 12,
  },
  techRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  techLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  techDetail: {
    fontSize: 12,
  },
  footer: {
    fontSize: 13,
    marginTop: 8,
  },
});
