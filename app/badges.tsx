import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Badge, computeBadges } from "./storage/badge";
import { loadData } from "./storage/catalogue";
import { useTheme } from "./theme/useTheme";

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

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={[styles.backText, { color: c.textSecondary }]}>
          ← Accueil
        </Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: c.text }]}>Badges</Text>
      <Text style={[styles.subtitle, { color: c.textSecondary }]}>
        {unlocked.length} / {badges.length} obtenus
      </Text>

      <ScrollView contentContainerStyle={styles.list}>
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
                      borderColor: "#5DCAA5",
                    },
                  ]}
                >
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={[styles.badgeLabel, { color: c.text }]}>
                    {badge.label}
                  </Text>
                  <Text style={[styles.badgeDesc, { color: c.textSecondary }]}>
                    {badge.description}
                  </Text>
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
                  <Text style={[styles.badgeIcon, styles.badgeIconLocked]}>
                    🔒
                  </Text>
                  <Text style={[styles.badgeLabel, { color: c.textSecondary }]}>
                    {badge.label}
                  </Text>
                  <Text style={[styles.badgeDesc, { color: c.textSecondary }]}>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: "47%",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1.5,
    gap: 6,
  },
  cardUnlocked: {
    shadowColor: "#5DCAA5",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  badgeIcon: {
    fontSize: 32,
  },
  badgeIconLocked: {
    opacity: 0.4,
  },
  badgeLabel: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  badgeDesc: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
});
