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
import { Badge, computeBadges } from "./storage/badge";
import { loadData } from "./storage/catalogue";
import { useTheme } from "./theme/useTheme";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 52) / 2;

export default function BadgesScreen() {
  const router = useRouter();
  const c = useTheme();
  const [badges, setBadges] = useState<Badge[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData().then((data) => setBadges(computeBadges(data)));
    }, []),
  );

  const unlocked = badges.filter((b) => b.unlocked);
  const locked = badges.filter((b) => !b.unlocked);
  const pct =
    badges.length > 0 ? Math.round((unlocked.length / badges.length) * 100) : 0;

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
        <Text style={[styles.title, { color: c.text }]}>Badges</Text>

        {/* Progression */}
        <View
          style={[styles.progressCard, { backgroundColor: c.backgroundCard }]}
        >
          <View style={styles.progressTop}>
            <Text style={[styles.progressNum, { color: c.text }]}>
              {unlocked.length}
            </Text>
            <Text style={[styles.progressLabel, { color: c.textSecondary }]}>
              sur {badges.length} badges obtenus
            </Text>
            <Text
              style={[styles.progressPct, { color: c.accent ?? "#C4853A" }]}
            >
              {pct}%
            </Text>
          </View>
          <View style={[styles.barBg, { backgroundColor: c.border }]}>
            <View
              style={[
                styles.barFill,
                { width: `${pct}%`, backgroundColor: c.accent ?? "#C4853A" },
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {unlocked.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: c.text }]}>
              Obtenus
            </Text>
            <View style={styles.grid}>
              {unlocked.map((badge) => (
                <View
                  key={badge.id}
                  style={[
                    styles.card,
                    styles.cardUnlocked,
                    {
                      backgroundColor: c.backgroundCard,
                      borderColor: c.accent + "44" ?? "#C4853A44",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: (c.accent ?? "#C4853A") + "18" },
                    ]}
                  >
                    <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  </View>
                  <Text style={[styles.badgeLabel, { color: c.text }]}>
                    {badge.label}
                  </Text>
                  <Text style={[styles.badgeDesc, { color: c.textSecondary }]}>
                    {badge.description}
                  </Text>
                  <View
                    style={[
                      styles.unlockedDot,
                      { backgroundColor: c.accent ?? "#C4853A" },
                    ]}
                  />
                </View>
              ))}
            </View>
          </>
        )}

        {locked.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: c.text }]}>
              À débloquer
            </Text>
            <View style={styles.grid}>
              {locked.map((badge) => (
                <View
                  key={badge.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: c.backgroundCard,
                      borderColor: c.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: c.border + "66" },
                    ]}
                  >
                    <Text style={[styles.badgeIcon, { opacity: 0.25 }]}>
                      {badge.icon}
                    </Text>
                  </View>
                  <Text style={[styles.badgeLabel, { color: c.textSecondary }]}>
                    {badge.label}
                  </Text>
                  <Text
                    style={[
                      styles.badgeDesc,
                      { color: c.textSecondary, opacity: 0.6 },
                    ]}
                  >
                    {badge.description}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
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
    marginBottom: 14,
  },
  progressCard: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  progressTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressNum: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  progressLabel: {
    fontSize: 13,
    flex: 1,
  },
  progressPct: {
    fontSize: 18,
    fontWeight: "700",
  },
  barBg: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: { height: 4, borderRadius: 2 },
  body: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginTop: 4,
    marginBottom: -4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 8,
    position: "relative",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardUnlocked: {
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  badgeIcon: { fontSize: 28 },
  badgeLabel: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  badgeDesc: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 15,
  },
  unlockedDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
