import { useColorScheme } from "react-native";
import { Colors, ColorScheme } from "./colors";

export function useTheme(domainId?: string): ColorScheme {
  const scheme = useColorScheme();
  if (domainId === "astro") return Colors.space as ColorScheme;
  return scheme === "dark" ? Colors.dark : Colors.light;
}
