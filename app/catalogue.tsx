import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import StarField from "./components/StarField";
import { Domain, loadData } from "./storage/catalogue";
import { useTheme } from "./theme/useTheme";

type Filter = "tous" | "fait" | "todo";
type SortBy = "nom" | "type";

export default function CatalogueScreen() {
  const router = useRouter();

  const { domainId } = useLocalSearchParams<{ domainId: string }>();
  const c = useTheme(domainId);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [filter, setFilter] = useState<Filter>("tous");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("nom");

  useFocusEffect(
    useCallback(() => {
      loadData().then((data) => {
        const found = data.find((d) => d.id === domainId);
        if (found) setDomain(found);
      });
    }, [domainId]),
  );

  if (!domain) return null;

  const filtered = domain.objects.filter((o) => {
    const matchFilter =
      filter === "tous" ? true : filter === "fait" ? o.done : !o.done;
    const matchSearch =
      search.trim() === "" ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.type.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "nom") return a.name.localeCompare(b.name);
    return a.type.localeCompare(b.type) || a.name.localeCompare(b.name);
  });

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {domainId === "astro" && <StarField />}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={[styles.backText, { color: c.textSecondary }]}>
          ← Accueil
        </Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: c.text }]}>{domain.label}</Text>

      <View style={[styles.searchRow, { backgroundColor: c.inputBg }]}>
        <TextInput
          style={[styles.searchInput, { color: c.text }]}
          placeholder="Rechercher..."
          placeholderTextColor={c.placeholder}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch("")}
            style={styles.clearBtn}
          >
            <Text style={[styles.clearText, { color: c.placeholder }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sortRow}>
        <Text style={[styles.sortLabel, { color: c.textSecondary }]}>
          Trier par
        </Text>
        {(["nom", "type"] as SortBy[]).map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.sortChip,
              {
                borderColor: sortBy === s ? c.text : c.border,
                backgroundColor:
                  sortBy === s ? c.backgroundCard : "transparent",
              },
            ]}
            onPress={() => setSortBy(s)}
          >
            <Text
              style={[
                styles.sortChipText,
                {
                  color: sortBy === s ? c.text : c.textSecondary,
                  fontWeight: sortBy === s ? "500" : "normal",
                },
              ]}
            >
              {s === "nom" ? "Nom" : "Type"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterRow}>
        {(["tous", "fait", "todo"] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.chip,
              {
                borderColor: filter === f ? "transparent" : c.border,
                backgroundColor: filter === f ? c.text : "transparent",
              },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.chipText,
                { color: filter === f ? c.background : c.textSecondary },
              ]}
            >
              {f === "tous"
                ? `Tous (${domain.objects.length})`
                : f === "fait"
                  ? `Photographiés (${domain.objects.filter((o) => o.done).length})`
                  : `À faire (${domain.objects.filter((o) => !o.done).length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {sorted.length === 0 ? (
          <Text style={[styles.empty, { color: c.placeholder }]}>
            Aucun résultat pour "{search}"
          </Text>
        ) : (
          sorted.map((obj) => (
            <TouchableOpacity
              key={obj.id}
              style={[styles.row, { backgroundColor: c.backgroundCard }]}
              onPress={() =>
                router.push({
                  pathname: "/detail",
                  params: {
                    id: obj.id,
                    domainId: domain.id,
                    name: obj.name,
                    type: obj.type,
                    done: obj.done ? "1" : "0",
                    photoUri: obj.photoUri ?? "",
                    constellation: obj.constellation ?? "",
                    magnitude: obj.magnitude ?? "",
                    distance: obj.distance ?? "",
                    notes: obj.notes ?? "",
                  },
                })
              }
            >
              <View
                style={[
                  styles.thumb,
                  { backgroundColor: obj.done ? "#1a1a2e" : c.border },
                ]}
              >
                <Text style={{ fontSize: 22 }}>
                  {obj.done ? domain.icon : "📷"}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.objName, { color: c.text }]}>
                  {obj.name}
                </Text>
                <Text style={[styles.objType, { color: c.textSecondary }]}>
                  {obj.type}
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: obj.done ? c.badgeDoneBg : c.badgeTodoBg },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: obj.done ? c.badgeDoneText : c.badgeTodoText },
                  ]}
                >
                  {obj.done ? "Fait" : "A faire"}
                </Text>
              </View>
            </TouchableOpacity>
          ))
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
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  clearBtn: {
    padding: 4,
  },
  clearText: {
    fontSize: 13,
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sortLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  sortChipText: {
    fontSize: 12,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
  list: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 40,
  },
  empty: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 40,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    padding: 12,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  objName: {
    fontSize: 14,
    fontWeight: "500",
  },
  objType: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
  },
});
