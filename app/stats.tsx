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

export default function StatsScreen() {
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
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={[styles.backText, { color: c.textSecondary }]}>
          ← Accueil
        </Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: c.text }]}>Progression</Text>

      <View style={[styles.globalCard, { backgroundColor: c.backgroundCard }]}>
        <Text style={[styles.globalNum, { color: c.text }]}>{totalDone}</Text>
        <Text style={[styles.globalLabel, { color: c.textSecondary }]}>
          objets photographiés sur {totalObjs}
        </Text>
        <View style={[styles.barBg, { backgroundColor: c.border }]}>
          <View
            style={[
              styles.barFill,
              { width: `${totalPct}%`, backgroundColor: c.text },
            ]}
          />
        </View>
        <Text style={[styles.globalPct, { color: c.textSecondary }]}>
          {totalPct}% complété
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {domains.map((domain) => {
          const done = domain.objects.filter((o) => o.done).length;
          const total = domain.objects.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;

          const byType: Record<string, { done: number; total: number }> = {};
          domain.objects.forEach((o) => {
            if (!byType[o.type]) byType[o.type] = { done: 0, total: 0 };
            byType[o.type].total++;
            if (o.done) byType[o.type].done++;
          });

          return (
            <View
              key={domain.id}
              style={[styles.card, { backgroundColor: c.backgroundCard }]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{domain.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardName, { color: c.text }]}>
                    {domain.label}
                  </Text>
                  <Text style={[styles.cardCount, { color: c.textSecondary }]}>
                    {done} / {total} photographiés
                  </Text>
                </View>
                <Text style={[styles.cardPct, { color: domain.color }]}>
                  {pct}%
                </Text>
              </View>
              <View style={[styles.barBg, { backgroundColor: c.border }]}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${pct}%`, backgroundColor: domain.color },
                  ]}
                />
              </View>
              {Object.entries(byType).map(([type, counts]) => (
                <View key={type} style={styles.typeRow}>
                  <Text style={[styles.typeLabel, { color: c.textSecondary }]}>
                    {type}
                  </Text>
                  <Text style={[styles.typeCount, { color: c.text }]}>
                    {counts.done}/{counts.total}
                  </Text>
                  <View style={[styles.typeBg, { backgroundColor: c.border }]}>
                    <View
                      style={[
                        styles.typeFill,
                        {
                          width: `${Math.round((counts.done / counts.total) * 100)}%`,
                          backgroundColor: domain.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          );
        })}
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
  title: {
    fontSize: 24,
    fontWeight: "600",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  globalCard: {
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  globalNum: {
    fontSize: 48,
    fontWeight: "700",
  },
  globalLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  globalPct: {
    fontSize: 13,
    marginTop: 6,
  },
  list: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "500",
  },
  cardCount: {
    fontSize: 12,
  },
  cardPct: {
    fontSize: 18,
    fontWeight: "600",
  },
  barBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  typeLabel: {
    fontSize: 12,
    width: 160,
  },
  typeCount: {
    fontSize: 12,
    width: 36,
    textAlign: "right",
  },
  typeBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  typeFill: {
    height: 4,
    borderRadius: 2,
  },
});
