import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BackgroundField from "./components/BackgroundField";
import { deleteDomain, Domain, loadData } from "./storage/catalogue";
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

  const done = domain.objects.filter((o) => o.done).length;
  const total = domain.objects.length;
  const pct = Math.round((done / total) * 100);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <BackgroundField domainId={domainId} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: c.textSecondary }]}>
            ← Accueil
          </Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.headerIcon}>{domain.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: c.text }]}>
              {domain.label}
            </Text>
            <Text style={[styles.headerSub, { color: c.textSecondary }]}>
              {done}/{total} · {pct}%
            </Text>
          </View>
        </View>
        <View style={[styles.headerBar, { backgroundColor: c.border }]}>
          <View
            style={[
              styles.headerFill,
              { width: `${pct}%`, backgroundColor: domain.color },
            ]}
          />
        </View>
      </View>

      {/* Recherche */}
      <View style={[styles.searchRow, { backgroundColor: c.inputBg }]}>
        <Text style={{ fontSize: 14, marginRight: 6 }}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: c.text }]}
          placeholder="Rechercher..."
          placeholderTextColor={c.placeholder}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text style={[styles.clearText, { color: c.placeholder }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres + tri */}
      <View style={styles.controls}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
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
                  ? `Tous (${total})`
                  : f === "fait"
                    ? `✓ ${done}`
                    : `○ ${total - done}`}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          {(["nom", "type"] as SortBy[]).map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.chip,
                {
                  borderColor: sortBy === s ? c.text : c.border,
                  backgroundColor: "transparent",
                },
              ]}
              onPress={() => setSortBy(s)}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: sortBy === s ? c.text : c.textSecondary,
                    fontWeight: sortBy === s ? "600" : "400",
                  },
                ]}
              >
                {s === "nom" ? "A→Z" : "Type"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Liste */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 32 }}>🔍</Text>
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>
              Aucun résultat
            </Text>
          </View>
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
                    location: obj.location ? JSON.stringify(obj.location) : "",
                  },
                })
              }
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.thumb,
                  {
                    backgroundColor: obj.done
                      ? domain.color + "22"
                      : c.border + "44",
                  },
                ]}
              >
                <Text style={{ fontSize: 20 }}>
                  {obj.done ? domain.icon : "📷"}
                </Text>
              </View>
              <View style={styles.info}>
                <Text
                  style={[styles.objName, { color: c.text }]}
                  numberOfLines={1}
                >
                  {obj.name}
                </Text>
                <Text style={[styles.objType, { color: c.textSecondary }]}>
                  {obj.type}
                </Text>
              </View>
              {obj.done && (
                <View
                  style={[styles.doneDot, { backgroundColor: domain.color }]}
                />
              )}
              <Text style={[styles.chevron, { color: c.textSecondary }]}>
                ›
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {domainId.startsWith("custom_") && (
        <View style={styles.customActions}>
          <TouchableOpacity
            style={[styles.addObjBtn, { backgroundColor: domain.color }]}
            onPress={() =>
              router.push({
                pathname: "/create-object",
                params: {
                  domainId: domain.id,
                  domainLabel: domain.label,
                  domainIcon: domain.icon,
                  domainColor: domain.color,
                },
              })
            }
          >
            <Text style={styles.addObjText}>+ Ajouter un objet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addObjBtn, { backgroundColor: c.backgroundCard }]}
            onPress={() =>
              router.push({
                pathname: "/create-domain",
                params: {
                  domainId: domain.id,
                  editLabel: domain.label,
                  editIcon: domain.icon,
                  editColor: domain.color,
                },
              })
            }
          >
            <Text style={[styles.addObjText, { color: c.text }]}>
              Modifier le domaine
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteBtn, { borderColor: c.border }]}
            onPress={() => {
              Alert.alert(
                "Supprimer le domaine",
                `Supprimer "${domain.label}" et tous ses objets ?`,
                [
                  { text: "Annuler", style: "cancel" },
                  {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                      await deleteDomain(domainId);
                      router.back();
                    },
                  },
                ],
              );
            }}
          >
            <Text style={[styles.deleteBtnText, { color: c.btnDanger }]}>
              Supprimer le domaine
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    marginBottom: 10,
  },
  backText: {
    fontSize: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  headerIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    marginTop: 1,
  },
  headerBar: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  headerFill: {
    height: 3,
    borderRadius: 2,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  clearText: {
    fontSize: 13,
    padding: 4,
  },
  controls: {
    marginBottom: 10,
  },
  chips: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
  divider: {
    width: 1,
    height: 20,
    marginHorizontal: 4,
  },
  list: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 12,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  objName: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  objType: {
    fontSize: 12,
    marginTop: 2,
  },
  doneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chevron: {
    fontSize: 20,
    fontWeight: "300",
  },
  addObjBtn: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  addObjText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  customActions: {
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 8,
  },
  addObjBtn: {
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  addObjText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteBtn: {
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
