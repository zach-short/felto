import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { CELEBRATION_NAMES, type CelebrationName } from "@/art/celebrations";

const CELEBRATIONS = fileURLToPath(new URL("../../../assets/celebrations", import.meta.url));
const PLAYER = fileURLToPath(new URL("./celebration.tsx", import.meta.url));
// GF-22: every celebration ends in under 2.5 s, as tools/build_celebrations.py checks when it writes
const CEILING_S = 2.5;
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
// The zip records this reader walks, from PKWARE's APPNOTE.TXT 6.3.10: the local file header
// (4.3.7), the central directory header (4.3.12) and the end of central directory record (4.3.16)
const LOCAL = 0x04034b50;
const CENTRAL = 0x02014b50;
const END_OF_DIRECTORY = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
const STORED = 0;
// The layers that last the whole animation; every other layer is a particle
const WHOLE_LAYERS = ["rays", "fit", "hero"];

type Entry = { name: string; data: Buffer; next: number };
type Keyframe = { t: number; s: number[] };
type Track = { a: 0; k: number | number[] } | { a: 1; k: Keyframe[] };
type Layer = { ind: number; ty: number; nm: string; ip: number; op: number; refId?: string; parent?: number; ks: Record<string, Track> };
type ImageAsset = { id: string; w: number; h: number; u: string; p: string; e: number };
type Animation = { fr: number; ip: number; op: number; w: number; h: number; assets: ImageAsset[]; layers: Layer[] };
type Manifest = { version: string; animations: { id: string; loop: boolean }[] };

// An entry's bytes start after its local header, whose name and extra field carry their own lengths
function localData(zip: Buffer, at: number, size: number): Buffer {
  if (zip.readUInt32LE(at) !== LOCAL) throw new Error(`no local file header at ${at}`);
  const start = at + 30 + zip.readUInt16LE(at + 26) + zip.readUInt16LE(at + 28);
  return zip.subarray(start, start + size);
}

// One central directory record: the entry's name, its stored bytes and where the next record starts
function centralRecord(zip: Buffer, at: number): Entry {
  if (zip.readUInt32LE(at) !== CENTRAL) throw new Error(`no central directory header at ${at}`);
  if (zip.readUInt16LE(at + 10) !== STORED) throw new Error(`a compressed entry at ${at}; the generator stores every entry`);
  const nameLength = zip.readUInt16LE(at + 28);
  const name = zip.toString("utf8", at + 46, at + 46 + nameLength);
  const next = at + 46 + nameLength + zip.readUInt16LE(at + 30) + zip.readUInt16LE(at + 32);
  return { name, data: localData(zip, zip.readUInt32LE(at + 42), zip.readUInt32LE(at + 20)), next };
}

// The entries of a stored zip, in the order its central directory lists them
function readZip(zip: Buffer): Entry[] {
  const end = zip.lastIndexOf(END_OF_DIRECTORY);
  const found: Entry[] = [];
  let at = zip.readUInt32LE(end + 16);
  for (let i = 0; i < zip.readUInt16LE(end + 10); i += 1) {
    found.push(centralRecord(zip, at));
    at = found[i].next;
  }
  return found;
}

function load(name: CelebrationName): { entries: Entry[]; manifest: Manifest; animation: Animation } {
  const entries = readZip(readFileSync(`${CELEBRATIONS}/${name}.lottie`));
  const json = (path: string) => JSON.parse(entries.find((entry) => entry.name === path)?.data.toString("utf8") ?? "null");
  return { entries, manifest: json("manifest.json"), animation: json(`animations/${name}.json`) };
}

function lastValue(track: Track): number[] {
  if (track.a === 1) return track.k.at(-1)?.s ?? [];
  return Array.isArray(track.k) ? track.k : [track.k];
}

describe("the generated celebrations", () => {
  it("are exactly the registered celebrations, and the player imports each one", () => {
    const files = readdirSync(CELEBRATIONS)
      .filter((file) => file.endsWith(".lottie"))
      .map((file) => file.slice(0, -".lottie".length));
    expect(files.sort()).toEqual([...CELEBRATION_NAMES].sort());
    const player = readFileSync(PLAYER, "utf8");
    expect(CELEBRATION_NAMES.filter((name) => !player.includes(`@art/celebrations/${name}.lottie`))).toEqual([]);
  });

  it.each(CELEBRATION_NAMES)("%s is a dotLottie archive whose manifest names its one animation", (name) => {
    const { entries, manifest } = load(name);
    expect(entries.map((entry) => entry.name)).toEqual(["manifest.json", `animations/${name}.json`, `images/${name}.png`]);
    expect(manifest.version).toBe("1");
    expect(manifest.animations.map((animation) => animation.id)).toEqual([name]);
  });

  it.each(CELEBRATION_NAMES)("%s has the top-level fields a Lottie player reads, and ends in time", (name) => {
    const { animation } = load(name);
    expect({ fr: animation.fr, ip: animation.ip, w: animation.w, h: animation.h }).toEqual({ fr: 60, ip: 0, w: 400, h: 400 });
    expect(animation.op / animation.fr).toBeLessThan(CEILING_S);
  });

  it.each(CELEBRATION_NAMES)("%s embeds its hero as one PNG that an image layer draws to the last frame", (name) => {
    const { entries, animation } = load(name);
    expect(animation.assets).toHaveLength(1);
    const [asset] = animation.assets;
    expect(asset.e).toBe(0);
    const png = entries.find((entry) => entry.name === `images/${asset.p}`)?.data ?? Buffer.alloc(0);
    expect(png.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true);
    // lottie-android scales the picture to the asset's size, so the two must agree or the hero blurs
    expect({ w: png.readUInt32BE(16), h: png.readUInt32BE(20) }).toEqual({ w: asset.w, h: asset.h });
    const images = animation.layers.filter((layer) => layer.ty === 2);
    expect(images.map((layer) => ({ refId: layer.refId, op: layer.op }))).toEqual([{ refId: asset.id, op: animation.op }]);
    // The hero is fitted to the canvas by a null parent, so its own scale can end at 100
    expect(animation.layers.find((layer) => layer.ind === images[0].parent)?.ty).toBe(3);
  });

  it.each(CELEBRATION_NAMES)("%s holds its last pose: the hero upright at full size, every particle gone", (name) => {
    const { animation } = load(name);
    const hero = animation.layers.find((layer) => layer.ty === 2);
    expect(hero && lastValue(hero.ks.s)).toEqual([100, 100, 100]);
    expect(hero && lastValue(hero.ks.r)).toEqual([0]);
    const particles = animation.layers.filter((layer) => !WHOLE_LAYERS.includes(layer.nm));
    expect(particles.filter((layer) => layer.ip < 0 || layer.op >= animation.op)).toEqual([]);
    expect(new Set(animation.layers.map((layer) => layer.ind)).size).toBe(animation.layers.length);
  });
});
