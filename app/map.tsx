import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { CatalogueObject, Domain, loadData } from "./storage/catalogue";
import { useTheme } from "./theme/useTheme";

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
            if (obj.done && obj.location) {
              all.push({ object: obj, domain });
            }
          });
        });
        setMarkers(all);

        // Centre la carte sur le premier marqueur
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
      <View style={[styles.header, { backgroundColor: c.background }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backText, { color: c.textSecondary }]}>
            ← Accueil
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.text }]}>Mes spots</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          {markers.length} photo{markers.length > 1 ? "s" : ""} localisée
          {markers.length > 1 ? "s" : ""}
        </Text>
      </View>

      {markers.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: c.background }]}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>
            Aucune photo localisée pour l'instant.{"\n"}Prends des photos pour
            voir tes spots ici !
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

      {/* Legende */}
      <View style={[styles.legend, { backgroundColor: c.background }]}>
        {Object.entries(DOMAIN_COLORS).map(([id, color]) => {
          const count = markers.filter((m) => m.domain.id === id).length;
          const domain = markers.find((m) => m.domain.id === id)?.domain;
          if (!domain && count === 0) return null;
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
              <Text style={[styles.legendCount, { color: c.textSecondary }]}>
                {count}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Modal detail */}
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
          <View
            style={[styles.modalCard, { backgroundColor: c.backgroundCard }]}
          >
            {selected?.object.photoUri && (
              <Image
                source={{ uri: selected.object.photoUri }}
                style={styles.modalPhoto}
              />
            )}
            <View style={styles.modalBody}>
              <Text style={styles.modalDomainIcon}>
                {selected?.domain.icon}
              </Text>
              <View style={{ flex: 1 }}>
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
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  backText: {
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  map: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    paddingBottom: 28,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendIcon: {
    fontSize: 14,
  },
  legendCount: {
    fontSize: 13,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000044",
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  modalPhoto: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  modalBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    paddingBottom: 32,
  },
  modalDomainIcon: {
    fontSize: 32,
  },
  modalName: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalType: {
    fontSize: 13,
    marginTop: 2,
  },
  modalDate: {
    fontSize: 12,
    marginTop: 4,
  },
});
