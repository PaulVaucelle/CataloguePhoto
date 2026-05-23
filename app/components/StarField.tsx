import { useEffect } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");
const NUM_STARS = 80;

type Star = {
  x: number;
  y: number;
  size: number;
  opacity: Animated.Value;
  duration: number;
  delay: number;
};

function generateStars(): Star[] {
  return Array.from({ length: NUM_STARS }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2.5 + 0.5,
    opacity: new Animated.Value(Math.random()),
    duration: Math.random() * 2000 + 1500,
    delay: Math.random() * 3000,
  }));
}

const STARS = generateStars();

function StarDot({ star }: { star: Star }) {
  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(star.opacity, {
          toValue: Math.random() * 0.6 + 0.4,
          duration: star.duration,
          delay: star.delay,
          useNativeDriver: true,
        }),
        Animated.timing(star.opacity, {
          toValue: Math.random() * 0.2,
          duration: star.duration,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          opacity: star.opacity,
        },
      ]}
    />
  );
}

export default function StarField() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {STARS.map((star, i) => (
        <StarDot key={i} star={star} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: "absolute",
    backgroundColor: "#ffffff",
  },
});
