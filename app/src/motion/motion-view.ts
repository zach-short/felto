import Animated from "react-native-reanimated";

// BD-G3: the view a component draws when it moves. Components take this and a style from a hook
// of this module, never Reanimated itself, so GF-1's fallback to React Native's own Animated
// changes this folder and nothing outside it.
export const MotionView = Animated.View;
