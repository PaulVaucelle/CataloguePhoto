import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DOMAINS = [
  {
    id: "astro",
    label: "Astronomie",
    icon: "🔭",
    done: 42,
    total: 110,
    color: "#1D9E75",
  },
  {
    id: "fleurs",
    label: "Fleurs",
    icon: "🌸",
    done: 28,
    total: 80,
    color: "#D4537E",
  },
  {
    id: "arbres",
    label: "Arbres",
    icon: "🌲",
    done: 12,
    total: 60,
    color: "#639922",
  },
  {
    id: "oiseaux",
    label: "Oiseaux",
    icon: "🦅",
    done: 5,
    total: 120,
    color: "#378ADD",
  },
];

export default function HomeScreen() {
  const totalDone = DOMAINS.reduce((s, d) => s + d.done, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mon catalogue</Text>
      <Text style={styles.subtitle}>{totalDone} objets photographiés</Text>

      <View style={styles.grid}>
        {DOMAINS.map((domain) => {
          const pct = Math.round((domain.done / domain.total) * 100);
          return (
            <TouchableOpacity key={domain.id} style={styles.card}>
              <Text style={styles.icon}>{domain.icon}</Text>
              <Text style={styles.domainName}>{domain.label}</Text>
              <Text style={styles.domainProg}>
                {domain.done} / {domain.total}
              </Text>
              <View style={styles.barBg}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "47%",
    backgroundColor: "#f5f5f5",
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
    color: "#111",
  },
  domainProg: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
    marginBottom: 10,
  },
  barBg: {
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
});
