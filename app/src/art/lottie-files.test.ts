import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { EFFECT_LOOPS, EFFECT_NAMES } from "@/art/effects";

const LOTTIE = fileURLToPath(new URL("../../../assets/lottie", import.meta.url));
const PLAYER = fileURLToPath(new URL("./effect.tsx", import.meta.url));
// Board item 49: every effect ends in under 1.5 s, as tools/build_lottie.py checks when it writes
const CEILING_S = 1.5;
const TRANSFORM_FIELDS = ["a", "o", "p", "r", "s"];

type Keyframe = { t: number; s: number[] };
type Shape = { ty: string; it?: Shape[] };
type Layer = { ind: number; ty: number; ip: number; op: number; st: number; ks: Record<string, unknown>; shapes: Shape[] };
type Animation = { v: string; fr: number; ip: number; op: number; w: number; h: number; assets: unknown[]; layers: Layer[] };

function load(name: string): Animation {
  return JSON.parse(readFileSync(`${LOTTIE}/${name}.json`, "utf8"));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Every animated property under a node, as its list of keyframes
function animated(node: unknown, found: Keyframe[][] = []): Keyframe[][] {
  if (Array.isArray(node)) node.forEach((child) => animated(child, found));
  else if (isRecord(node) && node.a === 1 && Array.isArray(node.k)) found.push(node.k);
  else if (isRecord(node)) Object.values(node).forEach((child) => animated(child, found));
  return found;
}

// Lottie reads a group's transform from the group's last item, so a group without one is broken
function groupsWithoutTransform(shapes: Shape[]): Shape[] {
  return shapes.flatMap((shape) => {
    if (shape.ty !== "gr") return [];
    const items = shape.it ?? [];
    const own = items.at(-1)?.ty === "tr" ? [] : [shape];
    return [...own, ...groupsWithoutTransform(items)];
  });
}

describe("the generated Lottie files", () => {
  it("are exactly the registered effects, and the player imports each one", () => {
    const files = readdirSync(LOTTIE)
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.slice(0, -".json".length));
    expect(files.sort()).toEqual([...EFFECT_NAMES].sort());
    const player = readFileSync(PLAYER, "utf8");
    expect(EFFECT_NAMES.filter((name) => !player.includes(`@art/lottie/${name}.json`))).toEqual([]);
  });

  it.each(EFFECT_NAMES)("%s has the top-level fields a Lottie player reads, and ends in time", (name) => {
    const file = load(name);
    expect(typeof file.v).toBe("string");
    expect(file.fr).toBe(60);
    expect(file.ip).toBe(0);
    expect(file.w).toBeGreaterThan(0);
    expect(file.h).toBeGreaterThan(0);
    expect(Array.isArray(file.assets)).toBe(true);
    expect(file.layers.length).toBeGreaterThan(0);
    expect((file.op - file.ip) / file.fr).toBeLessThan(CEILING_S);
  });

  it.each(EFFECT_NAMES)("%s has whole shape layers, each inside the animation's time", (name) => {
    const file = load(name);
    for (const layer of file.layers) {
      expect({ ty: layer.ty, st: layer.st }).toEqual({ ty: 4, st: 0 });
      expect(layer.ip).toBeGreaterThanOrEqual(0);
      expect(layer.ip).toBeLessThan(layer.op);
      expect(layer.op).toBeLessThanOrEqual(file.op);
      expect(Object.keys(layer.ks).sort()).toEqual(TRANSFORM_FIELDS);
      expect(layer.shapes.length).toBeGreaterThan(0);
      expect(groupsWithoutTransform(layer.shapes)).toEqual([]);
    }
    expect(new Set(file.layers.map((layer) => layer.ind)).size).toBe(file.layers.length);
  });

  it.each(EFFECT_NAMES)("%s has its keyframes in order, inside the animation's time", (name) => {
    const file = load(name);
    for (const frames of animated(file.layers)) {
      const times = frames.map((frame) => frame.t);
      expect(times.every((t, i) => i === 0 || t > times[i - 1])).toBe(true);
      expect(times[0]).toBeGreaterThanOrEqual(0);
      expect(times.at(-1)).toBeLessThanOrEqual(file.op);
      expect(frames.every((frame) => Array.isArray(frame.s))).toBe(true);
    }
  });

  it.each(EFFECT_NAMES.filter((name) => EFFECT_LOOPS[name]))("%s loops with no seam", (name) => {
    const file = load(name);
    // A layer that lives the whole loop must end on the pose it starts from; a layer that comes and
    // goes inside the loop (an ember) is hidden at both ends by its own in and out points
    const whole = file.layers.filter((layer) => layer.ip === 0 && layer.op === file.op);
    expect(whole.length).toBeGreaterThan(0);
    for (const frames of animated(whole)) {
      expect({ start: frames[0].t, end: frames.at(-1)?.t }).toEqual({ start: 0, end: file.op });
      expect(frames.at(-1)?.s).toEqual(frames[0].s);
    }
  });
});
