export type StoryTap = "back" | "forward";

// US-6: a tap left of the zone line goes back a slide, and any other tap goes forward, the common
// action. A tap on the line itself goes forward, and so does a press that came with no position
// (x is NaN), so no tap is ever lost. `width` is the screen's, not the column's.
export function storyTapAction(x: number, width: number, zone: number): StoryTap {
  return x < width * zone ? "back" : "forward";
}
