import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
  { label: "Statistiques", icon: "📊", route: "/stats", color: "#3D6B47" },
  { label: "Badges", icon: "🏅", route: "/badges", color: "#C4853A" },
  { label: "Mes spots", icon: "🗺️", route: "/map", color: "#1B3A5C" },
  { label: "À propos", icon: "ℹ️", route: "/about", color: "#7A8E9B" },
];

export default function HomeScreen() {
  const router = useRouter();
  const c = useTheme();
  const [domains, setDomains] = useState<Domain[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("onboarding_done").then((done) => {
      if (!done) router.replace("/onboarding");
    });
  }, []);

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
        <Text style={[styles.appName, { color: c.text }]}>NatureScope</Text>
        <Text style={[styles.tagline, { color: c.accent }]}>
          Capture Earth's Wonders
        </Text>
      </View>

      {/* Carte progression globale */}
      <View style={[styles.globalCard, { backgroundColor: c.backgroundCard }]}>
        <View style={[styles.globalAccent, { backgroundColor: c.accent }]} />
        <View style={styles.globalContent}>
          <View>
            <Text style={[styles.globalNum, { color: c.text }]}>
              {totalDone}
            </Text>
            <Text style={[styles.globalLabel, { color: c.textSecondary }]}>
              sur {totalObjs} objets catalogués
            </Text>
          </View>
          <View style={styles.globalRight}>
            <Text style={[styles.circlePct, { color: c.accent }]}>
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
              { width: `${totalPct}%`, backgroundColor: c.accent },
            ]}
          />
        </View>
      </View>

      {/* Domaines */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>
          Mes catalogues
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/create-domain")}
          style={[
            styles.addBtn,
            { backgroundColor: c.backgroundCard, borderColor: c.border },
          ]}
        >
          <Text style={[styles.addBtnText, { color: c.accent }]}>
            + Nouveau
          </Text>
        </TouchableOpacity>
      </View>

      {/* Carte du ciel */}
      <TouchableOpacity
        style={[
          styles.skyBtn,
          { backgroundColor: "#0D1520", borderColor: "#1A2540" },
        ]}
        onPress={() => router.push("/skymap")}
        activeOpacity={0.8}
      >
        <Text style={styles.skyBtnIcon}>🔭</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.skyBtnTitle}>Carte du ciel AR</Text>
          <Text style={styles.skyBtnSub}>
            Pointe vers le ciel pour identifier les objets
          </Text>
        </View>
        <Text style={{ color: "#5DCAA5", fontSize: 18 }}>›</Text>
      </TouchableOpacity>

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
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.domainIconWrap,
                  { backgroundColor: domain.color + "18" },
                ]}
              >
                <Text style={styles.domainIcon}>{domain.icon}</Text>
              </View>
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
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.navIconWrap,
                { backgroundColor: item.color + "18" },
              ]}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
            </View>
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
    paddingBottom: 48,
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  globalCard: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  globalAccent: {
    height: 4,
  },
  globalContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 14,
  },
  globalNum: {
    fontSize: 44,
    fontWeight: "700",
    letterSpacing: -1,
  },
  globalLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  globalRight: {
    alignItems: "flex-end",
  },
  circlePct: {
    fontSize: 30,
    fontWeight: "700",
  },
  circleLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  barBg: {
    height: 4,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: -4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: "600",
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  domainIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  domainIcon: {
    fontSize: 24,
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  navIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  navIcon: {
    fontSize: 18,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  skyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  skyBtnIcon: { fontSize: 28 },
  skyBtnTitle: { color: "#E8E4F0", fontSize: 15, fontWeight: "600" },
  skyBtnSub: { color: "#6070A0", fontSize: 12, marginTop: 2 },
});
