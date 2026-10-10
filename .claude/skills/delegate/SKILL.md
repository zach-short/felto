---
name: delegate
description: Build one ratified board row or planned phase with a builder subagent and a separate auditor, each in its own worktree on the right model, then sign it off. Use when a row has cleared its gate and you want it built, reviewed and recorded without opening a new session.
---

<!-- personal-config v0.8.0 · 2026-10-05 · config 2fbe199a · standard v1.2.0 -->

# /delegate

Runs one item that has already cleared its gate to done: claim it, build it in a subagent, audit
the build in a second subagent, and sign it off, with no person opening a fresh session or pasting
a prompt across. It drives the working standard's rules on model selection, the context budget,
parallel sessions and closing work. It replaces none of them.

## The tiers

| Tier | Model |
|---|---|
| Deep | Fable 5.1 |
| Default | Opus 5 |
| Mechanical | Sonnet 5 |
| Light | <unset> |

Pass the Agent tool's `model` parameter the family each name belongs to, as that parameter lists
its values. Where a name maps to no family the tool lists, or a tier is `<unset>`, ask the owner
before step 2, or, under `/autopilot`, hold the row. Never guess.

## 0. Preconditions

- **The item has cleared its gate.**
  On the board (`PASSOFF.md`): an `OPEN` row with a model and a written prompt, every item
  its "Waits on" names `DONE`, and no "scope first". Otherwise stop and run `/scope`.
- **Open owner questions are asked here**, in chat, in one batch, before step 1. A subagent cannot
  reach the owner, so a question is never handed to a builder to guess at. Under
  `/autopilot` its opening round asked them, and a row whose questions it did not reach is
  held.
- **A Deep item is held** unless the person typed `/delegate` on that item in this session, or lifted it in
  `/autopilot`'s opening round.
  That is the authorization: say so in one line, and record it in the sign-off. A `/delegate` you
  loaded on your own lifts nothing. A named Deep item gets a Deep builder, and then an
  independent Deep review in step 3.
- **Never spawn a model above the repo's tier ceiling**, where its router has a "Tier ceiling"
  section.
- **Run in the primary checkout**, where the ledger and the board are written. If `git rev-parse
  --show-toplevel` is not the first path `git worktree list` prints, this is a worktree session:
  stop and say so.

## 1. Read and claim

Read the item fresh: never trust a status read earlier in this conversation.
Check its "Files it owns" against every other item marked `IN FLIGHT`. Two items that name the same file never run at
once, whatever their lanes say.
Claim it with `personal-config passoff claim <n>` before spawning anything, so a parallel
session sees the claim.

## 2. Build, in a subagent

Spawn one Agent with `model` from the tiers above and `isolation: "worktree"`. Its brief is the
item's own prompt in full, then the relay contract below, then these rules:

- Do not edit the ledger (`HANDOFF.md`) or the board (`PASSOFF.md`). Only this session writes them.
- Do not commit. Leave the change in the worktree, and list every untracked file it adds.
- Before the first gate, run the fresh-checkout recipe in the repo's working standard, and bring
  the worktree to the base branch with `git merge --ff-only <base>`. A worktree can start from a
  stale base, and its gates then report on old code.
- Never retry a call that was denied. Report it.
- Report: the gates as run, with their output; the diffstat; what changed; what is left; any
  number claimed, such as a migration or a step; any build-level call, with its reversal; and any
  question for the owner.

The relay contract, written into the brief as it stands here:

```
Your work-list is the items listed above. Work them in order.

If you reach roughly two thirds of your budget signals (you have read more than about 25 files,
or you are past two thirds of the work-list with substantial work left), STOP. Do not start
another item.

Instead, make your final output a pass-off prompt for a fresh agent: which items are done and
what you concluded for each, which item you stopped on and how far into it you got, the file
paths that mattered, and the exact remaining list. Write it to stand alone. The next agent will
not see this conversation.
```

Two shapes come back. **A finished report** goes to step 3. **A relayed pass-off** goes to a
fresh subagent of the same model, with that prompt as its whole brief. Count the passes: the
sign-off names them.

## 3. Audit, in a second subagent

Spawn a second Agent with its own `isolation: "worktree"`, never the builder's. A subagent in a
shared worktree edits source even when it is told only to review. Use the Default tier, or Deep
for a Deep item and for an item the owner named load-bearing. Where the repo's tier ceiling is
below Deep, an item that needs a Deep review is held, never reviewed on a lower tier.

Its brief: the item's done-when (the gate commands, and the proof a green gate cannot give), its
"What is fixed" and "Not in scope", the builder's worktree path and branch, and these rules:

- Do not edit the ledger (`HANDOFF.md`) or the board (`PASSOFF.md`), and never write the builder's worktree.
- Bring your own worktree to the base branch with `git merge --ff-only <base>`, then reproduce the
  change there. Take it from the builder's diff against `HEAD` (`git -C <builder's
  worktree> diff HEAD`) and the untracked files the builder listed.
- Re-run every gate yourself. Report each command with its output, and the diffstat of your
  worktree after the change is reproduced.
- Return one of: clean, non-blocking findings, or blocking findings, each with a citation.

When it returns, check that its diffstat matches the builder's and that its verdict carries the
gate output. A verdict without them is not a reproduction: audit again with a fresh auditor,
once. A second verdict without them holds the item.

## 4. Sign off

- **Clean, or non-blocking findings.**
  Write one step in `HANDOFF.md` at the next free number, read from the file now. Name
  the builder's and the auditor's models, the worktree, the branch, the commit state
  ("not yet committed"), the relay passes, the verdict, each finding as `open`, and a Deep lift
  as the person's call. Then mark the row `DONE` against that step, and post the `/close-out`
  hand-back blocks: in chat, or into the run's state file under `/autopilot`.
- **Blocking findings.** Send them to the same builder with `SendMessage`, so it keeps the context
  of its own change, then audit again with a fresh auditor. At most two rounds. A third means the
  item was sized or scoped wrong, and another pass does not fix that.
  After that the row is `HELD`: its "Waits on" names the file the open findings are written in,
  and its section gets a dated note of what is done and what is left.

## 5. Several items at once

Only items in different lanes whose "Files it owns" do not overlap, checked across all of them at
once, not in pairs as you go. Their step 2 Agent calls go out in one message. From there each
item's loop is independent.

## Why this session stays small

Every subagent starts with no memory of an earlier call and keeps its working context to itself.
Only its final report crosses back, so this session collects a few short reports per item and
never a transcript. If this session runs long across several items, measure it with
`personal-config context --sentinel "<a phrase from this conversation>"`, and land at the working
standard's context budget instead of running into a compaction of its own. Under
`/autopilot`, that skill's own rule on this session's context governs.
