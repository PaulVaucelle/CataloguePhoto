import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Domain, loadData } from "./storage/catalogue";
import { useTheme } from "./theme/useTheme";

const { width } = Dimensions.get("window");

const NAV_ITEMS = [
  { label: "Statistiques", icon: "📊", route: "/stats", color: "#5DCAA5" },
  { label: "Badges", icon: "🏅", route: "/badges", color: "#F0A500" },
  { label: "Mes spots", icon: "🗺️", route: "/map", color: "#378ADD" },
  { label: "A propos", icon: "ℹ️", route: "/about", color: "#888888" },
];

export default function HomeScreen() {
  const router = useRouter();
  const c = useTheme();
  const [domains, setDomains] = useState<Domain[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData().then(setDomains);
    }, []),
  );

  const totalDone = domains.reduce(
    (s, d) => s + d.objects.filter((o) => o.done).length,
    0,
  );
  const totalObjs = domains.reduce((s, d) => s + d.objects.length, 0);
  const totalPct =
    totalObjs > 0 ? Math.round((totalDone / totalObjs) * 100) : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: c.textSecondary }]}>
          Bienvenue
        </Text>
        <Text style={[styles.appName, { color: c.text }]}>CataloguePhoto</Text>
      </View>

      {/* Carte progression globale */}
      <View style={[styles.globalCard, { backgroundColor: c.backgroundCard }]}>
        <View style={styles.globalTop}>
          <View>
            <Text style={[styles.globalNum, { color: c.text }]}>
              {totalDone}
            </Text>
            <Text style={[styles.globalLabel, { color: c.textSecondary }]}>
              sur {totalObjs} objets
            </Text>
          </View>
          <View style={styles.circleContainer}>
            <Text style={[styles.circlePct, { color: c.text }]}>
              {totalPct}%
            </Text>
            <Text style={[styles.circleLabel, { color: c.textSecondary }]}>
              complété
            </Text>
          </View>
        </View>
        <View style={[styles.barBg, { backgroundColor: c.border }]}>
          <View
            style={[
              styles.barFill,
              { width: `${totalPct}%`, backgroundColor: "#5DCAA5" },
            ]}
          />
        </View>
      </View>

      {/* Domaines */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Domaines</Text>
        <TouchableOpacity
          onPress={() => router.push("/create-domain")}
          style={[styles.addDomainBtn, { backgroundColor: c.backgroundCard }]}
        >
          <Text style={[styles.addDomainText, { color: c.text }]}>
            + Nouveau
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.domainsGrid}>
        {domains.map((domain) => {
          const done = domain.objects.filter((o) => o.done).length;
          const total = domain.objects.length;
          const pct = Math.round((done / total) * 100);
          return (
            <TouchableOpacity
              key={domain.id}
              style={[styles.domainCard, { backgroundColor: c.backgroundCard }]}
              onPress={() =>
                router.push({
                  pathname: "/catalogue",
                  params: { domainId: domain.id },
                })
              }
              activeOpacity={0.7}
            >
              <Text style={styles.domainIcon}>{domain.icon}</Text>
              <Text style={[styles.domainName, { color: c.text }]}>
                {domain.label}
              </Text>
              <Text style={[styles.domainCount, { color: c.textSecondary }]}>
                {done}/{total}
              </Text>
              <View style={[styles.domainBar, { backgroundColor: c.border }]}>
                <View
                  style={[
                    styles.domainFill,
                    { width: `${pct}%`, backgroundColor: domain.color },
                  ]}
                />
              </View>
              <Text style={[styles.domainPct, { color: domain.color }]}>
                {pct}%
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Navigation secondaire */}
      <Text style={[styles.sectionTitle, { color: c.text }]}>Explorer</Text>
      <View style={styles.navGrid}>
        {NAV_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={[styles.navCard, { backgroundColor: c.backgroundCard }]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text style={[styles.navLabel, { color: c.text }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const CARD_WIDTH = (width - 52) / 2;

const styles = StyleSheet.create({
  content: {
    paddingTop: 64,
    paddingBottom: 40,
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.3,
  },
  appName: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginTop: 2,
  },
  globalCard: {
    borderRadius: 18,
    padding: 20,
    gap: 14,
  },
  globalTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  globalNum: {
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: -1,
  },
  globalLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  circleContainer: {
    alignItems: "center",
  },
  circlePct: {
    fontSize: 28,
    fontWeight: "700",
  },
  circleLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  barBg: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: 5,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.3,
    marginBottom: -4,
  },
  domainsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  domainCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  domainIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  domainName: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  domainCount: {
    fontSize: 12,
    marginBottom: 8,
  },
  domainBar: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  domainFill: {
    height: 3,
    borderRadius: 2,
  },
  domainPct: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  navGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  navCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: "500",
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: -4,
  },
  addDomainBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addDomainText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
