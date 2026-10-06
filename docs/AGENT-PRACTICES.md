<!-- personal-config v0.7.0 · 2026-10-04 · config 3b46daed · standard v1.2.0 · adapted -->
# Agent working standard: felto

**What this is.** A complete working standard for agent-driven development: how work is
scoped and decided, how it is sized to a model's context, which model runs what, how several
sessions run against one repo without eating each other's work, what a session hands the next
one, and how the documentation is written so the next session can trust it.

**Five words this file leans on.** A **ledger** is the file recording what is true of a repo:
its environment, its settled decisions, and a numbered, append-only log of the work done. A
**board** is the file listing what is next, one standalone prompt per item. A **profile** is the
shape a repo keeps its work in: a ledger and a board, or one folder per effort (Part 2 defines
both). **Mode** is whether one person decides here or several; felto is solo mode, one person.
A **tier** is one of three named slots (Deep, Default, Mechanical) that a task's model
is picked from (Part 4).

**How to use it.** This copy is already adapted to felto. Read it in full before scoping,
planning or building, as `CLAUDE.md` says. Gate commands and hazards live in `CLAUDE.md` and
the ledger, not here.

**Standard version: 1.2.0**

**Adapted to this repo 2026-10-04, solo mode.**

Pre-filled by `personal-config` on 2026-10-04 (profile, Appendix A, Part 11), then adapted by
the Part 0 session the same day, on Opus 5.5. What was cut, and why:

- **Part 0** (the adapt protocol): done; the original lives in the `personal-config`
  boilerplate, standard v1.2.0, if this repo is ever re-adapted.
- **Part 12** (team mode): one person decides here. Cut by `personal-config`; its
  cross-references were removed in this pass.
- **The CI enforcement tag and every "what CI runs"**: felto has no CI
  (`ls .github/workflows` finds nothing, 2026-10-04).
- **The migration rule and parity rules**: no migrations (`grep -rni migrat` outside this
  file finds nothing, 2026-10-04) and no second platform: there is no app code yet, only an
  asset pipeline. Re-add both when an app lands. The general numbered-resource rule stays,
  because ledger steps and board items are numbered. *Re-added 2026-10-05, board item 6 (app
  phase 2 in `docs/incomplete/app/PLAN.md`), in felto's words:* the app in `app/` stores player
  data on the phone and runs on iOS and Android (`docs/incomplete/app/DESIGN.md`, `D2` and
  `D3`). Both rules are in Part 6, under "Stored player data and both platforms", and the seams
  line in Part 5 names parity again. The cut above stays as it was written, because it was true
  on 2026-10-04.
- **Ratchet rules**: no linter of any kind runs here.

Part 11 is kept as `personal-config` wrote it. Repo A and repo B worked examples are evidence
from the repos this standard was distilled from, never facts about felto.

**Placeholders.** `grep -nE '\{\{' docs/AGENT-PRACTICES.md` returns nothing: every slot is
filled. Slots written `<like this>` inside fenced blocks are part of a template you copy and
stay as they are.

**Provenance.** Distilled from two working repos, each rule written after the failure that
made it necessary:

- **Repo A: a TypeScript/Go monorepo** (Bun workspace, Next.js web + Expo native + Go API +
  Postgres, ~15 CI jobs, ratcheted lint). Large, heavily gated, many sessions a day.
- **Repo B: a Swift app** (iOS + macOS + widgets + extensions, XcodeGen, no CI). Small,
  gates are two `xcodebuild` commands, work arrives as a stream of independent items.

Their failures are preserved as `> **Worked example**` blocks, or, where a sentence is enough,
named inline as repo A's or repo B's. Either way they describe *those* repos: evidence for a
rule, never facts about yours.

**Map.** Part 1 is the twelve rules that hold everywhere. Part 2 is where work gets written down, in one of two profiles. Part 3 is the
pass-off prompt. Part 4 picks the model. Part 5 sizes work to a model's context. Part 6 is
parallel sessions and git. Part 7 closes a piece of work. Part 8 is how the docs are written.
Part 9 is the file the harness auto-loads. Part 10 is agent memory. Part 11 is owner policy,
editable. Appendix A lists the filled placeholders; Appendix B lists what adaptation produced.

---

# Part 1: The rules that hold everywhere

These survive every adaptation. They are the ones that, when broken, cost a whole session or
silently corrupt a later one. Each ends with its **test**: what a reader of the doc, the diff
or the hand-back checks, so whether a session complied is never a matter of opinion.
**"The owner"** throughout this file is whoever decides the matter in hand: in a one-person
repo, that person. felto is a one-person repo.

**R1: Absolute dates only.** `2026-09-14`, never "today", "recently", "last week". Docs are
read months later by an agent with no idea when they were written.
*Test:* `grep -niE 'today|yesterday|tomorrow|recently|currently|last (week|month|year)|this (week|month|year)|(days|weeks|months) ago'`
over what you wrote returns nothing.

**R2: Every claim carries a citation.** `file:line`, a filename, a commit hash, a migration
name, the query that produced it. A claim with no citation is a guess and will be treated as
one.
*Test:* every sentence stating what the code, the data or the tooling does names its source;
one that cannot is deleted before hand-off.

**R3: A claim in an existing doc is a lead, not a fact.** Re-verify before building on it.
*Test:* a claim carried forward appears with `verified <date>` and the citation from your own
check, not the original's.

> **Worked example, repo A.** A handoff recorded "there is no vision anywhere in the repo".
> Vision was live the whole time at `backend/helpers/listingHelpers.go:326`. On that same
> track, handoff "missing feature" claims were three for three wrong.

**R4: Grep before recording an absence.** "Nothing does X" is the most expensive kind of
wrong claim, because everything downstream is built on it.
*Test:* every "nothing does X" and "there is no X" carries the grep or query that produced it.

**R5: When you disprove something, record the disproof where the wrong claim lives.** With
the reason it was wrong. Silent deletion means the next session rediscovers it.
*Test:* the wrong claim is still findable, marked wrong, dated, with the disproof beside it.

**R6: Ask the owner where they will see it, before building, in one batch.** In an
interactive session that is the chat, in the same turn.
Questions written into a doc for async review do not get answered. Put every open question
into one prompt rather than trickling them.
*Test:* the questions went out in one message before any code that depends on an answer was
written; the hand-back lists any still unanswered.

**R7: For user-facing copy, never pick silently.** Where a decision has not already fixed the
words, write 2–3 real variations in different registers (plain, warm, terse) and ask which.
Check first whether it is already settled; re-opening decided copy wastes the owner's time.
*Test:* the ask shows the variants with their registers named, or cites where the copy was
settled.

**R8: Never re-litigate a settled decision.** Check for the settled/ratified marker before
treating anything as open. Genuinely new evidence produces a *supersession* (stated
explicitly, dated, naming what it replaces), not a quiet reversal.
*Test:* nothing carrying a settled marker is reopened in a doc or an ask; any change to one is
a dated supersession that names what it replaces.

**R9: Descoping is the owner's call.** If something is explicitly parked, record it and stop
raising it. If nothing has been said, a finding still blocks by default: surface the judgment
call rather than making it.
*Test:* every finding not fixed appears in the hand-back as `parked by owner <date>` or
`open`; none is dropped silently.

**R10: Report faithfully.** "Gates green, not seen running" and "walked the flow on the
device" are different claims and must never be merged. Say which one you have.
*Test:* the hand-back says which of the two it claims, per item.

**R11: Read the matching standard in full before writing code.** Not optional, not
conditional on task size. If you have not read it this session, read it now.
*Test:* the session's first reads include the standard, and the hand-back names it.

**R12: Stop mid-file when something contradicts a settled decision.** Do not take the call
and flag it afterwards, do not finish the phase first. The test is whether the decision would
have come out differently; if you are unsure, that is itself the signal to ask. A build-level
call that merely *implements* a settled decision is yours to take: record it, as a `BD-n` in
the plan (2.2, Stage 4) or a line in the ledger step (2.1), with one line on how to reverse it.
*Test:* the contradiction reaches the owner as a question before the next edit to that file
lands.

---

# Part 2: Where work gets written down

## 2.1 Profile L: ledger + board

Two files at the repo root, by these names unless the repo already has them under others.

### `HANDOFF.md`: what is true

Read first by every session. Append-only in its log; its standing sections are edited in place
when they go stale. Sections, in this order:

- **Orientation.** One paragraph: what this project is, who the owner is, what they know, and
  that they are interactive: ask when a decision is theirs. Then the read-first list.
- **Environment.** The verified build command, the verified test command, versions, device
  ids, signing, where logs land. Each one run before it was written. **State plainly what an
  agent cannot do here**, and what to do instead.

  > **Worked example, repo B.** "Nothing can screenshot the phone; the owner sends
  > screenshots." So every session ends with *exactly what to tap and what should appear*, and
  > waits. Naming the limit converts it from a silent gap into a handoff step.

- **Settled: `<topic>`**: one section per area, stating what the product *is*. Marked
  settled, with dates. **Do not re-ask anything under Settled** (R8).
- **Code map.** Where things live, one line each, updated by the session that adds a file.
- **Invariants.** "How X works: do not break these." The rules that compile fine when broken.
- **Known API facts and quirks.** Platform behaviour learned the hard way, with citations.
- **The step log.** Numbered, append-only: `**N. Title.** Done <date>. <what changed, why,
  what is now fixed, which decisions it answered>`. Steps are addressable forever: "HANDOFF
  24" is how everything else refers to work. Two rules: **take the next free number by reading
  the file, not by trusting one written elsewhere** (another session may have taken it), and
  **do not edit a step you did not write**: append a correction as a new step. Old steps lose
  their bodies to the archive and keep their number, title and date as one line (Part 7);
  because a step is addressable forever, that line is what keeps the citation resolving.
- **Style rules.** Short; the language-level conventions live wherever Part 8.1 puts them.

### `PASSOFF.md`: what is next

A board plus one standalone prompt per item (Part 3). The board is the parallelism model:

| # | Task | Status | Model | Lane | Waits on | Files it owns |
|---|------|--------|-------|------|----------|---------------|

- **Lanes run in parallel; items inside a lane run in order.** Each open lane is its own
  worktree. Items in one lane are serial because each changes the shape the next builds on.
- **"Files it owns"** is the collision check. Two items that name the same file do not run at
  the same time, whatever their lanes say. Check it against every open item before starting one.
- **Status** uses the board words in 2.3, and `DONE` points at the ledger step that is the
  real record: `DONE: HANDOFF 24`. **Do not paste a prompt marked DONE**; a fresh session
  would build it again.
- **A prompt rots the moment it is executed.** The ledger step is the truth; the prompt is the
  ask. Where a DONE prompt turns out to describe the work wrongly, say so on the board rather
  than editing the prompt into a lie.
- **A `DONE` item's prompt leaves the board; its row never does.** The row is the permanent
  part: the collision check, the pointer at the ledger step, and the item number, which
  nothing may ever reuse. The prompt under it is the part that grows without bound, and it is
  dead by the rule directly above. Fold it out at close-out (Part 7). **`SUPERSEDED` and
  `SETTLED AS NO` keep their sections**: the first names what replaced the item, the second
  carries the reason it is not to be re-proposed, and neither fact is written anywhere else.
- **An item exists before work on it starts:** a row, plus a dated paragraph under the board
  saying why it exists and what it came out of. An item settled as *no* stays on the board with
  its reason, so it is not re-proposed.

## 2.2 Profile P: project folders

One folder per effort at `docs/incomplete/<slug>/`, from the first keystroke, moved
to `~/Projects/archive/felto/<slug>/` when it closes.

| Stage | Artifact | Who decides | Exit condition |
|---|---|---|---|
| 0 · Intake | n/a | n/a | You know what tree and what data to read |
| 1 · Ground truth | (feeds 2) | n/a | Every claim carries a citation, dated |
| 2 · Scope | `SCOPE.md` | agent proposes | Options with defenses; nothing decided |
| **GATE 1** | n/a | **owner** | Decisions ratified |
| 3 · Design | `DESIGN.md` | owner decides, agent records | `D1…Dn` frozen, with supersessions |
| 4 · Plan | `PLAN.md` | agent proposes | Phases, lanes, done-when, dials |
| **GATE 2** | n/a | **owner** | Plan approved |
| 5 · Build | `PLAN.md` per phase | agent | Gates green; header says BUILT + hash |
| 6 · As-built | `DESIGN.md` amended | agent | Every deviation recorded under its decision |
| 7 · Runtime pass | `RUNTIME-PASS.md` | owner walks it | Findings folded back |
| 8 · Close-out | archive + index + memory | agent | Folder out of the repo, referrers checked |

**Stage 0: Intake.** When the owner says "we should build X": say nothing back until Stage 1 is
done. No clarifying questions first: the audit answers most of them, and the rest are asked
at GATE 1 in one batch. Read first: the code standard in full, `CLAUDE.md`, and any existing
doc that overlaps, including the archive index. That last one is what stops a project
re-deciding something already settled.

**Stage 1: Ground truth.** Read the tree and the live data before proposing anything. R2–R5
apply hardest here. Output is a table (claim, verified state, citation) dated absolutely. It
becomes `DESIGN.md` §1. This stage routinely finds that the project is not the shape the
request assumed.

> **Worked example, repo A.** A project opened by discovering the link it was asked to build
> already existed in the schema and ran backwards, destructively, deleting the user's
> addresses on every slider tick. That reordered the entire project.

**Stage 2: `SCOPE.md`.** Its job is to make the owner's decisions cheap. It proposes and
decides nothing. Sections: **1. What exists, verified `<date>`**: the Stage 1 table,
first, because every option is only meaningful against it. **2. What this is / what this is
not**: the non-scope list is as load-bearing as the scope list and gets skipped constantly;
without it every parked item is relitigated mid-build. **3. Options**: each with a real
defense *including the strongest argument against it*, which is what stops that argument
coming back in three weeks as a new objection. **4. Dials**: every number the design leaves
open, each with a recommended default, destined for config rather than a constant hardcoded
twice. **5. Hazards this work walks into.** **6. Open questions**: the GATE 1 batch.

**GATE 1: Ratification.** Stop. Ask in one batched question in the same turn the scope doc is
finished (R6). Every option carries a marked recommendation: never present a survey with no
opinion. R7 governs copy. Record every answer with its date, in the doc, the same turn it is
given.

**Stage 3: `DESIGN.md`.** `SCOPE.md` is renamed (git records the transition) and the answers
are written in as `D1…Dn`, each carrying: the decision stated flatly; **the defense**: why
this and not the alternative, which is what makes it survivable when the next agent finds it
inconvenient; **supersession pointers**, specific, saying which half dies when a supersession
is partial; and the date. Also required: **"Rules that survive unchanged"**: listing what is
*not* changing is how you stop a build phase from helpfully rewriting it. **From here the
design is frozen**: it changes by amendment (a new dated `D<n>` or an `As built:` note),
never by editing a decision in place.

**Stage 4: `PLAN.md`.** The design is *what and why*; the plan is *in what order, by whom,
done when*. Sections: **0. Facts verified `<date>` (supersede the design where they differ)**:
a second verification pass at build time, in the same table shape, because days have passed
and another effort may have taken your number; the plan's table wins, and says so in its own
heading. **1. Decisions taken since ratification**: build-level calls, numbered `BD-1…BD-n`
so a later deviation can cite them, each with a one-line reversal. **2. Phases**: the table
(`# | Phase | Driver | Subagents | Est. context | Why that shape`), where `Est. context` is a
band against that phase's driver ceiling (Part 5): `comfortable`, `full` or `tight`; a `tight`
phase names what it will delegate if it runs long, and nothing is planned above `tight`; that
is a phase that needs splitting. Then one section per phase with exactly five parts: status
header, scope (numbered, executable without re-reading the design), subagents (model and job,
or `none`, decided here not improvised), **done when** (the literal gate commands *plus* a
proof obligation a green gate cannot supply), and **watch for** (the hazard specific to this
phase). **3. Dials.** **4. Seams reserved, deliberately not built**: so the next effort need
not guess whether an omission was considered. **5. Repo hazards, with live numbers.**
**6. Session protocol**: a link to this file, plus anything specific to this project.

A phase whose done-when is only "gates pass" has no done-when. Gates cannot see a screen, so a
real done-when names the proof a green gate cannot supply.

> **Worked example, repo A.** Its gates could not see repository SQL at all. The done-whens
> that worked: *"a hand-run query proves the aggregate matches a manual average for one seeded
> user"*; *"an integration test proves creating a review enqueues an in-app row and **zero**
> push sends."*

**GATE 2: Plan approval.** Phases, order, lanes and dials go to the owner before any code.
Once approved, the plan authorizes the whole run; phases do not each need re-approval.

**Stages 5–8** are Parts 5–7 of this file: build one phase per session, close it out, record
what actually shipped, walk the runtime pass, archive.

## 2.3 Status vocabulary

Use these words and no others, so a board or a folder can be scanned:

- **Board items (Profile L):** `OPEN` · `IN FLIGHT` · `DONE: <ledger step>` · `HELD` ·
  `SETTLED AS NO` · `SUPERSEDED`.
- **Project folders and phases (Profile P):** `SCOPING` · `RATIFIED` · `PLANNED` · `IN FLIGHT`
  · `BUILT` · `MERGED` · `HELD` · `SUPERSEDED` · `CLOSED`.

`BUILT` means gates green. `DONE` always points at the record.
`HELD` always names what it waits on. `SUPERSEDED` always names what replaced it. `SETTLED AS
NO` always carries the reason, because its whole job is to not be re-proposed.

## 2.4 Entering in the middle

Not every effort starts at the beginning.

- **A defect list from a real session** (a device pass, an owner walkthrough) starts at Stage 4
  the findings *are* the scope. It gets the same phase / done-when / watch-for shape.
- **An audit** produces its findings as Stage 1 output and then enters at Stage 2.
- **A resumed effort** re-runs Stage 4 §0 before executing a single phase: days-old plans have
  stale numbers, closed findings, and phases another effort superseded.

---

# Part 3: The pass-off prompt

**The single highest-leverage artifact in this standard.** Every session ends by writing the
next one's first message. It must stand alone: the next agent will not see this conversation,
this reasoning, or this context. A prompt that assumes any of it produces a session that
rediscovers what you already knew.

Nine parts, in this order. Skip a part only when it is genuinely empty, and say so.

**1: Title.** Imperative, naming the change, not the area. *"Drag the week grid: windows
edited where they are drawn, on both apps"*, not *"week grid work"*.

**2: The header line.** `**Model: <tier>. Lane <X>. Waits on <what>.**` Plus the worktree
instruction when the item needs its own (Part 6).

**3: Orientation.** Who you are picking up, what to read first and in what order, and the
session rules restated *inline*, not by reference. Two or three sentences. Repeating them in
every prompt is deliberate: a prompt is pasted alone, and a rule one file away is a rule that
does not arrive.

**4: Why this exists.** The product reason, in product terms. This is what lets the next
agent make a hundred small judgment calls the prompt does not cover.

**5: What is fixed.** *"Read these before changing anything; do not relitigate them."* The
verified facts with citations: which files hold what, the sizes, the invariants, the house
precedent to copy rather than reinventing, the constraint that makes this smaller than it
looks. This section is where a session's Stage-1 reading is *banked* instead of re-paid.

**6: Do these, in order.** Numbered steps, each carrying its reason and its constraint. A
step that says only what to do gets done differently than intended.

**7: Ask before building.** The named decisions that are the owner's, each with what makes it
a real question and what the answer might be. Explicitly: *both are their calls, and the
answer to either may be no.*

**8: Not in scope, whoever asks.** The negative list, named. It survives a persuasive
mid-session argument in a way that an unstated boundary does not.

**9: Hand back.** Exactly what must be green (the literal commands), what the owner should
do and see (Part 7's runtime entries), and the commit or pull-request step Part 11 specifies.

### Template

```
## <N>. <Imperative title>

**Model: <tier>. Lane <X>. Waits on <nothing | item N | an external approval>.**
<Worktree instruction if this item needs one.>

You are picking up <project>. Read <ledger/plan> first (the build and test commands, the
invariants and the code map are there; do not re-derive them), then <next doc>.
Session rules: <the 2–3 that matter, inline>.

**Why this exists.** <product reason>

**What is fixed.** Read these before changing anything; do not relitigate them.
- <verified fact with file:line>
- <invariant, and what breaks if it is broken>
- <the house precedent to follow rather than invent>

Do these, in order:
1. **<step>.** <why, and the constraint it must respect>
2. …
<N>. **Record it.** <the ledger step / doc update this session owes, and what goes in it>

Ask before building: <the owner's calls>.
Not in scope, whoever asks: <the negative list>.

Hand back: <the exact gates, green>; <what the owner should do and see>; <the commit or
pull-request step Part 11 specifies>.
```

---

# Part 4: Model selection

## The driver: the model the session runs on

**The discriminator is: can the failure be silent?** Not how big or how scary the work feels.
Sizing by fear over-assigns the expensive tier.

| Driver | Use for |
|---|---|
| **Deep** (`Fable 5.1`) | Only where a mistake compiles, passes every gate, and is wrong in production: money paths, cross-cutting dispatch rewrites, sync and merge rules, a notification that must never send. Prefer **one narrow Deep review of a short load-bearing path** over a whole Deep phase, and that review can be a subagent (below). |
| **Default** (`Opus 5.5`) | The default and the right answer for most work. Anything where failure is loud (a build break, a red gate, a wrong screen) because the gates do that reasoning for you. |
| **Mechanical** (`Sonnet 5`) | Whole phases only when genuinely mechanical: close-out sweeps, doc reconciliation, a bounded rename. Escalate to Default the moment a gate fails for a non-obvious reason. |

Every phase or board item states its driver, and the close-out repeats it (Part 7, Block C) so
the owner can set the model before opening the next session.

## Subagents

**A context-budget instrument first, a parallelism one second.** An inventory sweep run inline
costs the lead 30–50k in file reads; the same sweep in a subagent costs it a 2k summary (repo A,
an observation as of 2026-09-14, not a measurement). If a phase is oversized only because of
what it has to *read*, it is not oversized; it is under-delegated.

| Subagent | Use for |
|---|---|
| **Mechanical** | Inventory and mapping sweeps, grep-and-report, call-site enumeration, golden/fixture regeneration, lint cleanup, doc-referrer greps: anything whose whole verification is reading the output. |
| **Default** | Design judgment, tricky debugging, review of ordinary code: anything where a wrong answer would be believed and the gates would not catch it. |
| **Deep** | One job only: a narrow adversarial review of a single short load-bearing artifact (a money path, a merge or sync rule, a standards document) where the whole output is the verdict and nothing else is asked of it. Never for sweeps, never for building. |

**Why the Deep row is that narrow.** A subagent boundary keeps only the final text, so a Deep
subagent asked to *do* work throws away exactly what the tier is for: sustained reasoning
inside one context. A review is the one job whose entire value *is* the final text, so it
survives the boundary. The driver table is not the subagent table: Deep drives a phase when
the reasoning has to persist across edits, and reviews as a subagent when a verdict is all
that is wanted. The same discriminator applies as above: a Deep subagent is warranted only
where its subject's failure would be silent.

Two rules from getting this wrong:

- **A subagent spawned into the shared worktree will edit source even when asked only to
  review.** Give anything analytical its own worktree, and check the diffstat when it returns.
- **Never let a subagent inherit the session's tier for read-and-report work.** Pass the model
  explicitly, every time.

---

# Part 5: Context budget

## Ceilings

A phase is sized to its driver's ceiling. **This is the primary division criterion, ahead of
conceptual tidiness**: the same work is a different number of phases depending on who runs it.

| Driver | Ceiling | Start landing at |
|---|---|---|
| **Mechanical** | ~500k | ~400k |
| **Default** | ~400k | ~300k |
| **Deep** | ~250k | ~150k |

*A ceiling is the context size at which a tier's sessions were observed to start compacting.
These were measured 2026-08-16 in repo A on the Claude models of that date: Sonnet as
Mechanical, Opus as Default, Fable as Deep. They are targets, not hard stops. They are a
property of the model and the harness, not of the repo, so an adopter inherits them as they
stand and re-measures only when a tier's model changes: watch where sessions compact, then
update the figure and the date. Measured: `2026-08-16`.* The consequence worth
planning around: **assigning the Deep tier also shrinks the phase.** It gets roughly half an
ordinary phase's room and must be cut accordingly; another reason to prefer one narrow Deep
review over a whole Deep phase.

## The rule

**Within ~100k of the ceiling, stop expanding scope, find a stopping point, and write the next
agent's prompt.** Landing means: finish or cleanly abandon the edit in hand, run the gates on
what exists, commit it, write down exactly how far you got, and hand off *the remainder*,
not the next phase.

**A phase that ends cleanly at 60% of its scope, committed and documented, is worth more than
one that compacts at 100%.** After a compaction the agent is working from a summary of its own
reasoning and will re-read files it already read.

## Measuring it

**An agent has no automatic awareness of its own context size.** Nothing in context reports it,
and the first signal of overrun is auto-compaction firing, which is already the expensive
outcome. **In the Claude Code harness** it is measurable on demand: the harness writes
per-message usage into the session transcript, and the newest assistant message's
`input + cache_creation + cache_read` is the current size. The script needs `python3` on the
path (macOS and most Linux distributions ship it) and prints one plain line, rather than a
traceback, when no transcript or no usage record exists yet.

```bash
python3 - <<'PY'
import json, glob, os, re
SENTINEL = ""   # a distinctive phrase from THIS session; see the note below
proj = re.sub(r'[^A-Za-z0-9]', '-', os.getcwd())
files = sorted(glob.glob(os.path.expanduser(f'~/.claude/projects/{proj}/*.jsonl')),
               key=os.path.getmtime, reverse=True)
if not files:
    raise SystemExit(f"no transcript found under ~/.claude/projects/{proj}/")
f = next((p for p in files if SENTINEL and SENTINEL in open(p, errors='ignore').read()), files[0])
last = None
for line in open(f, errors='ignore'):
    try: u = (json.loads(line).get('message') or {}).get('usage')
    except Exception: continue
    if u: last = u
if not last:
    raise SystemExit(f"{os.path.basename(f)}: no usage records yet")
KEYS = ('input_tokens', 'cache_creation_input_tokens', 'cache_read_input_tokens')
print(os.path.basename(f), f"context: {sum(last.get(k, 0) for k in KEYS):,} tokens")
PY
```

**With parallel sessions in one repo, newest-mtime picks the wrong transcript**: verified
2026-09-14 in repo A: the bare version reported another session's 394k as ours. Set `SENTINEL` to a
phrase unique to this conversation (a few words from the task prompt) and it selects correctly.

**On any other harness**, find its equivalent or treat the size as unmeasurable. Unmeasurable
means the split signals below and the countable proxies in the relay contract (files read,
items done) are the only budget instrument, and a phase lands on those.

Run it after the mandatory reading, and again whenever you are about to open a new front: a
second subsystem, the second platform, a long debugging loop.

## Budget arithmetic, at planning time

- **Fixed overhead, before any work.** The standards you must read, plus the plan and
  `CLAUDE.md`. Measure it rather than guessing: `wc -c <files> | awk '{print $1/4}'` is a
  usable token estimate. In repo A the documents measured ~30–35k (2026-09-14). The 60–80k
  this file carried for repo A (2026-08-16) was wrong (byte counts presented as token
  counts), and repo A's adapted copy of this file recorded the disproof on 2026-09-14.
- **Gate output is not free.** A failing build or a race-detector run can dump thousands of
  tokens per attempt, and the debugging loop is where budgets actually die. Leave headroom for
  three or four red runs.

## Signals a phase is too big: split it

- It spans **two platforms, or two subsystems that ship separately**. Each is its own phase;
  the second mirrors the first and inherits its decisions, which is also why it goes second.
- It contains **both a broad audit and an implementation**. Make the audit its own phase, or
  push it into subagents.
- It touches more than roughly **15–20 files**, or more than two or three subsystems: a rule
  of thumb from repo A (2026-08-16), not a measurement.
- **It needs to read a large area to decide where to work.** That reading is a subagent's job.

The seams that keep coming out right, in order: **data layer + reads → writes → shared
contract → first platform's surfaces → second platform + parity → close-out.**

## The relay: subagent budgets

The same stop-and-hand-off rule applies to subagents, but **a subagent cannot measure its own
context**: its transcript is plain streamed text with no token accounting. So its budget is
enforced two other ways.

**By construction: the lead's job.** Give every subagent a bounded, countable work-list:
*these 14 call sites*, *these 6 files*, *this one question*. An open-ended brief ("audit the
market feature") is an unbounded one. Splitting one broad brief into three narrow subagents is
nearly free, and each returns a smaller summary.

**By contract: put this in the subagent's prompt:**

```
Your work-list is <N> items, listed above. Work them in order.

If you reach roughly 2/3 of your budget signals (you have read more than ~25 files, or you
are past item <2N/3> with substantial work left), STOP. Do not start another item.

Instead, make your final output a pass-off prompt for a fresh agent: which items are done and
what you concluded for each, which item you stopped on and how far into it you got, the file
paths that mattered, and the exact remaining list. Write it to stand alone: the next agent
will not see this conversation.
```

The `~25 files` and `2/3` figures are rules of thumb from repo A (2026-08-17), not measurements;
set them to what your subagents are observed to manage.

**Then the lead relays.** A subagent's final text *is* its return value, so a returned pass-off
prompt is a normal result, not an error: spawn a fresh subagent of the same model with that
prompt as its brief, and repeat until the work-list is exhausted, paying only the returned
summary each time. Log each relay in the notes, so the record says the sweep took three passes.

---

# Part 6: Parallel sessions

The assumption throughout: **several sessions run against this repo at once, and the owner is
the only one who knows which uncommitted file belongs to whom.** With one session per clone
the shared-index rules below fall away; everything else stands.

## Lanes

Lanes and the "Files it owns" collision check are defined with the board in 2.1: lanes run in
parallel, each in its own worktree; items inside a lane run in order; two items naming the same
file never run at once.

## The fresh-checkout recipe: worktree or clone

A fresh checkout fails gates for purely environmental reasons before it fails a real one. Do
all of this on entry, **before believing any gate**:

```bash
command -v python3 >/dev/null && command -v xmllint >/dev/null && command -v bun >/dev/null && python3 -c 'import numpy' && bun install --cwd app --frozen-lockfile
```

That is the whole recipe for felto, verified 2026-10-04 for `tools/` and extended 2026-10-05
(board item 7) for the app: `app/node_modules` is gitignored, so a fresh checkout installs it
from `app/bun.lock` before the app gate means anything. The native folders `app/ios` and
`app/android` are gitignored too; `bun run --cwd app ios` and `run android` regenerate them, and
no gate reads them. Extended again 2026-10-06 (board item 38, ledger step 53) for the solver: the
solver tests in `solver/` import numpy and are in the whole-repo gate since that item, so the
recipe checks that numpy imports (`python3 -c 'import numpy'`; numpy 2.4.3 at
`/opt/homebrew/bin/python3`, rule M4 of `docs/conventions-python.md`) before any gate is believed. The paragraph below is the 2026-10-04 reasoning for `tools/`. The generators in `tools/` import only
`math` and `os` (`grep -nE '^(import|from)' tools/*.py`), and there is no package manifest,
lockfile or env file (`ls -a` at the root). The gitignored files (`.gitignore:1-2` and
`~/.config/git/ignore:4-6`) are process documents, and no gate reads them. A fresh checkout
therefore needs only `python3` and `xmllint` on the path. Re-derive this block when a manifest,
an env file or generated code appears. The three classes that bite:

- **Gitignored-but-required files**: env files, generated projects and type declarations,
  local config. `git worktree add` does not carry them and the installer does not create them.
  Without them, gates fail naming code you never touched.
- **Dependencies not installed in the checkout**: until they are, an intra-repo package may
  resolve to the *primary* checkout, so a green typecheck proves nothing about your edits and
  a red one may be reporting another session's uncommitted work.
- **Caches shared across checkouts**: a build or lint cache keyed outside the checkout serves
  results analyzed elsewhere.

  > **Worked example, repo A.** A red lint gate reporting 20 forbidden-call findings came back
  > *clean, all at ratchet* when re-run with an isolated cache: the findings belonged to a
  > sibling worktree. Re-run with a fresh cache before believing a red.

**Always go through the repo's own scripts, or the ledger's verified commands.** A bare
invocation of the underlying tool may select a different bundler, runner or configuration than
the script does, and fail in ways that have nothing to do with your change.

## Committing under a shared index

These bind whoever commits: the agent where Part 11 allows it, otherwise the person running
the blocks the agent prints. Two of them (never `-A`, and never `checkout --` or `stash`) exist
because of a shared checkout; the rest hold regardless.

```bash
git add -N <new-path> && git commit -o <path> <path> -m "..."
```

- **`git add -N` first for any file git has never seen.** `--only` silently drops untracked
  paths, and the commit still typechecks, because the files are on disk.
- **Never `git add -A`, never `git add .`**, not even scoped to a directory. It sweeps up
  another session's in-flight work.
- **Commit early, in small slices**: after each leg lands, not once at the end. Do not hold a
  multi-file change across a long gate run.

  > **Worked example, repo A.** A whole feature build was swept into a parallel session's
  > commit while its author was still running gates.

- **Never `git checkout --` or `git stash` to undo an experiment.** Both reach files that are
  not yours. Copy the file aside and restore it with `cp`.
- **After a split commit, build HEAD in isolation before pushing.** Gates run against the
  working tree, not HEAD, so a partial commit can leave the branch unbuildable while your tree
  is green. The archive has none of what the fresh-checkout recipe adds, so that recipe runs
  inside it first (joined with `&&` here). A fresh `mktemp -d` every time: a fixed path collides
  with a parallel session, and `tar -x` over a stale extraction keeps files deleted since, so
  HEAD can look buildable when it is not.

```bash
d=$(mktemp -d) && git archive HEAD | tar -x -C "$d" && cd "$d" && command -v python3 >/dev/null && command -v xmllint >/dev/null && command -v bun >/dev/null && python3 -c 'import numpy' && bun install --cwd app --frozen-lockfile && python3 tools/build_icons.py && python3 tools/build_mascots.py && python3 tools/build_sounds.py && xmllint --noout assets/icons/*/*.svg assets/mascots/*/*.svg && python3 -m unittest discover -s solver -p '*_test.py' && bun run --cwd app typecheck && bun run --cwd app lint && bun run --cwd app test
```

- **Shell working directory resets between calls in some harnesses.** A relative-path check can
  silently verify the primary checkout instead of your worktree. Use absolute paths for
  anything whose answer depends on which checkout you are in.

## Numbered shared resources

In felto these are the ledger step numbers in `HANDOFF.md` and the item numbers on the
`PASSOFF.md` board: anything where two sessions can claim the same number. There are no
migrations (verified 2026-10-04, `grep -rni migrat` outside this file). Once the app's data
module exists, the version of its stored state is one more (next section, added 2026-10-05).

**Derive the next number by reading the resource immediately before you use it, never from a
number written in any doc**, including this one. And **read names, not counts**.

> **Worked example, repo A.** `0074` exists twice on disk, so the file count is not the
> highest number; and `0101` was claimed by another project mid-build, after the plan that
> reserved it was written.

## Stored player data and both platforms

Re-added 2026-10-05 (see the list of cuts at the top of this file). Both rules apply to the app
in `app/` and to nothing in `tools/`.

**Stored player data is migrated, never dropped.** The app keeps all player state on the phone,
in one stored value with a `version` field, behind one data module
(`docs/incomplete/app/DESIGN.md`, `D3`; `PLAN.md`, BD-8). The version is a numbered resource:
read the current number from the data module before you raise it, never from a doc. A change to
the stored shape raises the version, ships a migration from the old version in the same commit,
and ships a test that loads a saved value of the old shape. A stored value the module cannot
read is copied to a backup key before a fresh state is written. A player's progress is the one
thing in felto that no gate can rebuild, because it lives only on their phone.
*Test:* every diff that changes the stored shape also changes the version, adds a migration and
adds a test that loads the old shape; no code path writes a fresh state over a value it has not
first backed up. Rule Q2 of `docs/conventions-typescript.md` is the same rule in code terms.

**Every screen is seen on both platforms.** A screen is not called built until it has been seen
running on an iOS simulator and on an Android emulator, and the hand-back has a screenshot of
each (`DESIGN.md`, section 9; `PLAN.md`, section 0, row 20). The two platforms draw the same
code through different native layers (`@expo/ui` uses SwiftUI on iOS and Jetpack Compose on
Android), so a screen that is right on one can be wrong on the other, and no gate sees a screen.
Work that brings the second platform level with the first is its own step, after the first
platform's surfaces (the seams in Part 5). A difference between the two that is meant is
written down in the sanctioned divergence registry of `docs/conventions-typescript.md`; any
other difference is drift.
*Test:* the hand-back of every phase that adds or changes a screen names a screenshot of it on
each platform, or lists the missing one as `open`.

## Other shared state

- **A dev server already listening on the port** will be reused by the test runner, which then
  silently tests the previous build. Kill any hand-started one first.
- **A test database pointed at the wrong target** can skip every test and still print `ok`.
  Grep the output for skips rather than trusting the exit code.
- **A warm client reading cache** can make a data fix look unfixed. If the server log shows no
  request, you are reading cache, not the system.

---

# Part 7: Closing a piece of work

**Every phase and every board item ends the same way, in this order, without being asked.**
The point is that the owner can close the session immediately after: set the stated model,
paste one block, go.

### 1: Update the record, in the same commit as the code

- **Profile L:** one new ledger step at the next free number (read it, do not trust one written
  elsewhere), naming what changed, why, what is now fixed, and which questions it answered.
  Add new files to the code map. Do not edit a step you did not write.
- **Profile P:** the phase header becomes `**BUILT <date>, commit <hash>**`, plus any deviation,
  discovery or re-ordering this phase forced on later phases; the design gets its `As built:`
  paragraphs; the runtime-pass file gets this phase's entries.
- **Landed early on budget, or interrupted?** Same ritual, different header: leave the item
  unmarked, add a status note (what is done, what is left, what it changes about the plan)
  and write the handoff. The pass-off then targets *the remainder of this item*, not the next
  one. Also write a handoff when work crosses a model boundary. If the owner says stop, stop;
  mid-item is fine.

### 2: Post three blocks in the hand-back

In the chat, not only in the docs: the whole value
is that they are copy-pasteable at the moment the session ends.

- **Block A: the pass-off prompt.** Part 3, in full, as a fenced block. It must stand alone.
- **Block B: the runtime entries this piece added.** The same lines written to the record,
  pasted here so the owner can walk them while the work is fresh rather than finding them in a
  file weeks later.
- **Block C: the next session's model, on its own line.** `Next session: <tier>`, plus one
  clause on why, if it differs from the last. Last in the message, because it is the first
  thing the owner acts on.

### 3: State plainly what was and was not verified

R10. "Gates green, not seen running" and "walked the flow on the device" are different claims.

## Recording what actually shipped

**Every deviation from the design is written back under the decision it deviates from**, not
as a changelog at the bottom, not in a commit message, but inline where someone reading that
decision will hit it. This is the anti-drift mechanism, and it is the single habit that
separates documentation you can trust from documentation you cannot.

Record equally: when the design left a choice open and the build picked one; when the build
found the design's premise wrong; and when a scope item was dropped. Also refresh the live
numbers: the next free number, the headroom consumed, any dial that got a real value.

## The runtime pass

**Each piece of work writes its own runtime entries as it goes**, and pastes them into the
hand-back at close (Block B). Not reconstructed later: reconstructed checklists are written
weeks after the work, from open ledgers, and one of repo A's had to hand-write queries to find
its own fixtures because no phase had pinned one.

An entry is three lines:

- **Goal it is checking**: what behaviour should now be true, in product terms.
- **Where**: the exact screen, on every platform, and how to reach it.
- **What the right answer is**: including the fixture. If the check needs specific data, give
  the query that finds it, not an id that will rot.

The owner walks the pass. **It does not block the work or the close-out.** What it blocks is
*claiming* something was seen working when it was not.

Findings from a pass fold back as a new item, not as ad-hoc fixes.

## Archiving (Profile P)

When every phase is checked off:

1. **Grep for referrers first**: `git ls-files | xargs grep -l <filename>`. Split them into
   paths *read at runtime* (scripts, globs) and *bare citations in prose*.
   Only the first kind blocks the move.
2. Commit the folder in its final state, so the repo records how it ended.
3. Move it to `~/Projects/archive/felto/<slug>/`. **Verify each file actually arrived before trusting
   the deletion**: one commit in repo A deleted five docs and archived three, while the index
   went on citing all five as live.
4. Add the one-line archive index entry: topic, what it was, last commit, date verified.
5. Update the docs index: out of `incomplete/`, into the archive list.
6. **Anything the doc leaves behind that still governs the code** moves to "Standing rules that
   outlived their doc" (8.3). A rule nobody can find is a rule nobody follows.
7. Update the memory entry (Part 10) with the final state and what was left owed.

## Folding (Profile L)

A ledger and a board only ever grow, and the ledger is read in full at the start of every
session. That makes their size a Part 5 problem rather than a tidiness one: left alone for a
few months they become the largest thing a session reads, ahead of any code.

Two things in them are already dead by this standard's own rules, and folding means moving
those two to `~/Projects/archive/felto` and nothing else.

1. **A `DONE` item's prompt.** §2.1 already says it rots the moment it is executed and that
   the ledger step is the record. The row stays, with its pointer; so do the sections under
   `SUPERSEDED` and `SETTLED AS NO`.
2. **A ledger step's body**, for every step but the most recent twenty or so. **The number,
   the title and the date stay, as one line.** That is not politeness. Steps are addressable
   forever, so a fold that dropped the number would break every `DONE: <step>` on the board
   and every citation in every other document, and would hand the next session a number the
   log had already spent.

Standing sections (Environment, Settled, the code map, the invariants) are never folded.
They are edited in place when they go stale, which is what makes them the part that carries
truth forward while the log carries history.

**The order is the whole of the safety argument, and it is step 3 above applied to text:
append to the archive, read it back, and only then cut.** A ledger and a board are routinely
untracked (they are personal process rather than part of the repo), so git is holding no copy
of what is about to be deleted.

What says it is time is not a feeling but arithmetic: what a fold would remove, measured
against the ceiling of whatever tier reads these files (Part 5).

> **Worked example, the repo this standard ships from.** Its board carried 62 rows in 65
> lines and 3,794 lines of prompts beneath them, every row already closed; its ledger carried
> 77 steps in 5,168 lines. The two were ~168k tokens together: more than half a Default
> session's runway before a line of code was read, and past the Deep tier's landing threshold
> outright. Folding both took them to ~49k and changed no row and no step number
> (measured 2026-09-23).

**This standard applies forward from the date it is adopted.** Work archived before then is a
historical record, not a conversion target: reshaping it to match a standard written after it
neither makes it truer nor easier to trust. What an archive owes a reader is **accurate
pointers, not a uniform shape**: an index entry that exists, a path that resolves, a status
sentence that was honest when written. Do not retrofit.

---

# Part 8: Doc craft

## 8.1 The code standard

One file per language or platform, and **the file extension decides which applies**. Each is
**self-contained** (applyable without reading anything else) and says so in its first lines.

- **Every rule gets an ID and is written so a reader can look at a file and say definitively
  whether it complies.** `A1`, `R3`, `F8`. IDs are how other docs, commit messages and lint
  justifications cite rules; **never renumber them**.
- **Every rule carries an enforcement tag.** *lint* (a linter catches it) · *gate* (a repo
  checker catches it) · *review* (nothing catches it: it rots
  without discipline). The tag tells a reader whether a clean run means anything.
- **One correct/incorrect pair per rule**, as real code from this repo, not invented.
- **Provenance labels where a rule is a choice:** *[STANDARD]* canonical for the ecosystem,
  source cited · *[COMMON]* widespread, alternatives named · *[OURS]* our preference, justified
  on its own terms. This is what stops a later agent "correcting" a deliberate house call.
- **Where a formatter or linter settles something, the config is the rule and prose says
  nothing.** A short standard for a language with strong tooling is not missing rules; it is
  correctly scoped. Say that explicitly, or someone will pad it.
- **A sanctioned divergence registry**, where two platforms or two subsystems mirror each
  other. List every sanctioned difference in a table and state that **anything not on the list
  is drift and must be fixed**. Additions need a recorded reason.
- **Where two standards contradict each other on purpose, say so, in both**, and name the rule.

## 8.2 The docs index

One index file, organized **by status first** (is there open work?) then by topic. Every doc in
the tree has a line in it: what it is, whether it is current, and the date last verified. A doc
with no index line is invisible; an index line pointing at a moved file is worse than none.

Mark explicitly which docs are *not* kept current between passes: a stale roadmap that says it
is stale is usable; one that does not is a trap.

## 8.3 Standing rules that outlived their doc

A section in the index for rules that are still true of the code after their project closed.
They live here rather than in the archive, because **a rule nobody can find is a rule nobody
follows**. Each is one paragraph: the rule, why it exists, and the archived doc it came from.

## 8.4 Prose rules for all of it

- R1, R2 and R5 apply to every sentence in every doc: absolute dates, citations, disproofs
  recorded in place. Docs are append-and-amend, not rewrite.
- State what is true, flatly. Reserve "should" for things that are not yet true.
- Write the counter-argument down next to the decision it lost to. Unrecorded, it returns in
  three weeks as a new objection.

---

# Part 9: `CLAUDE.md`

The file every session receives whether it asks or not: `CLAUDE.md` in Claude Code,
`AGENTS.md` or the equivalent elsewhere; the shape is the same. It is a **router and a hazard
list**, not a second copy of the standard. Keep it short enough that its cost is worth paying
on every single session.

```markdown
# <repo>

> **Before writing or editing any code, read the matching standard in full:
> `<path>` for <lang>, `<path>` for <lang>. Not optional, not conditional on task size.
> If you have not read it this session, read it now.**

> **Before scoping, planning or building a feature, read `<path to this standard>`.**
> It is the process standard. Do not ask how the flow works; it is written down.

## The rules that get broken

<The 5–10 rules that are actually violated here, restated in full and binding on their own.
Each says what to do instead. This list is not the standard: it is the subset that has been
broken enough times to earn a place in every session's context.>

## Stack

<Runtimes, frameworks, data layer, auth, payments: one line each, versions where they matter.>

## Architecture

<The 3–6 structural facts a session must not violate: what talks to what, where the entry
point is, what does not exist and must not be created.>

## Directory map

| Path | Belongs here | Does not |
|---|---|---|

## Commands

<Package manager. Dev servers. Then the gates, as fenced one-command blocks, each verified by
running it. Then the notes about gates that lie: what makes each one green when it should be
red, and what proves which tool actually ran.>

## Never do this

<The specific, expensive, repo-local traps. Each one a single line starting with a verb, each
earned by a real incident.>
```

**Two layers.** A user-level `CLAUDE.md` carries what is true of *you* across every repo: the
owner policy in Part 11, plus personal tooling. The repo's `CLAUDE.md` carries what is true of
*this codebase*. Do not duplicate one into the other; when they conflict, say in the repo file
which wins.

---

# Part 10: Agent memory

Where the harness offers persistent memory, keep it to **one fact per file**, indexed by a single
file whose lines are hooks, not content. In Claude Code that is a directory of markdown files in
the shape below, indexed by `MEMORY.md`; another harness has its own shape, and the rules under
the template apply to it as they stand.

```markdown
---
name: <short-kebab-case-slug>
description: <one line, used to decide relevance during recall>
metadata:
  type: user | feedback | project | reference
---

<the fact; for feedback/project, follow with **Why:** and **How to apply:**>
```

- `user`: who the owner is: role, expertise, preferences.
- `feedback`: guidance on how to work, corrections and confirmed approaches. Include the why.
- `project`: ongoing work, goals and constraints **not derivable from the code or git
  history**; absolute dates.
- `reference`: pointers to external resources.

Rules that keep it from rotting:

- **Memory is personal to one person and one harness.** Anything a second person or a second
  tool would need is not memory; it goes in the repo.
- **The index carries hooks only**: `- [Title](file.md): hook`. Content in the index is
  content nobody maintains.
- **Do not save what the repo already records**: structure, past fixes, git history, anything
  in the standards. If asked to remember one of those, ask what was non-obvious about it and
  save that instead.
- **Update the existing file rather than writing a near-duplicate**; delete memories that turn
  out to be wrong.
- **A memory is what was true when written.** If it names a file, function or flag, verify the
  thing still exists before recommending it.
- Organize the index by status: how the owner works, gotchas, open/owed, closed, shipped:
  so a reader can find the live ones without reading all of them.

---

# Part 11: Owner policy

Everything above is craft. This part is preference. It was written from the answers given to
`personal-config` on 2026-10-04; edit it freely: it is yours.

**The owner is interactive.** When a decision is theirs, ask before building it, in chat, in
the same turn, batched. A decision built on a guess is built twice.

**For user-facing copy, never pick silently.** Where a decision has not already fixed the words, write 2–3 real variations in different registers (plain, warm, terse) and ask which. Check first whether it is already settled; re-opening decided copy wastes the owner’s time.

**No drive-by fixes.** Fix what the task is. Note anything else you find and raise it; do not fold it into an unrelated change. An unrelated change hides in the diff, and in its review.

**Commits are the owner’s.** *Never run `git commit` or `git push`.* Several sessions run in one checkout and only the owner knows which uncommitted file belongs to which. When work is ready, run `git status --short`, then print exactly two copyable `bash` blocks, one command each: `git add <the exact files this session touched>` (never `-A`, never `.`) then `git commit <the same files> -m "<short, all lowercase>"`, because naming paths implies `--only` and a bare `git commit` sweeps in whatever another session has staged.


---

# Appendix A: Placeholders

| Token | Meaning | How to derive it |
|---|---|---|
| `2026-10-04` | Adaptation date | `date +%F` |
| `solo` | `solo` or `team` | Set by `personal-config` 2026-10-04 |
| `docs` | Where project folders go (Profile P paths only) | The directory that already holds design docs; `docs/` only if there is none |
| `~/Projects/archive/felto` | Where closed work goes | A sibling directory or repo outside this one, or an in-tree folder such as `docs/archive/`. Always a path: it is interpolated into one |
| `none` | Where items and decisions are visible to the team | `none` in solo mode |
| `Fable 5.1` | The deep-reasoning tier | Set by `personal-config` 2026-10-04; it changes with releases |
| `Opus 5.5` | The default tier | Set by `personal-config` 2026-10-04 |
| `Sonnet 5` | The mechanical tier | Set by `personal-config` 2026-10-04 |
| `2026-08-16` | The date of the measurement Part 5's table carries | `2026-08-16` if you inherit it; the date you re-measured if a tier's model changed |
| `command -v python3 >/dev/null && command -v xmllint >/dev/null && command -v bun >/dev/null && python3 -c 'import numpy' && bun install --cwd app --frozen-lockfile` | Fresh-checkout recipe | Verified 2026-10-04 for `tools/`; the bun part added 2026-10-05, board item 7 (Part 6); the numpy check added 2026-10-06, board item 38 (Part 6) |
| `python3 tools/build_icons.py && python3 tools/build_mascots.py && python3 tools/build_sounds.py && xmllint --noout assets/icons/*/*.svg assets/mascots/*/*.svg && python3 -m unittest discover -s solver -p '*_test.py' && bun run --cwd app typecheck && bun run --cwd app lint && bun run --cwd app test` | Build, for the HEAD-isolation check | Python part run 2026-10-04: exit 0, output byte-identical to the files on disk; app part added 2026-10-05, board item 7; sounds and xmllint steps added 2026-10-05 to match the whole-repo gate in `CLAUDE.md`; the solver tests added 2026-10-06 for the same reason (board item 38) |

Gate commands, hazards and the directory map are not placeholders: they are discovered in 0.1
and written straight into `CLAUDE.md`.

# Appendix B: What adaptation produces

```
CLAUDE.md                     router + hazards, every session reads it
docs/AGENT-PRACTICES.md       this file, adapted, placeholders filled
docs/conventions-<lang>.md    per-language standard (8.1), may already exist
HANDOFF.md  PASSOFF.md        Profile L
docs/incomplete/<slug>/       Profile P: SCOPE → DESIGN → PLAN → RUNTIME-PASS
docs/README.md                the index (8.2) once there is more than one doc
```

**First real session after adopting this:** read `CLAUDE.md` and this file, take one small item
end to end, and run Part 7's close-out on it. The ritual is what makes the rest hold; a repo
that adopts the documents without the close-out has adopted nothing.
