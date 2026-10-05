// Rule U3: the progress bar is a platform pair, `lesson-progress.ios.tsx` (SwiftUI ProgressView)
// and `lesson-progress.android.tsx` (Compose LinearProgressIndicator). Metro picks the file for
// the platform; this declaration is the one shape both export, for the type checker.
import type { JSX } from "react";

export type LessonProgressProps = {
  // The share of the lesson answered, from 0 to 1
  done: number;
  colour: string;
  trackColour: string;
};

export declare function LessonProgress(props: LessonProgressProps): JSX.Element;
