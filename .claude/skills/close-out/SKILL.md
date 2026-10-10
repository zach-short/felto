---
name: close-out
description: Run the end-of-work ritual — update the record, then post the hand-back blocks. Use when a board item is finished, when work is being landed early on budget, or when the user says "close this out", "wrap up", or "hand off".
---

<!-- personal-config v0.8.0 · 2026-10-05 · config 2fbe199a · standard v1.2.0 -->

# /close-out

Every board item ends the same way, in this order, without being asked. The point is that the
owner can close the session immediately after: set the stated model, paste one block, go.

## 1 — Update the record, in the same commit as the code

- **One new step at the next free number** — **read the file to find it**, do not trust a
  number written elsewhere. Name what changed, why, what is now fixed, and which questions it
  answered. Add any new file to the code map. **Do not edit a step you did not write**;
  append a correction as a new step.
- **Fold what is now dead** — this item's prompt, now its row says `DONE`, and any step body older than the newest twenty.
  `personal-config fold` does it: the row keeps its pointer and a step keeps its number,
  title and date as one line, because every citation depends on that line still being there.
  It appends to the archive and reads it back before it cuts, which is the only safe order
  for a document git is not holding a copy of.
- **Landed early, or interrupted?** Same ritual, different header: leave the item unmarked, add
  a status note — what is done, what is left, what it changes about the plan — and write the
  handoff. The pass-off then targets *the remainder of this item*, not the next one.

## 2 — Post two blocks in the chat

Not only in the docs — the whole value is that they are copy-pasteable at the moment the
session ends.

- **Block A — the pass-off prompt**, in full, as a fenced block. It must stand alone: the next
  agent will not see this conversation.
- **Block B — the next session's model**, on its own line, last in the message, because it is
  the first thing the owner acts on.

## 3 — State plainly what was and was not verified

"Gates green, not seen running" and "walked the flow on the device" are different claims and
must never be merged. Say which one you have, per item.
