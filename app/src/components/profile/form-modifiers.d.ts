// Rule U3: what the settings form needs from one platform only. On iOS SwiftUI's Form draws its
// own grouped background, which hides a background colour until it is turned off
// (form-modifiers.ios.ts); Compose's column takes the colour as it is (form-modifiers.android.ts).
import type { ModifierConfig } from "@expo/ui/swift-ui/modifiers";

export declare const FORM_MODIFIERS: ModifierConfig[];
