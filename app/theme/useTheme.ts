import { useColorScheme } from "react-native";
import { Colors, ColorScheme } from "./colors";

export function useTheme(): ColorScheme {
  const scheme = useColorScheme();
  return scheme === "dark" ? Colors.dark : Colors.light;
}
