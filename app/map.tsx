import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { CatalogueObject, Domain, loadData } from "./storage/catalogue";
import { useTheme } from "./theme/useTheme";

const { height } = Dimensions.get("window");

type MarkerData = {
  object: CatalogueObject;
  domain: Domain;
};

const DOMAIN_COLORS: Record<string, string> = {
  astro: "#5DCAA5",
  fleurs: "#D4537E",
  arbres: "#639922",
  oiseaux: "#378ADD",
};

export default function MapScreen() {
  const router = useRouter();
  const c = useTheme();
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selected, setSelected] = useState<MarkerData | null>(null);
  const mapRef = useRef<MapView>(null);

  useFocusEffect(
    useCallback(() => {
      loadData().then((domains) => {
        const all: MarkerData[] = [];
        domains.forEach((domain) => {
          domain.objects.forEach((obj) => {
            if (obj.done && obj.location) all.push({ object: obj, domain });
          });
        });
        setMarkers(all);
        if (all.length > 0 && mapRef.current) {
          const first = all[0].object.location!;
          mapRef.current.animateToRegion(
            {
              latitude: first.latitude,
              longitude: first.longitude,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            },
            500,
          );
        }
      });
    }, []),
  );

  return (
    <View style={styles.container}>
      {/* Header flottant */}
      <View
        style={[
          styles.floatingHeader,
          { backgroundColor: c.background + "ee" },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backText, { color: c.textSecondary }]}>
            ← Accueil
          </Text>
        </TouchableOpacity>
        <View style={styles.headerBottom}>
          <Text style={[styles.title, { color: c.text }]}>Mes spots</Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            {markers.length} photo{markers.length > 1 ? "s" : ""} localisée
            {markers.length > 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {markers.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: c.background }]}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={[styles.emptyTitle, { color: c.text }]}>
            Aucun spot pour l'instant
          </Text>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>
            Tes prises de vue apparaîtront ici une fois localisées.
          </Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: markers[0]?.object.location?.latitude ?? 46.5,
            longitude: markers[0]?.object.location?.longitude ?? 2.5,
            latitudeDelta: 5,
            longitudeDelta: 5,
          }}
        >
          {markers.map((m) => (
            <Marker
              key={`${m.domain.id}-${m.object.id}`}
              coordinate={m.object.location!}
              pinColor={DOMAIN_COLORS[m.domain.id] ?? "#888"}
              onPress={() => setSelected(m)}
            />
          ))}
        </MapView>
      )}

      {/* Légende flottante */}
      <View style={[styles.legend, { backgroundColor: c.background + "ee" }]}>
        {Object.entries(DOMAIN_COLORS).map(([id, color]) => {
          const count = markers.filter((m) => m.domain.id === id).length;
          const icon =
            id === "astro"
              ? "🔭"
              : id === "fleurs"
                ? "🌸"
                : id === "arbres"
                  ? "🌲"
                  : "🦅";
          return (
            <View key={id} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendIcon}>{icon}</Text>
              <Text
                style={[
                  styles.legendCount,
                  { color: c.text, fontWeight: "600" },
                ]}
              >
                {count}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Modal détail */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelected(null)}
        >
          <View style={[styles.modalCard, { backgroundColor: c.background }]}>
            <View style={[styles.modalHandle, { backgroundColor: c.border }]} />
            {selected?.object.photoUri && (
              <Image
                source={{ uri: selected.object.photoUri }}
                style={styles.modalPhoto}
              />
            )}
            <View style={styles.modalBody}>
              <View
                style={[
                  styles.modalDomainBadge,
                  {
                    backgroundColor:
                      DOMAIN_COLORS[selected?.domain.id ?? ""] + "22",
                  },
                ]}
              >
                <Text style={{ fontSize: 16 }}>{selected?.domain.icon}</Text>
                <Text
                  style={[
                    styles.modalDomainLabel,
                    { color: DOMAIN_COLORS[selected?.domain.id ?? ""] },
                  ]}
                >
                  {selected?.domain.label}
                </Text>
              </View>
              <Text style={[styles.modalName, { color: c.text }]}>
                {selected?.object.name}
              </Text>
              <Text style={[styles.modalType, { color: c.textSecondary }]}>
                {selected?.object.type}
              </Text>
              {selected?.object.date && (
                <Text style={[styles.modalDate, { color: c.textSecondary }]}>
                  📅 {selected.object.date}
                </Text>
              )}
              {selected?.object.notes ? (
                <Text
                  style={[styles.modalNotes, { color: c.textSecondary }]}
                  numberOfLines={2}
                >
                  {selected.object.notes}
                </Text>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backText: { fontSize: 14, marginBottom: 6 },
  headerBottom: { gap: 2 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 13 },
  map: { flex: 1 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 40,
    marginTop: height * 0.2,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  legend: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 14,
    paddingBottom: 30,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendIcon: { fontSize: 14 },
  legendCount: { fontSize: 14 },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000055",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  modalPhoto: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  modalBody: {
    padding: 20,
    paddingBottom: 36,
    gap: 6,
  },
  modalDomainBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 4,
  },
  modalDomainLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  modalName: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  modalType: { fontSize: 13 },
  modalDate: { fontSize: 12, marginTop: 2 },
  modalNotes: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
    fontStyle: "italic",
  },
});
