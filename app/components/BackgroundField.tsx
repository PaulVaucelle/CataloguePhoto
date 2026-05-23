import { useEffect } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get("window");
const NUM_ITEMS = 40;

const DOMAIN_CONFIG: Record<string, { emoji: string; size: number }> = {
  astro: { emoji: "⭐", size: 8 },
  fleurs: { emoji: "🌸", size: 22 },
  arbres: { emoji: "🌲", size: 26 },
  oiseaux: { emoji: "🐦", size: 20 },
};

type FloatingItem = {
  x: number;
  y: number;
  scale: number;
  opacity: Animated.Value;
  rotate: Animated.Value;
  duration: number;
  delay: number;
};

function generateItems(): FloatingItem[] {
  return Array.from({ length: NUM_ITEMS }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    scale: Math.random() * 0.6 + 0.4,
    opacity: new Animated.Value(Math.random() * 0.15 + 0.05),
    rotate: new Animated.Value(Math.random() * 360),
    duration: Math.random() * 3000 + 2000,
    delay: Math.random() * 4000,
  }));
}

const ITEMS = generateItems();

function FloatingEmoji({
  item,
  emoji,
  size,
}: {
  item: FloatingItem;
  emoji: string;
  size: number;
}) {
  useEffect(() => {
    const animateOpacity = () => {
      Animated.sequence([
        Animated.timing(item.opacity, {
          toValue: Math.random() * 0.2 + 0.05,
          duration: item.duration,
          delay: item.delay,
          useNativeDriver: true,
        }),
        Animated.timing(item.opacity, {
          toValue: Math.random() * 0.08,
          duration: item.duration,
          useNativeDriver: true,
        }),
      ]).start(() => animateOpacity());
    };

    const animateRotate = () => {
      Animated.sequence([
        Animated.timing(item.rotate, {
          toValue: Math.random() * 30 - 15,
          duration: item.duration * 2,
          useNativeDriver: true,
        }),
        Animated.timing(item.rotate, {
          toValue: Math.random() * 30 - 15,
          duration: item.duration * 2,
          useNativeDriver: true,
        }),
      ]).start(() => animateRotate());
    };

    animateOpacity();
    animateRotate();
  }, []);

  const rotate = item.rotate.interpolate({
    inputRange: [-360, 360],
    outputRange: ["-360deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        styles.item,
        {
          left: item.x,
          top: item.y,
          opacity: item.opacity,
          transform: [{ scale: item.scale }, { rotate }],
        },
      ]}
    >
      <Text style={{ fontSize: size }}>{emoji}</Text>
    </Animated.View>
  );
}

type Props = {
  domainId: string;
};

export default function BackgroundField({ domainId }: Props) {
  const config = DOMAIN_CONFIG[domainId];
  if (!config) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {ITEMS.map((item, i) => (
        <FloatingEmoji
          key={i}
          item={item}
          emoji={config.emoji}
          size={config.size}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    position: "absolute",
  },
});
