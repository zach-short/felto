import Storage from "expo-sqlite/kv-store";

import type { KeyValueStore } from "@/storage/player-store";

// BD-8: the one file that imports expo-sqlite (rule B4). The sync API lets the provider read the
// player before the first frame, so no screen has a loading state to draw for storage.
export const kvStore: KeyValueStore = {
  getItem: (key) => Storage.getItemSync(key),
  setItem: (key, value) => Storage.setItemSync(key, value),
};
