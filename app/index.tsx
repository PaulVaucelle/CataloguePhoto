import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Domain, loadData } from "./storage/catalogue";
import { useTheme } from "./theme/useTheme";

export default function HomeScreen() {
  const router = useRouter();
  const c = useTheme();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData().then((data) => {
        setDomains(data);
        setLoading(false);
      });
    }, []),
  );

  const totalDone = domains.reduce(
    (s, d) => s + d.objects.filter((o) => o.done).length,
    0,
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: c.text }]}>Mon catalogue</Text>
      <Text style={[styles.subtitle, { color: c.textSecondary }]}>
        {totalDone} objets photographiés
      </Text>

      <View style={styles.grid}>
        {domains.map((domain) => {
          const done = domain.objects.filter((o) => o.done).length;
          const total = domain.objects.length;
          const pct = Math.round((done / total) * 100);
          return (
            <TouchableOpacity
              key={domain.id}
              style={[styles.card, { backgroundColor: c.backgroundCard }]}
              onPress={() =>
                router.push({
                  pathname: "/catalogue",
                  params: { domainId: domain.id },
                })
              }
            >
              <Text style={styles.icon}>{domain.icon}</Text>
              <Text style={[styles.domainName, { color: c.text }]}>
                {domain.label}
              </Text>
              <Text style={[styles.domainProg, { color: c.textSecondary }]}>
                {done} / {total}
              </Text>
              <View style={[styles.barBg, { backgroundColor: c.border }]}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${pct}%`, backgroundColor: domain.color },
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={() => router.push("/stats")}
        style={styles.statsBtn}
      >
        <Text style={[styles.statsBtnText, { color: "#1D9E75" }]}>
          Voir les statistiques →
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/about")}
        style={styles.statsBtn}
      >
        <Text style={[styles.statsBtnText, { color: c.textSecondary }]}>
          À propos →
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  statsBtn: {
    marginBottom: 20,
  },
  statsBtnText: {
    fontSize: 14,
    fontWeight: "500",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "47%",
    borderRadius: 14,
    padding: 16,
  },
  icon: {
    fontSize: 28,
    marginBottom: 8,
  },
  domainName: {
    fontSize: 15,
    fontWeight: "500",
  },
  domainProg: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  barBg: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
});
