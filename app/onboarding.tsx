import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "./theme/useTheme";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    icon: "🌿",
    title: "Bienvenue sur\nNatureScope",
    subtitle: "Capture Earth's Wonders",
    description:
      "Catalogue tes observations du monde naturel et suis ta progression au fil de tes aventures.",
    color: "#3D6B47",
  },
  {
    icon: "🔭",
    title: "900+ objets\nà découvrir",
    subtitle: "Un catalogue exhaustif",
    description:
      "Astres, fleurs, arbres, oiseaux, minéraux, champignons et pays du monde entier t'attendent.",
    color: "#1B3A5C",
  },
  {
    icon: "📷",
    title: "Photographie\net identifie",
    subtitle: "Reconnaissance intelligente",
    description:
      "Prends une photo, localise ta découverte sur la carte et laisse Pl@ntNet identifier tes plantes.",
    color: "#C4853A",
  },
  {
    icon: "🏅",
    title: "Gagne des\nbadges",
    subtitle: "Récompenses et progression",
    description:
      "Débloque des badges au fil de tes découvertes et constitue ton album photo personnel.",
    color: "#9B6DCA",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const c = useTheme();
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function goTo(index: number) {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setCurrent(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  }

  function handleNext() {
    if (current < SLIDES.length - 1) {
      goTo(current + 1);
    } else {
      handleFinish();
    }
  }

  async function handleFinish() {
    await AsyncStorage.setItem("onboarding_done", "1");
    router.replace("/");
  }

  const slide = SLIDES[current];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
      >
        {SLIDES.map((s, i) => (
          <Animated.View
            key={i}
            style={[
              styles.slide,
              { width, opacity: i === current ? fadeAnim : 1 },
            ]}
          >
            {/* Icon */}
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: s.color + "18",
                  borderColor: s.color + "33",
                },
              ]}
            >
              <Text style={styles.icon}>{s.icon}</Text>
            </View>

            {/* Texte */}
            <Text style={[styles.title, { color: c.text }]}>{s.title}</Text>
            <Text style={[styles.subtitle, { color: s.color }]}>
              {s.subtitle}
            </Text>
            <Text style={[styles.description, { color: c.textSecondary }]}>
              {s.description}
            </Text>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Indicateurs */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === current ? slide.color : c.border,
                    width: i === current ? 20 : 8,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Boutons */}
        <View style={styles.btnRow}>
          {current < SLIDES.length - 1 ? (
            <>
              <TouchableOpacity onPress={handleFinish} style={styles.skipBtn}>
                <Text style={[styles.skipText, { color: c.textSecondary }]}>
                  Passer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nextBtn, { backgroundColor: slide.color }]}
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <Text style={styles.nextBtnText}>Suivant →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: slide.color }]}
              onPress={handleFinish}
              activeOpacity={0.8}
            >
              <Text style={styles.nextBtnText}>Commencer 🌿</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 16,
    paddingBottom: 120,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    marginBottom: 16,
  },
  icon: { fontSize: 56 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 20,
    gap: 20,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  btnRow: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  skipBtn: {
    padding: 14,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "500",
  },
  nextBtn: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  startBtn: {
    width: "100%",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  nextBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
