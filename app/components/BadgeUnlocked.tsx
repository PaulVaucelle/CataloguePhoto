import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Badge } from "./storage/badge";

type Props = {
  badge: Badge | null;
  onHide: () => void;
};

export default function BadgeUnlocked({ badge, onHide }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(40)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (!badge) return;

    // Apparition
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 6,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }),
    ]).start();

    // Disparition apres 3 secondes
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }, 3000);

    return () => clearTimeout(timer);
  }, [badge]);

  if (!badge) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform: [{ translateY }, { scale }] },
      ]}
    >
      <View style={styles.popup}>
        <Text style={styles.newBadge}>Nouveau badge !</Text>
        <Text style={styles.icon}>{badge.icon}</Text>
        <Text style={styles.label}>{badge.label}</Text>
        <Text style={styles.desc}>{badge.description}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    zIndex: 999,
    alignItems: "center",
  },
  popup: {
    backgroundColor: "#0f0f2e",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#5DCAA5",
    shadowColor: "#5DCAA5",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    width: "100%",
    gap: 6,
  },
  newBadge: {
    fontSize: 12,
    color: "#5DCAA5",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  icon: {
    fontSize: 48,
    marginVertical: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e8e8ff",
  },
  desc: {
    fontSize: 12,
    color: "#7070aa",
    textAlign: "center",
  },
});
