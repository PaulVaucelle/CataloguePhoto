import * as ImagePicker from "expo-image-picker";
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
import BackgroundField from "./components/BackgroundField";
import { loadData, saveData, toggleObject } from "./storage/catalogue";
import { useTheme } from "./theme/useTheme";

import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import BadgeUnlocked from "./components/BadgeUnlocked";
import { Badge, computeBadges } from "./storage/badge";

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

  async function handleCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission refusée",
        "Autorise l'accès à l'appareil photo dans les réglages.",
      );
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
      Alert.alert(
        "Permission refusée",
        "Autorise l'accès à la galerie dans les réglages.",
      );
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

    const dataBefore = await loadData();
    const badgesBefore = computeBadges(dataBefore)
      .filter((b) => b.unlocked)
      .map((b) => b.id);

    let location: { latitude: number; longitude: number } | undefined;
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.granted) {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
        location = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
      }
    } catch {}

    await toggleObject(domainId, id, { photoUri: uri, date: today, location });
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
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={[styles.backText, { color: c.textSecondary }]}>
          ← Catalogue
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.hero, { backgroundColor: c.heroBackground }]}
        onPress={handleAddPhoto}
        activeOpacity={0.85}
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.heroImage} />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={{ fontSize: 48 }}>📷</Text>
            <Text style={[styles.heroHint, { color: c.textSecondary }]}>
              Appuyer pour ajouter une photo
            </Text>
          </View>
        )}
        {isDone && (
          <View style={[styles.takenBadge, { backgroundColor: c.badgeDoneBg }]}>
            <Text style={[styles.takenText, { color: c.badgeDoneText }]}>
              Photographié
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[styles.objTitle, { color: c.text }]}>{name}</Text>
        <Text style={[styles.objType, { color: c.textSecondary }]}>{type}</Text>

        <View style={[styles.infoBlock, { backgroundColor: c.backgroundCard }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.lbl, { color: c.textSecondary }]}>Statut</Text>
            <Text
              style={[
                styles.val,
                { color: isDone ? c.badgeDoneText : c.textSecondary },
              ]}
            >
              {isDone ? "Photographié" : "Pas encore photographié"}
            </Text>
          </View>
          {domainId === "astro" && (
            <>
              <View style={styles.infoRow}>
                <Text style={[styles.lbl, { color: c.textSecondary }]}>
                  Constellation
                </Text>
                <Text style={[styles.val, { color: c.text }]}>
                  {constellation || "—"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.lbl, { color: c.textSecondary }]}>
                  Magnitude
                </Text>
                <Text style={[styles.val, { color: c.text }]}>
                  {magnitude || "—"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.lbl, { color: c.textSecondary }]}>
                  Distance
                </Text>
                <Text style={[styles.val, { color: c.text }]}>
                  {distance || "—"}
                </Text>
              </View>
            </>
          )}
          {domainId === "fleurs" && (
            <>
              <View style={styles.infoRow}>
                <Text style={[styles.lbl, { color: c.textSecondary }]}>
                  Famille
                </Text>
                <Text style={[styles.val, { color: c.text }]}>
                  {constellation || "—"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.lbl, { color: c.textSecondary }]}>
                  Floraison
                </Text>
                <Text style={[styles.val, { color: c.text }]}>
                  {magnitude || "—"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.lbl, { color: c.textSecondary }]}>
                  Habitat
                </Text>
                <Text style={[styles.val, { color: c.text }]}>
                  {distance || "—"}
                </Text>
              </View>
            </>
          )}
          {domainId === "arbres" && (
            <>
              <View style={styles.infoRow}>
                <Text style={[styles.lbl, { color: c.textSecondary }]}>
                  Famille
                </Text>
                <Text style={[styles.val, { color: c.text }]}>
                  {constellation || "—"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.lbl, { color: c.textSecondary }]}>
                  Feuillage
                </Text>
                <Text style={[styles.val, { color: c.text }]}>
                  {magnitude || "—"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.lbl, { color: c.textSecondary }]}>
                  Habitat
                </Text>
                <Text style={[styles.val, { color: c.text }]}>
                  {distance || "—"}
                </Text>
              </View>
            </>
          )}
          {domainId === "oiseaux" && (
            <>
              <View style={styles.infoRow}>
                <Text style={[styles.lbl, { color: c.textSecondary }]}>
                  Ordre
                </Text>
                <Text style={[styles.val, { color: c.text }]}>
                  {constellation || "—"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.lbl, { color: c.textSecondary }]}>
                  Envergure
                </Text>
                <Text style={[styles.val, { color: c.text }]}>
                  {magnitude || "—"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.lbl, { color: c.textSecondary }]}>
                  Habitat
                </Text>
                <Text style={[styles.val, { color: c.text }]}>
                  {distance || "—"}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={[styles.infoBlock, { backgroundColor: c.backgroundCard }]}>
          <Text style={[styles.notesLabel, { color: c.textSecondary }]}>
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
            numberOfLines={4}
          />
        </View>

        {location && (
          <View
            style={[styles.infoBlock, { backgroundColor: c.backgroundCard }]}
          >
            <Text style={[styles.notesLabel, { color: c.textSecondary }]}>
              Lieu de prise de vue
            </Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker coordinate={location} />
            </MapView>
          </View>
        )}

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: c.btnPrimary }]}
          onPress={handleAddPhoto}
          disabled={saving}
        >
          <Text style={[styles.addBtnText, { color: c.btnPrimaryText }]}>
            {saving
              ? "Sauvegarde..."
              : isDone
                ? "Changer la photo"
                : "Ajouter une photo"}
          </Text>
        </TouchableOpacity>

        {isDone && (
          <TouchableOpacity
            style={[styles.removeBtn, { borderColor: c.border }]}
            onPress={handleRemove}
            disabled={saving}
          >
            <Text style={[styles.removeBtnText, { color: c.btnDanger }]}>
              Marquer comme non photographié
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <BadgeUnlocked badge={newBadge} onHide={() => setNewBadge(null)} />
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
    marginBottom: 8,
  },
  backText: {
    fontSize: 14,
  },
  hero: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroPlaceholder: {
    alignItems: "center",
    gap: 8,
  },
  heroHint: {
    fontSize: 13,
  },
  takenBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  takenText: {
    fontSize: 11,
  },
  body: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
  objTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  objType: {
    fontSize: 13,
    marginTop: 2,
  },
  infoBlock: {
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lbl: {
    fontSize: 13,
  },
  val: {
    fontSize: 13,
    fontWeight: "500",
  },
  notesLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  notesInput: {
    fontSize: 13,
    lineHeight: 20,
    minHeight: 80,
    textAlignVertical: "top",
  },
  addBtn: {
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: "500",
  },
  removeBtn: {
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  removeBtnText: {
    fontSize: 14,
  },
  map: {
    height: 150,
    borderRadius: 10,
    marginTop: 6,
    overflow: "hidden",
  },
});
