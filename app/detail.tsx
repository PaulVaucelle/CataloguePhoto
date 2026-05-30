import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import BackgroundField from "./components/BackgroundField";
import BadgeUnlocked from "./components/BadgeUnlocked";
import { Badge, computeBadges } from "./storage/badge";
import {
  deleteObject,
  loadData,
  saveData,
  toggleObject,
} from "./storage/catalogue";
import { useTheme } from "./theme/useTheme";

export default function DetailScreen() {
  const router = useRouter();
  const {
    id,
    domainId,
    name,
    type,
    done,
    photoUri: initialPhoto,
    constellation,
    magnitude,
    distance,
    notes: initialNotes,
    location: initialLocation,
  } = useLocalSearchParams<{
    id: string;
    domainId: string;
    name: string;
    type: string;
    done: string;
    photoUri: string;
    constellation: string;
    magnitude: string;
    distance: string;
    notes: string;
    location: string;
  }>();

  const c = useTheme(domainId);
  const [isDone, setIsDone] = useState(done === "1");
  const [photoUri, setPhotoUri] = useState<string | undefined>(
    initialPhoto || undefined,
  );
  const [notes, setNotes] = useState<string>(initialNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [location, setLocation] = useState<
    { latitude: number; longitude: number } | undefined
  >(initialLocation ? JSON.parse(initialLocation) : undefined);

  const meta =
    domainId === "astro"
      ? [
          { label: "Constellation", value: constellation },
          { label: "Magnitude", value: magnitude },
          { label: "Distance", value: distance },
        ]
      : domainId === "fleurs"
        ? [
            { label: "Famille", value: constellation },
            { label: "Floraison", value: magnitude },
            { label: "Habitat", value: distance },
          ]
        : domainId === "arbres"
          ? [
              { label: "Famille", value: constellation },
              { label: "Feuillage", value: magnitude },
              { label: "Habitat", value: distance },
            ]
          : domainId === "oiseaux"
            ? [
                { label: "Ordre", value: constellation },
                { label: "Envergure", value: magnitude },
                { label: "Habitat", value: distance },
              ]
            : domainId === "mineraux"
              ? [
                  { label: "Famille", value: constellation },
                  { label: "Dureté", value: magnitude },
                  { label: "Origine", value: distance },
                ]
              : domainId === "champignons"
                ? [
                    { label: "Famille", value: constellation },
                    { label: "Saison", value: magnitude },
                    { label: "Habitat", value: distance },
                  ]
                : domainId === "pays"
                  ? [
                      { label: "Capitale", value: constellation },
                      { label: "Population", value: magnitude },
                      { label: "Superficie", value: distance },
                    ]
                  : [];

  async function handleCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission refusée", "Autorise l'accès à l'appareil photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) await savePhoto(result.assets[0].uri);
  }

  async function handleGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission refusée", "Autorise l'accès à la galerie.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) await savePhoto(result.assets[0].uri);
  }

  async function savePhoto(uri: string) {
    setSaving(true);
    const today = new Date().toLocaleDateString("fr-FR");
    let loc: { latitude: number; longitude: number } | undefined;
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.granted) {
        const l = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
        loc = { latitude: l.coords.latitude, longitude: l.coords.longitude };
        setLocation(loc);
      }
    } catch {}

    const dataBefore = await loadData();
    const badgesBefore = computeBadges(dataBefore)
      .filter((b) => b.unlocked)
      .map((b) => b.id);
    await toggleObject(domainId, id, {
      photoUri: uri,
      date: today,
      location: loc,
    });
    setPhotoUri(uri);
    setIsDone(true);

    const dataAfter = await loadData();
    const badgesAfter = computeBadges(dataAfter);
    const newlyUnlocked = badgesAfter.find(
      (b) => b.unlocked && !badgesBefore.includes(b.id),
    );
    if (newlyUnlocked) setNewBadge(newlyUnlocked);
    setSaving(false);
  }

  async function handleRemove() {
    Alert.alert(
      "Retirer du catalogue",
      "Supprimer la photo et marquer comme non photographié ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          style: "destructive",
          onPress: async () => {
            setSaving(true);
            await toggleObject(domainId, id);
            setPhotoUri(undefined);
            setIsDone(false);
            setLocation(undefined);
            setSaving(false);
          },
        },
      ],
    );
  }

  function handleAddPhoto() {
    Alert.alert("Ajouter une photo", "Choisir la source", [
      { text: "Appareil photo", onPress: handleCamera },
      { text: "Galerie", onPress: handleGallery },
      { text: "Annuler", style: "cancel" },
    ]);
  }

  async function handleNotesBlur() {
    const data = await loadData();
    const domain = data.find((d) => d.id === domainId);
    if (!domain) return;
    const obj = domain.objects.find((o) => o.id === id);
    if (!obj) return;
    obj.notes = notes;
    await saveData(data);
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <BackgroundField domainId={domainId} />
      <BadgeUnlocked badge={newBadge} onHide={() => setNewBadge(null)} />

      {/* Hero photo */}
      <TouchableOpacity
        style={[styles.hero, { backgroundColor: c.heroBackground }]}
        onPress={handleAddPhoto}
        activeOpacity={0.9}
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.heroImage} />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={{ fontSize: 40 }}>📷</Text>
            <Text style={[styles.heroHint, { color: "#ffffff88" }]}>
              Toucher pour ajouter une photo
            </Text>
          </View>
        )}
        <View style={styles.heroOverlay}>
          <TouchableOpacity
            style={styles.heroBack}
            onPress={() => router.back()}
          >
            <Text style={styles.heroBackText}>‹</Text>
          </TouchableOpacity>
          {isDone && (
            <View style={[styles.donePill, { backgroundColor: c.badgeDoneBg }]}>
              <Text style={[styles.donePillText, { color: c.badgeDoneText }]}>
                ✓ Photographié
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Titre */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.objTitle, { color: c.text }]}>{name}</Text>
            <Text style={[styles.objType, { color: c.textSecondary }]}>
              {type}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.photoBtn,
              {
                backgroundColor: c.backgroundCard,
                borderColor: c.border,
                borderWidth: 1,
              },
            ]}
            onPress={handleAddPhoto}
            disabled={saving}
          >
            <Text style={{ fontSize: 18 }}>📷</Text>
          </TouchableOpacity>
        </View>

        {/* Métadonnées */}
        {meta.length > 0 && (
          <View style={[styles.card, { backgroundColor: c.backgroundCard }]}>
            <Text
              style={[styles.cardLabel, { color: c.accent ?? c.textSecondary }]}
            >
              Informations
            </Text>
            {meta.map((m, i) => (
              <View
                key={i}
                style={[
                  styles.metaRow,
                  i < meta.length - 1 && {
                    borderBottomWidth: 0.5,
                    borderBottomColor: c.border,
                  },
                ]}
              >
                <Text style={[styles.metaLabel, { color: c.textSecondary }]}>
                  {m.label}
                </Text>
                <Text style={[styles.metaValue, { color: c.text }]}>
                  {m.value || "—"}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        <View style={[styles.card, { backgroundColor: c.backgroundCard }]}>
          <Text
            style={[styles.cardLabel, { color: c.accent ?? c.textSecondary }]}
          >
            Notes
          </Text>
          <TextInput
            style={[styles.notesInput, { color: c.text }]}
            value={notes}
            onChangeText={setNotes}
            onBlur={handleNotesBlur}
            placeholder="Ajouter des notes..."
            placeholderTextColor={c.placeholder}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Carte */}
        {location && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: c.backgroundCard,
                padding: 0,
                overflow: "hidden",
              },
            ]}
          >
            <MapView
              style={styles.map}
              initialRegion={{
                ...location,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker coordinate={location} />
            </MapView>
            <View style={{ padding: 12 }}>
              <Text
                style={[
                  styles.cardLabel,
                  { color: c.accent ?? c.textSecondary },
                ]}
              >
                Lieu de prise de vue
              </Text>
              <Text
                style={[
                  styles.metaValue,
                  { color: c.text, fontSize: 12, marginTop: 2 },
                ]}
              >
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        {isDone && (
          <TouchableOpacity
            style={[styles.removeBtn, { borderColor: c.border }]}
            onPress={handleRemove}
            disabled={saving}
          >
            <Text style={[styles.removeBtnText, { color: c.btnDanger }]}>
              {saving ? "Sauvegarde..." : "Retirer du catalogue"}
            </Text>
          </TouchableOpacity>
        )}

        {domainId.startsWith("custom_") && (
          <>
            <TouchableOpacity
              style={[styles.removeBtn, { borderColor: c.border }]}
              onPress={() =>
                router.push({
                  pathname: "/create-object",
                  params: {
                    domainId,
                    domainLabel: "",
                    domainIcon: "",
                    domainColor: "",
                    objectId: id,
                    editName: name,
                    editType: type,
                  },
                })
              }
            >
              <Text style={[styles.removeBtnText, { color: c.text }]}>
                Modifier l'objet
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.removeBtn, { borderColor: c.border }]}
              onPress={() =>
                Alert.alert(
                  "Supprimer l'objet",
                  `Supprimer "${name}" définitivement ?`,
                  [
                    { text: "Annuler", style: "cancel" },
                    {
                      text: "Supprimer",
                      style: "destructive",
                      onPress: async () => {
                        await deleteObject(domainId, id);
                        router.back();
                      },
                    },
                  ],
                )
              }
            >
              <Text style={[styles.removeBtnText, { color: c.btnDanger }]}>
                Supprimer l'objet
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    height: 260,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  heroHint: { fontSize: 13 },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingTop: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#00000055",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBackText: { color: "#fff", fontSize: 24, lineHeight: 28 },
  donePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  donePillText: { fontSize: 12, fontWeight: "600" },
  body: {
    padding: 20,
    gap: 12,
    paddingBottom: 48,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  objTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  objType: { fontSize: 13, marginTop: 2 },
  photoBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 0,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  metaLabel: { fontSize: 14 },
  metaValue: { fontSize: 14, fontWeight: "500" },
  notesInput: {
    fontSize: 14,
    lineHeight: 22,
    minHeight: 70,
    textAlignVertical: "top",
  },
  map: { height: 140 },
  removeBtn: {
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  removeBtnText: { fontSize: 14, fontWeight: "500" },
});
