import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import { DeviceMotion } from "expo-sensors";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { CatalogueObject, loadData } from "./storage/catalogue";
import { useTheme } from "./theme/useTheme";

const { width, height } = Dimensions.get("window");

// Coordonnees RA/Dec des objets Messier (J2000)
const OBJECT_COORDS: Record<string, { ra: number; dec: number }> = {
  m1: { ra: 83.82, dec: 22.01 },
  m2: { ra: 323.36, dec: -0.82 },
  m3: { ra: 205.55, dec: 28.38 },
  m4: { ra: 245.9, dec: -26.53 },
  m5: { ra: 229.64, dec: 2.08 },
  m8: { ra: 270.92, dec: -24.38 },
  m13: { ra: 250.42, dec: 36.46 },
  m15: { ra: 322.49, dec: 12.17 },
  m16: { ra: 274.7, dec: -13.79 },
  m17: { ra: 275.2, dec: -16.18 },
  m20: { ra: 270.63, dec: -23.03 },
  m22: { ra: 279.1, dec: -23.91 },
  m27: { ra: 299.9, dec: 22.72 },
  m31: { ra: 10.68, dec: 41.27 },
  m32: { ra: 10.67, dec: 40.87 },
  m33: { ra: 23.46, dec: 30.66 },
  m34: { ra: 40.52, dec: 42.75 },
  m35: { ra: 92.27, dec: 24.33 },
  m36: { ra: 84.07, dec: 34.14 },
  m37: { ra: 88.06, dec: 32.55 },
  m38: { ra: 82.19, dec: 35.85 },
  m39: { ra: 323.91, dec: 48.44 },
  m41: { ra: 101.5, dec: -20.73 },
  m42: { ra: 83.82, dec: -5.39 },
  m43: { ra: 83.88, dec: -5.27 },
  m44: { ra: 130.1, dec: 19.62 },
  m45: { ra: 56.87, dec: 24.12 },
  m51: { ra: 202.47, dec: 47.2 },
  m52: { ra: 351.2, dec: 61.59 },
  m57: { ra: 283.4, dec: 33.03 },
  m63: { ra: 198.96, dec: 42.03 },
  m64: { ra: 194.18, dec: 21.68 },
  m65: { ra: 169.73, dec: 13.09 },
  m66: { ra: 170.06, dec: 12.99 },
  m74: { ra: 24.17, dec: 15.78 },
  m76: { ra: 25.58, dec: 51.57 },
  m77: { ra: 40.67, dec: -0.01 },
  m78: { ra: 86.69, dec: 0.07 },
  m81: { ra: 148.89, dec: 69.07 },
  m82: { ra: 148.97, dec: 69.68 },
  m83: { ra: 204.25, dec: -29.87 },
  m87: { ra: 187.71, dec: 12.39 },
  m92: { ra: 259.28, dec: 43.14 },
  m97: { ra: 168.7, dec: 55.02 },
  m101: { ra: 210.8, dec: 54.35 },
  m104: { ra: 189.99, dec: -11.62 },
  m106: { ra: 184.74, dec: 47.3 },
  m110: { ra: 10.09, dec: 41.68 },
};

// Conversion degres -> radians
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

// Calcul Temps Sideral Local
function localSiderealTime(lon: number): number {
  const now = new Date();
  const jd =
    367 * now.getFullYear() -
    Math.floor(
      (7 * (now.getFullYear() + Math.floor((now.getMonth() + 10) / 12))) / 4,
    ) +
    Math.floor((275 * (now.getMonth() + 1)) / 9) +
    now.getDate() +
    1721013.5 +
    (now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600) / 24;
  const t = (jd - 2451545.0) / 36525;
  let gst =
    280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * t * t;
  gst = ((gst % 360) + 360) % 360;
  return (((gst + lon) % 360) + 360) % 360;
}

// Conversion RA/Dec -> Azimut/Altitude
function raDecToAltAz(
  ra: number,
  dec: number,
  lat: number,
  lon: number,
): { alt: number; az: number } {
  const lst = localSiderealTime(lon);
  const ha = toRad(lst - ra);
  const latRad = toRad(lat);
  const decRad = toRad(dec);
  const sinAlt =
    Math.sin(decRad) * Math.sin(latRad) +
    Math.cos(decRad) * Math.cos(latRad) * Math.cos(ha);
  const alt = toDeg(Math.asin(Math.max(-1, Math.min(1, sinAlt))));
  const cosAz =
    (Math.sin(decRad) - Math.sin(toRad(alt)) * Math.sin(latRad)) /
    (Math.cos(toRad(alt)) * Math.cos(latRad));
  let az = toDeg(Math.acos(Math.max(-1, Math.min(1, cosAz))));
  if (Math.sin(ha) > 0) az = 360 - az;
  return { alt, az };
}

// Conversion Azimut/Altitude -> position ecran
function altAzToScreen(
  alt: number,
  az: number,
  deviceAz: number,
  deviceAlt: number,
  fovH: number,
  fovV: number,
) {
  let dAz = az - deviceAz;
  if (dAz > 180) dAz -= 360;
  if (dAz < -180) dAz += 360;
  const dAlt = alt - deviceAlt;
  const x = width / 2 + (dAz / fovH) * width;
  const y = height / 2 - (dAlt / fovV) * height;
  return { x, y };
}

type ObjectOnScreen = {
  obj: CatalogueObject;
  x: number;
  y: number;
  alt: number;
  az: number;
};

export default function SkyMapScreen() {
  const router = useRouter();
  const c = useTheme("astro");
  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [deviceAz, setDeviceAz] = useState(0);
  const [deviceAlt, setDeviceAlt] = useState(45);
  const [objects, setObjects] = useState<CatalogueObject[]>([]);
  const [visible, setVisible] = useState<ObjectOnScreen[]>([]);
  const [selected, setSelected] = useState<ObjectOnScreen | null>(null);
  const [showDone, setShowDone] = useState(true);
  const [showTodo, setShowTodo] = useState(true);
  const motionSub = useRef<any>(null);

  const FOV_H = 60;
  const FOV_V = 100;

  // Charge les objets astro
  useFocusEffect(
    useCallback(() => {
      loadData().then((domains) => {
        const astro = domains.find((d) => d.id === "astro");
        if (astro) setObjects(astro.objects);
      });
    }, []),
  );

  // GPS
  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ granted }) => {
      if (granted) {
        Location.getCurrentPositionAsync({}).then((loc) => {
          setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
        });
      }
    });
  }, []);

  // Gyroscope
  useEffect(() => {
    DeviceMotion.setUpdateInterval(100);
    motionSub.current = DeviceMotion.addListener((motion) => {
      if (!motion.rotation) return;
      const { alpha, beta, gamma } = motion.rotation;
      // alpha = rotation autour Z (azimut), beta = rotation autour X (altitude)
      const az = ((toDeg(alpha ?? 0) % 360) + 360) % 360;
      const alt = Math.max(-90, Math.min(90, toDeg(beta ?? 0) - 90));
      setDeviceAz(az);
      setDeviceAlt(alt);
    });
    return () => motionSub.current?.remove();
  }, []);

  // Calcul des objets visibles
  useEffect(() => {
    if (!location) return;
    const result: ObjectOnScreen[] = [];
    objects.forEach((obj) => {
      const coords = OBJECT_COORDS[obj.id];
      if (!coords) return;
      if (!showDone && obj.done) return;
      if (!showTodo && !obj.done) return;
      const { alt, az } = raDecToAltAz(
        coords.ra,
        coords.dec,
        location.lat,
        location.lon,
      );
      if (alt < -10) return; // Sous l'horizon
      const { x, y } = altAzToScreen(
        alt,
        az,
        deviceAz,
        deviceAlt,
        FOV_H,
        FOV_V,
      );
      if (x >= -20 && x <= width + 20 && y >= -20 && y <= height + 20) {
        result.push({ obj, x, y, alt, az });
      }
    });
    setVisible(result);
  }, [objects, location, deviceAz, deviceAlt, showDone, showTodo]);

  if (!permission?.granted) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: c.textSecondary }]}>
            ← Retour
          </Text>
        </TouchableOpacity>
        <View style={styles.center}>
          <Text style={{ fontSize: 48 }}>🔭</Text>
          <Text style={[styles.permTitle, { color: c.text }]}>
            Accès caméra requis
          </Text>
          <Text style={[styles.permText, { color: c.textSecondary }]}>
            La carte AR nécessite l'accès à la caméra pour superposer les objets
            célestes.
          </Text>
          <TouchableOpacity
            style={[styles.permBtn, { backgroundColor: "#5DCAA5" }]}
            onPress={requestPermission}
          >
            <Text style={styles.permBtnText}>Autoriser la caméra</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Caméra en fond */}
      <CameraView style={StyleSheet.absoluteFill} facing="back" />

      {/* Overlay sombre */}
      <View style={styles.overlay} pointerEvents="none" />

      {/* Objets célestes */}
      {visible.map((item) => (
        <TouchableOpacity
          key={item.obj.id}
          style={[
            styles.starDot,
            {
              left: item.x - 16,
              top: item.y - 16,
              borderColor: item.obj.done ? "#5DCAA5" : "#ffffff88",
            },
          ]}
          onPress={() => setSelected(item)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.starInner,
              { backgroundColor: item.obj.done ? "#5DCAA5" : "#ffffff55" },
            ]}
          />
          <Text style={styles.starLabel} numberOfLines={1}>
            {item.obj.name.split(" — ")[0]}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Carte du ciel</Text>
          <Text style={styles.headerSub}>{visible.length} objets visibles</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.coordText}>↑ {deviceAlt.toFixed(0)}°</Text>
          <Text style={styles.coordText}>⟳ {deviceAz.toFixed(0)}°</Text>
        </View>
      </View>

      {/* Filtres */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            { backgroundColor: showDone ? "#5DCAA5" : "#ffffff22" },
          ]}
          onPress={() => setShowDone((v) => !v)}
        >
          <Text style={styles.filterText}>✓ Photographiés</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            { backgroundColor: showTodo ? "#ffffff33" : "#ffffff11" },
          ]}
          onPress={() => setShowTodo((v) => !v)}
        >
          <Text style={styles.filterText}>○ À faire</Text>
        </TouchableOpacity>
      </View>

      {/* Viseur central */}
      <View style={styles.crosshair} pointerEvents="none">
        <View style={[styles.crossH, { backgroundColor: "#ffffff44" }]} />
        <View style={[styles.crossV, { backgroundColor: "#ffffff44" }]} />
      </View>

      {/* Modal détail objet */}
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
          <View style={[styles.modalCard, { backgroundColor: "#0D1520ee" }]}>
            <View
              style={[styles.modalHandle, { backgroundColor: "#ffffff33" }]}
            />
            <View style={styles.modalBody}>
              <View style={styles.modalTop}>
                <View>
                  <Text style={styles.modalName}>{selected?.obj.name}</Text>
                  <Text style={styles.modalType}>{selected?.obj.type}</Text>
                </View>
                <View
                  style={[
                    styles.modalStatus,
                    {
                      backgroundColor: selected?.obj.done
                        ? "#5DCAA522"
                        : "#ffffff11",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalStatusText,
                      { color: selected?.obj.done ? "#5DCAA5" : "#ffffff88" },
                    ]}
                  >
                    {selected?.obj.done ? "✓ Photographié" : "○ À faire"}
                  </Text>
                </View>
              </View>
              <View style={styles.modalMeta}>
                <View style={styles.modalMetaItem}>
                  <Text style={styles.modalMetaLabel}>Altitude</Text>
                  <Text style={styles.modalMetaValue}>
                    {selected?.alt.toFixed(1)}°
                  </Text>
                </View>
                <View style={styles.modalMetaItem}>
                  <Text style={styles.modalMetaLabel}>Azimut</Text>
                  <Text style={styles.modalMetaValue}>
                    {selected?.az.toFixed(1)}°
                  </Text>
                </View>
                <View style={styles.modalMetaItem}>
                  <Text style={styles.modalMetaLabel}>Type</Text>
                  <Text style={styles.modalMetaValue} numberOfLines={1}>
                    {selected?.obj.type}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => {
                  setSelected(null);
                  router.push({
                    pathname: "/detail",
                    params: {
                      id: selected?.obj.id ?? "",
                      domainId: "astro",
                      name: selected?.obj.name ?? "",
                      type: selected?.obj.type ?? "",
                      done: selected?.obj.done ? "1" : "0",
                      photoUri: selected?.obj.photoUri ?? "",
                      constellation: selected?.obj.constellation ?? "",
                      magnitude: selected?.obj.magnitude ?? "",
                      distance: selected?.obj.distance ?? "",
                      notes: selected?.obj.notes ?? "",
                      location: selected?.obj.location
                        ? JSON.stringify(selected.obj.location)
                        : "",
                    },
                  });
                }}
              >
                <Text style={styles.modalBtnText}>Voir la fiche →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00000022",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00000088",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff22",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: { color: "#fff", fontSize: 16 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  headerSub: { color: "#ffffff88", fontSize: 12, marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  coordText: { color: "#ffffff88", fontSize: 11 },
  filters: {
    position: "absolute",
    top: 110,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterText: { color: "#fff", fontSize: 13, fontWeight: "500" },
  starDot: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  starInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  starLabel: {
    position: "absolute",
    top: 34,
    color: "#ffffffcc",
    fontSize: 10,
    fontWeight: "600",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    width: 60,
    textAlign: "center",
    left: -14,
  },
  crosshair: {
    position: "absolute",
    top: height / 2 - 20,
    left: width / 2 - 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  crossH: { position: "absolute", width: 40, height: 1 },
  crossV: { position: "absolute", width: 1, height: 40 },
  backBtn: { padding: 20, paddingTop: 60 },
  backText: { fontSize: 14 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 40,
  },
  permTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  permText: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  permBtn: {
    borderRadius: 14,
    padding: 14,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  permBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000066",
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
  },
  modalBody: { padding: 20, paddingBottom: 36, gap: 14 },
  modalTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  modalName: { color: "#fff", fontSize: 18, fontWeight: "700" },
  modalType: { color: "#ffffff88", fontSize: 13, marginTop: 2 },
  modalStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalStatusText: { fontSize: 12, fontWeight: "600" },
  modalMeta: {
    flexDirection: "row",
    gap: 12,
  },
  modalMetaItem: {
    flex: 1,
    backgroundColor: "#ffffff11",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  modalMetaLabel: { color: "#ffffff66", fontSize: 11, marginBottom: 4 },
  modalMetaValue: { color: "#fff", fontSize: 14, fontWeight: "600" },
  modalBtn: {
    backgroundColor: "#5DCAA5",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  modalBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
