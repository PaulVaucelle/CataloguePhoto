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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text
            style={[styles.backText, { color: c.accent ?? c.textSecondary }]}
          >
            ← Accueil
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.text }]}>Statistiques</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Carte globale */}
        <View
          style={[styles.globalCard, { backgroundColor: c.backgroundCard }]}
        >
          <View
            style={[
              styles.globalAccent,
              { backgroundColor: c.accent ?? "#C4853A" },
            ]}
          />
          <View style={styles.globalContent}>
            <View>
              <Text style={[styles.globalNum, { color: c.text }]}>
                {totalDone}
              </Text>
              <Text style={[styles.globalLabel, { color: c.textSecondary }]}>
                objets catalogués
              </Text>
            </View>
            <View style={styles.globalRight}>
              <Text
                style={[styles.globalPct, { color: c.accent ?? "#C4853A" }]}
              >
                {totalPct}%
              </Text>
              <Text style={[styles.globalSub, { color: c.textSecondary }]}>
                sur {totalObjs}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.barBg,
              {
                backgroundColor: c.border,
                marginHorizontal: 20,
                marginBottom: 16,
              },
            ]}
          >
            <View
              style={[
                styles.barFill,
                {
                  width: `${totalPct}%`,
                  backgroundColor: c.accent ?? "#C4853A",
                },
              ]}
            />
          </View>
        </View>

        {/* Domaines */}
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
              <View style={[styles.cardTop, { borderLeftColor: domain.color }]}>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.cardIconWrap,
                      { backgroundColor: domain.color + "18" },
                    ]}
                  >
                    <Text style={styles.cardIcon}>{domain.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardName, { color: c.text }]}>
                      {domain.label}
                    </Text>
                    <Text style={[styles.cardSub, { color: c.textSecondary }]}>
                      {done} / {total}
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
              </View>

              <View style={styles.typeList}>
                {Object.entries(byType)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([type, counts], i, arr) => {
                    const typePct = Math.round(
                      (counts.done / counts.total) * 100,
                    );
                    return (
                      <View
                        key={type}
                        style={[
                          styles.typeRow,
                          {
                            borderTopColor: c.border,
                            borderTopWidth: i === 0 ? 0 : 0.5,
                          },
                        ]}
                      >
                        <Text
                          style={[styles.typeLabel, { color: c.textSecondary }]}
                          numberOfLines={1}
                        >
                          {type}
                        </Text>
                        <View
                          style={[styles.typeBg, { backgroundColor: c.border }]}
                        >
                          <View
                            style={[
                              styles.typeFill,
                              {
                                width: `${typePct}%`,
                                backgroundColor: domain.color + "88",
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.typeCount, { color: c.text }]}>
                          {counts.done}/{counts.total}
                        </Text>
                      </View>
                    );
                  })}
              </View>
            </View>
          );
        })}
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
  backText: { fontSize: 14, fontWeight: "500", marginBottom: 8 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  body: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 40,
  },
  globalCard: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  globalAccent: { height: 4 },
  globalContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 20,
    paddingBottom: 14,
  },
  globalNum: {
    fontSize: 44,
    fontWeight: "700",
    letterSpacing: -1,
  },
  globalLabel: { fontSize: 13, marginTop: 2 },
  globalRight: { alignItems: "flex-end" },
  globalPct: { fontSize: 28, fontWeight: "700" },
  globalSub: { fontSize: 12, marginTop: 2 },
  barBg: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: { height: 4, borderRadius: 2 },
  card: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardTop: {
    padding: 16,
    paddingBottom: 12,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardIcon: { fontSize: 20 },
  cardName: { fontSize: 15, fontWeight: "600" },
  cardSub: { fontSize: 12, marginTop: 1 },
  cardPct: { fontSize: 20, fontWeight: "700" },
  typeList: { paddingHorizontal: 16, paddingBottom: 8 },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  typeLabel: { fontSize: 12, width: 150 },
  typeBg: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  typeFill: { height: 3, borderRadius: 2 },
  typeCount: { fontSize: 12, fontWeight: "500", width: 36, textAlign: "right" },
});
