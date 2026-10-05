import { scrollContentBackground } from "@expo/ui/swift-ui/modifiers";

// Turns off the Form's own grouped background, so the page colour shows behind the sections (D16)
export const FORM_MODIFIERS = [scrollContentBackground("hidden")];
