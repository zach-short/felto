---
name: clean-up
description: Sweep finished work out of the live documents and into the archive — closed board prompts, old ledger step bodies, finished design folders — then repair everything that pointed at it. Use when doctor reports `unfolded`, after several items have closed, or when the user says "clean up", "tidy the board", "archive what's done", or "fold the handoff".
---

<!-- personal-config v0.8.0 · 2026-10-05 · config 2fbe199a · standard v1.2.0 -->

# /clean-up

The live documents are read in full at the start of every session, so finished work left in
them is a cost every session pays, not an untidiness. This skill decides what is finished, hands
the moving to the commands that already do it safely, and repairs what pointed at what moved.
**Do not move by hand what a command moves.** The commands append to the archive and read it
back before they cut — the only safe order for a document git may not be holding a copy of.

## 1 — Find what is finished

Run `personal-config doctor .` and read every finding before touching anything.

- **A board row** is finished when it says `DONE — <step>` and that step is in the ledger.
  `SUPERSEDED` and `SETTLED AS NO` are finished too, but their sections stay: each carries a
  fact written nowhere else.
- **A ledger step** gives up its body only once it is older than the newest twenty. Its
  number, title and date stay, because every citation of it depends on that line.
- **A design folder** is finished when every board row that names it is. One open row citing
  it keeps it in the tree.

**Report, never mark.** Something that looks finished but is not marked so, or a `DONE` whose
pointer resolves to nothing, goes back to the owner with its evidence — the commit, the step,
the date — and stays as it is. Marking work done is a claim about the work, and only the session
that did it, or the owner, makes it. Carry on with what is already marked.

## 2 — Preview, ask, then move

Every command below runs with `--dry-run` first. **Without a terminal they write without
asking**, so the preview is the only confirmation there is: post it, say in one line what will
move and what will stay, and wait for a yes in chat.

1. **The board and the ledger** — `personal-config fold --dry-run`, then `personal-config fold`.
   Every row and every step number stays; prompts and old bodies go.
2. **Each finished folder** — `personal-config archive <slug>`. It lists what cites the
   folder and whether the repo has recorded its final state. A path read at runtime blocks
   the move: repoint it first. Uncommitted changes block it too, and **the commit is the
   owner's locally**: post the blocks it prints and stop there for that folder. In a cloud
   session, run them yourself and push. Once it is committed,
   `personal-config archive <slug> --move --dry-run`, then again without `--dry-run`.

## 3 — Repair what pointed at it

Grep for each moved name across the ledger, the board and every document in the tree. A command's referrer report reads tracked files only,
and a document kept out of git is invisible to it.

- **Live text** — an open board row, a ledger standing section, the router file, the docs index, a memory entry — is repointed
  at the archive location, or cut where it no longer governs anything.
- **Historical text** — a `DONE` row, a ledger step — stays as written. It records what was true when
  it was written, and **a record you did not write is not yours to edit.**
- **A rule the moved doc leaves behind that still governs the work** moves to "Standing rules
  that outlived their doc". A rule nobody can find is a rule nobody follows.

Then run `personal-config doctor . <archive home>` — the archive as a second root, so it can see
what now lives there — and account for every finding left.

## 4 — Hand back

One short report: what moved and where, and how many lines each live document lost; what was
left for the owner and why — unmarked work, broken pointers, a blocked move. Then the
commit blocks for everything the sweep changed. **The archive may be its own repository**:
its commit is rooted there and names its own files, exactly as the command printed it.
