# TypeScript code standard: felto

This file is self-contained: it can be applied without reading any other document. It covers
every `.ts` and `.tsx` file under `app/`, the Expo app that `docs/incomplete/app/PLAN.md` builds.
The file extension decides which standard applies: `.py` files follow
`docs/conventions-python.md`, and `.ts` and `.tsx` files follow this one. Read this file in full
before you write or edit TypeScript here.

Version 1.1.5. Written 2026-10-05 on Opus 5.5 for board item 6 (app phase 2 in `PLAN.md`), when
`app/` did not yet exist. Revised 2026-10-05 (1.0.1, board item 14): rule U6 widened from the art
to the art and the sound, after the audit of item 13 found the WAV imports outside the art
module; no rule renumbered. Revised 2026-10-05 (1.1.0, board item 16, app phase 12): every
correct example is now real felto code with a checked `file:line` (no example cites another
repo); the lint and Metro facts are re-read from felto's own `app/node_modules`, which corrects
the `import/order` sentence; sanctioned divergences Z2 to Z4 and a list of known gaps are added;
no rule renumbered and no rule changed in meaning. Revised 2026-10-05 (1.1.1, board item 26,
game-feel phase 1): registry entry Z5 for the custom primary button of `GF-2`; no rule changed. Revised 2026-10-05 (1.1.2, board item 34): rule U6 covers the Rive file and runtime, and entry Z4 covers `app/src/types/rive.d.ts`; no rule renumbered.
Revised 2026-10-05 (1.1.3, board item 29, game-feel phase 4): registry entry Z6 for the custom
feedback sheet and progress bar; no rule changed. U3's correct example names the progress bar pair
`lesson-progress.ios.tsx` and `lesson-progress.android.tsx`, which item 29 deleted, so that example
no longer resolves; it is kept as written until a later revision picks a new pair.
Revised 2026-10-05 (1.1.4, board item 46, game feel second pass): registry entry Z7 for the game
kit of `GF-10`; no rule changed.
Revised 2026-10-05 (1.1.5, board item 49, applied at the merge of board item 59): rule U6 covers
the Lottie files and runtime of `GF-15`; no rule renumbered.
The rules start from two earlier TypeScript standards of Zach's, which hold the same owner policy as felto's `.personal-config.json` and
which `PLAN.md` BD-17 names. No rule id is copied from either: they use ids such as `F1`, `T1`,
`L1` and `X1` with other meanings (`PLAN.md`, section 0, row 25). The ids below are felto's own.

## How to read a rule

Every rule has an ID. IDs are never renumbered. A rule that stops applying is marked
`Retired <date>` and keeps its ID, so a citation such as "B3" always resolves. The letters were
picked so that no id here is also an id in `docs/conventions-python.md` or in either of the two
earlier standards.

Every rule carries an enforcement tag:

- *lint*: `expo lint`, with `eslint-config-expo/flat`, catches a violation.
- *gate*: the whole-repo gate catches a violation.
- *review*: nothing catches a violation. The rule holds only while each session reads it.

Every rule carries a provenance label:

- *[STANDARD]*: canonical for TypeScript, React Native or Expo, with the source named.
- *[COMMON]*: widespread, with the alternative named.
- *[OURS]*: a house choice, with its reason given.

Every rule has a correct and an incorrect example. The correct example is real felto code,
cited with its `file:line`, and checked by reading those lines on 2026-10-05 (board item 16). The
incorrect example is "written for contrast", because the repo holds no violation to quote; where
the repo does hold one, the rule says so and the violation is listed under "Known gaps".
Line numbers move, so before you rely on one, read the cited line.

## What lint settles, and what it does not

Lint is `expo lint` with `eslint-config-expo/flat` and no other plugin, and there is no
formatter (`PLAN.md`, BD-5). `app/eslint.config.js:5-12` loads `eslint-config-expo/flat` and an
ignore list for `ios`, `android` and `.expo`, and nothing else; no prettier config exists in
`app/`. Where that config settles something, the config is the rule and this file says nothing.
On 2026-10-05, `eslint-config-expo` 57.0.2 (in `app/node_modules`) turns on the recommended React
Hooks rules (`flat/utils/react.js:27`) and `@typescript-eslint/no-unused-vars`
(`flat/utils/typescript.js:70`), so this file has no rule for either. It never turns
`import/order` on: the one mention is an `off` for `.d.ts` files (`flat/utils/core.js:94`, under
`files: ['**/*.d.ts']` at `:91`). It does turn `import/first` on as a warning
(`flat/utils/core.js:85`). The owner policy asks for no import order, so this file has no
import-order rule.

So every rule below is tagged *review*. None of them is caught by the lint config above. The app
gate exists since board item 7 (`bun run --cwd app typecheck`, `lint` and `test`, in the
whole-repo gate of `CLAUDE.md`); `tsc --noEmit` with `strict` catches an implicit `any` and a
missing type, which is part of V1, but not an explicit `any` or `as unknown as`. A rule is
promoted to *lint* or *gate* only when a tool is shown to catch it, with the date and the
command, in this file.

## What the rules rest on

These are the plan's build decisions, checked 2026-10-05 in `docs/incomplete/app/PLAN.md`,
section 1. A rule that breaks one of them is wrong.

- The app is Expo SDK 57 in `app/`, with routes in `app/src/app/` (`DESIGN.md`, `D2`; `PLAN.md`,
  phase 3, step 2).
- Code under `app/src/game/`, `app/src/cards/` and `app/src/content/` runs in vitest in a node
  environment, so it imports no React Native module (BD-4).
- Every game rule takes the time as an argument (BD-12).
- Player state is stored on the phone in one versioned value, behind one data module (`D3`,
  BD-8).
- The SVG files are drawn from `assets/` through `@art/*`, which points at `../assets/*`
  (BD-6, BD-7, `D5`).
- Every colour and size is in `app/src/theme/tokens.ts`, and every dial is in
  `app/src/config/dials.ts` (BD-14).

## Names and exports

### N1. File and folder names are kebab-case

*review · [COMMON]* The alternative is PascalCase for component files, which React Native's own
templates once used. The owner policy is the ecosystem default
(`.personal-config.json`, `practices.file-naming`), and current Expo Router apps name files in
kebab-case. Router syntax is exempt: `_layout.tsx`, `(tabs)`, `[id].tsx` and `+not-found.tsx`
keep the names the router reads. A platform suffix (rule U3) comes after the kebab-case name.

Correct, `ls app/src/components/lesson app/src/app/lesson` (2026-10-05), a hook file, a platform
file and a router file:

```
app/src/components/lesson/use-lesson-run.ts
app/src/components/lesson/lesson-progress.ios.tsx
app/src/app/lesson/[id].tsx
```

Incorrect, written for contrast:

```
features/Baskets/components/modals/TimePickerSheet.tsx
```

### N2. Exports are named, and an exported function is a function declaration

*review · [OURS]* The owner policy is named exports only (`.personal-config.json`,
`practices.exports`). A named export is greppable by the name every caller uses. A `function`
declaration names itself in a stack trace and hoists. The one sanctioned default export is a
route file's (registry entry Z1).

Correct, `app/src/components/lesson/hearts-label.ts:2-4`:

```ts
export function heartsLabel(lives: number): string {
  return lives === 1 ? "1 heart" : `${lives} hearts`;
}
```

Incorrect, written for contrast:

```ts
export default (subtotalCents: number) => BUYER_FEE_CENTS;
```

## Boundaries

### B1. No parent-relative import; use `@/` for `app/src` and `@art/` for the art

*review · [OURS]* The owner policy bans parent-relative imports (`.personal-config.json`,
`practices.imports`). A `../` chain encodes where the importing file sits, so moving that file
breaks an import that had nothing to do with the move. `./sibling` is allowed. `@/*` points at
`app/src/*`, as in the house tsconfig (`PLAN.md`, section 0, row 7), and `@art/*` points at
`../assets/*` (BD-7), which is how the app reaches the generated SVG files without a `../`.

Correct, `app/src/components/stat-bar.tsx:3-4`:

```ts
import { Art } from "@/art/art";
import type { ArtName } from "@/art/sizes";
```

Incorrect, written for contrast:

```ts
import CardAceSpades from "../../../assets/icons/cards/card_A_spades.svg";
```

### B2. Code under `src/game/`, `src/cards/`, `src/content/` and `src/drills/` imports no React, React Native or Expo module

*review · [OURS]* These folders hold the rules, the evaluator, the content and the random
dealers. Their tests run in vitest in a node environment (BD-4), where a React Native import
fails to load, and they are the code where a silent error lives (`DESIGN.md`, hazard 4). Keeping
them free of the UI also keeps them free of render state. A screen imports from them; they never
import from a screen, a hook or `src/storage/`. `src/drills/` is added to the three folders that
BD-4 names because `PLAN.md` phase 14 checks it with seeded vitest tests in the same way.

Correct, `app/src/game/lives.ts:1-2`:

```ts
import { DIALS } from "@/config/dials";
import type { PlayerState } from "@/game/player-state";
```

Incorrect, written for contrast:

```ts
// app/src/game/lives.ts
import { Platform } from "react-native";
```

### B3. A rule never reads the clock; the time is an argument

*review · [OURS]* BD-12. A rule that calls `Date.now()` or `new Date()` cannot be tested at
21:00 New York time or on a daylight-saving date, which is where the streak breaks (`DESIGN.md`,
hazard 9). The caller reads the clock once, at the edge (a screen, a hook or the provider), and
passes the time in. The day key is the phone's local calendar date, built with local methods,
never UTC ones.

Correct, `app/src/game/lives.ts:20-22`; the clock is read once at the edge, in
`app/src/screens/learn-screen.tsx:16-17`:

```ts
export function livesAt(state: PlayerState, now: Date): number {
  return settleLives(state, now).lives;
}
```

Incorrect, written for contrast:

```ts
export function livesNow(state: PlayerState): number {
  return settleLives(state, new Date()).lives;
}
```

### B4. One data module reads and writes player state; a screen reaches it through the provider

*review · [OURS]* The owner policy is one data client (`.personal-config.json`,
`practices.data-layer`), and the design puts all player state behind one module (`D3`). In felto
that module is `app/src/storage/`: a pure core that loads, checks, migrates and saves the
versioned state, behind a thin adapter over `expo-sqlite/kv-store` (BD-8, `PLAN.md` phase 4).
Screens get the state and its actions from one provider and its hook. No other file imports
`expo-sqlite`, and no file calls `fetch`: the first version has no server (`D3`). The data
module is also the one place sync attaches later (`PLAN.md`, section 4).

Correct, `app/src/screens/learn-screen.tsx:15`:

```ts
const { status, state } = usePlayer();
```

Incorrect, written for contrast:

```ts
import Storage from "expo-sqlite/kv-store";
const saved = Storage.getItemSync("player");
```

## Types

### V1. `strict` is on, and the type layer has no silent escape hatch

*review · [OURS]* The owner policy is strict types (`.personal-config.json`, `practices.types`).
`app/tsconfig.json` extends `expo/tsconfig.base` with `strict: true`, as the house tsconfig does
(`PLAN.md`, section 0, row 7). Banned: `any`, `as unknown as`, `@ts-ignore`, and a non-null `!`
on a value that can be absent. `@ts-expect-error` is allowed with a reason on the same line. The
Python standard has no type hints (its rule H3) because no type checker runs over `tools/`; here
one does, so the same owner policy gives a different rule. The two standards do not contradict
each other.

Correct, `app/tsconfig.json:1-4`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
```

Incorrect, written for contrast:

```ts
const exercise = raw as unknown as Exercise;
```

### V2. A closed set of values is a string-literal union, never an `enum`

*review · [COMMON]* The alternative is a TypeScript `enum`, which is a runtime object that the
type checker treats as a type. A union of strings costs nothing at run time and reads the same in
the stored JSON as in the code. The exercise kinds of `DESIGN.md` 10.4 are the first such set.

Correct, `app/src/content/schema.ts:10`:

```ts
export type ExerciseKind = "concept" | "hand-name" | "showdown" | "preflop" | "outs" | "odds";
```

Incorrect, written for contrast:

```ts
export enum ExerciseKind { Concept, HandName, Showdown, Preflop, Outs, Odds }
```

### V3. Content is typed with `satisfies` against the schema

*review · [OURS]* BD-10. Lessons are TypeScript modules, and each one is checked with `satisfies`
against the content schema, so a malformed exercise fails the typecheck before it fails a test.
`satisfies` keeps the literal types of the data, where an annotation such as `: Unit` would widen
them. The structural validator of `PLAN.md` phase 5 still runs: a type cannot count ten
exercises in a lesson.

Correct, `app/src/content/units/hands.ts:8-10` and `:498`, cut in the middle:

```ts
export const unitHands = {
  id: "hands",
  title: "Hands",
  // ...
} satisfies Unit;
```

Incorrect, written for contrast:

```ts
export const unitHands: any = { id: "hands", title: "Hands", lessons: [/* ... */] };
```

## Logic and comments

### O1. A function is roughly 6 to 15 lines; markup and data are exempt

*review · [OURS]* The owner policy is functions of 6 to 15 lines (`.personal-config.json`,
`practices.function-length`). A function that fits on a screen can be read at a glance and
tested alone. The JSX a component returns and a content or token table do not count toward the
lines. Do not split a function only to meet the count: a helper that needs three parameters to
explain itself was the wrong cut (rule O2).

Correct, `app/src/game/lives.ts:12-18`, seven lines:

```ts
export function settleLives(state: PlayerState, now: Date): PlayerState {
  if (state.lives >= DIALS.maxLives) return state;
  const regained = Math.floor((now.getTime() - state.livesClock) / REGAIN_MS);
  if (regained <= 0) return state;
  const lives = Math.min(DIALS.maxLives, state.lives + regained);
  return { ...state, lives, livesClock: state.livesClock + regained * REGAIN_MS };
}
```

Incorrect, written for contrast:

```ts
export function finishLesson(state: PlayerState, result: LessonResult, now: Date): PlayerState {
  // 40 lines that award XP, extend the streak, spend a freeze and open the next node
}
```

### O2. Logic is extracted by concept, into a pure function or a hook

*review · [OURS]* The owner policy is logic extracted by concept (`.personal-config.json`,
`practices.logic-placement`). A rule of the game is a pure function in `src/game/` (rule B2). A
component with more than two `useState` calls, or a `useEffect` that does real work, moves that
logic into a hook. One hook per file, and the file is named for the hook (`use-player.ts` holds
`usePlayer`). Extract a concept, not a block of lines.

Correct, `app/src/components/lesson/lesson-run-view.tsx:43`:

```ts
const { run, exercise, size, feedbackWords, choose, check, moveOn, onFeedback } = useLessonRun(session, start, pick);
```

Incorrect, written for contrast:

```ts
const [index, setIndex] = useState(0);
const [choice, setChoice] = useState<number | null>(null);
const [checked, setChecked] = useState(false);
useEffect(() => { /* 30 lines that score the answer and spend a life */ }, [checked]);
```

### O3. A comment says why, never what

*review · [OURS]* The owner policy is comments that explain why (`.personal-config.json`,
`practices.comments`). A comment that repeats the line below it is removed; rename or extract
instead. A comment that records a reason the code cannot show is required: a decision id such
as `D8` or `BD-12`, a platform workaround, or why a number is what it is. Never delete a
comment of that kind in bulk.

Correct, `app/src/storage/migrations.ts:11-13`, the first sentences of a comment that gives a
reason the code cannot show:

```ts
  // Version 2 (PLAN.md phase 11, D11): settings gain the daily reminder, on at 19:00. The time is
  // written out, not read from the dial, because it is what version 2 meant when it was written;
  // a later change to the dial must not change what an old save turns into. Every field of
```

Incorrect, written for contrast:

```ts
// add 10 to the xp
xp += 10;
```

## Screens and Expo

### U1. A route file is thin: it renders one `*Screen` component and nothing else

*review · [COMMON]* The alternative is a route file that holds the screen itself, which Expo
Router allows. A thin route keeps the screen importable and testable without the router, and
keeps the router's naming rules in one folder. A route file under `app/src/app/` default-exports
one function that renders one component whose name ends in `Screen`, and may re-export an
`ErrorBoundary`. It holds no state, no hook and no layout. `_layout.tsx` files hold the
navigator and nothing else.

Correct, `app/src/app/lesson/[id].tsx:1-7`:

```tsx
import { LessonScreen } from "@/screens/lesson-screen";

export default function LessonPage() {
  return <LessonScreen />;
}

export { RouteError as ErrorBoundary } from "@/components/route-error";
```

Incorrect, written for contrast:

```tsx
export default function LessonPage() {
  const [index, setIndex] = useState(0);
  return <View>{/* 120 lines of the lesson */}</View>;
}
```

### U2. An `@expo/ui` control is drawn inside a `Host`

*review · [STANDARD]* `@expo/ui` 57.0.21 describes `Host` as "a bridging container that hosts
SwiftUI views on iOS and Jetpack Compose views on Android"
(`@expo/ui/build/universal/Host/index.d.ts:2-5`, in `app/node_modules`), and
the Expo `expo-ui` skill says every `@expo/ui` tree is wrapped in `Host`
(`~/.claude/plugins/cache/claude-plugins-official/expo/1.13.2/skills/expo-ui/SKILL.md:21`). The
design uses `@expo/ui` wherever a native control exists (`D2`, `DESIGN.md` 10.3). Size the `Host`
with `matchContents` or a style, so it does not collapse to zero.

Correct, `app/src/components/route-error.tsx:19-21`:

```tsx
<Host matchContents>
  <Button label={ROUTE_ERROR_RETRY} onPress={retry} />
</Host>
```

Incorrect, written for contrast:

```tsx
<View>
  <Button onPress={check}>Check</Button>
</View>
```

### U3. Code for one platform lives in a `.ios.tsx` or `.android.tsx` file

*review · [STANDARD]* Metro resolves `name.ios.tsx` and `name.android.tsx` before `name.tsx`
for its default platforms, which are `ios`, `android`, `windows` and `web`
(`metro-config/src/defaults/defaults.js:70`, in `app/node_modules`). A file that imports `@expo/ui/swift-ui` or
`@expo/ui/jetpack-compose` is a platform file, and its pair exports the same names with the same
props. The lesson progress bar is the first such pair: `ProgressView` on iOS and
`LinearProgressIndicator` on Android (`DESIGN.md` 10.3). A `Platform.OS` check is allowed for a
value, such as a size, but not to pick between two component trees.

Correct, `app/src/components/lesson/lesson-progress.ios.tsx:1` and
`lesson-progress.android.tsx:1`, with `lesson-progress.d.ts` holding the one shape both export:

```
lesson-progress.ios.tsx      import { Host, ProgressView } from "@expo/ui/swift-ui";
lesson-progress.android.tsx  import { Host, LinearProgressIndicator } from "@expo/ui/jetpack-compose";
lesson-progress.d.ts         export declare function LessonProgress(props: LessonProgressProps): JSX.Element;
```

Incorrect, written for contrast:

```tsx
return Platform.OS === "ios" ? <ProgressView value={done} /> : <LinearProgressIndicator progress={done} />;
```

### U4. A screen that reads state draws its loading, empty and error states

*review · [OURS]* The owner policy is all three states (`.personal-config.json`,
`practices.states`). In felto the state is local, so the three are concrete: loading is the time
before the stored value is read; empty is a player with no progress yet; error is a stored value
that cannot be read, which the data module has copied to a backup key (rule Q2). The empty state
is the one a new player sees first. Each screen names its three states, or says which of them
cannot happen and why.

Correct, `app/src/screens/learn-screen.tsx:10-13` names the three states (there is no loading
state, because the provider reads the player before the first frame), and `:20-22` draws the
error and the empty one:

```tsx
{status === "recovered" ? <RecoveredBanner /> : null}
<PathGreeting mood={greetingMood(state, now)} />
<LearnPath units={pathUnits(state)} />
```

Incorrect, written for contrast:

```tsx
if (!state) return null;
return <Path state={state} />;
```

### U5. Colours and sizes come from tokens, each with a light and a dark value

*review · [OURS]* The owner policy is tokens only (`.personal-config.json`,
`practices.design-tokens`). Every colour and size the app uses is in `app/src/theme/tokens.ts`
(BD-14). Every colour has a light and a dark value, because the app follows the phone's
appearance (`D16`). A colour copied from the art cites the generator line it came from, so a
change in the generator can be found from the app. No hex value and no raw size appears in a
screen or a component.

Correct, `app/src/theme/tokens.ts:23-26` (a light and a dark table under one name):

```ts
export const COLOURS: Record<Scheme, Record<ColourName, string>> = {
  light: {
    page: "#F4F5FA",
    text: "#1B1B24", // INKL, tools/common.py:10
```

Incorrect, written for contrast:

```tsx
<Text style={{ color: "#38B6F5", fontSize: 17 }}>{gems}</Text>
```

### U6. The art, the sound, the Lottie effects and the Rive file come from the one art module

*review · [OURS]* The generated SVG files are the only art (`D5`, `DESIGN.md` section 9), and the
generated WAV files are the only sound (`D15`). They are imported from `@art/...` (BD-6, BD-7),
and only `app/src/art/` imports them. The same holds for the rigged Flop: `app/src/art/` alone imports `rive-react-native` and `@rive/flop.riv` (`app/src/art/rive-boundary.test.ts` fails the gate otherwise), and for the generated effects: `app/src/art/` alone imports `lottie-react-native` and a file under `@art/lottie/` (`app/src/art/lottie-boundary.test.ts` fails the gate otherwise; `app/src/art/effects.ts` names them). Every other file asks the art module for a card, a node,
an icon, a mascot, a sound or an effect by name (`PLAN.md` phase 8, step 2; `app/src/art/registry.ts` for
the SVGs and `app/src/art/sounds.ts` for the WAVs). No SVG is copied under `app/`, and no app
tool writes or edits a file under `assets/`. An art change the app needs is a change to a generator, under
`docs/conventions-python.md`.

Correct, `app/src/components/exercise/card-row.tsx:27`:

```tsx
<CardArt key={card} card={card} width={cardWidth} />
```

Incorrect, written for contrast:

```tsx
import CardAceSpades from "@art/icons/cards/card_A_spades.svg"; // in a lesson screen
```

## Tests and stored data

### Q1. A feature's tests go in a new file named for the feature, next to the code

*review · [OURS]* The owner policy is a new test file for each feature
(`.personal-config.json`, `practices.test-policy`), so two sessions working at once never edit
one test file. Tests are vitest in a node environment, on pure logic only, and are named
`<feature>.test.ts` beside the file they test (BD-4). A screen is proven by a screenshot on both
platforms, not by a component test. A characterization test is written before logic moves, not
after.

Correct, `ls app/src/game` (2026-10-05):

```
app/src/game/lives.ts
app/src/game/lives.test.ts
```

Incorrect, written for contrast:

```
app/src/game/streak.ts
app/src/game/misc.test.ts   (a 40th case appended for the streak)
```

### Q2. A change to the stored state's shape bumps its version and ships a migration

*review · [OURS]* `D3` and the rule that stored player data is migrated, never dropped
(`docs/AGENT-PRACTICES.md`, Part 6, re-added 2026-10-05). The stored value carries a `version`
field (BD-8). A change to its shape raises the version, adds a migration from the old version,
and adds a test that loads a saved value of the old shape and gets the new one. A stored value
the data module cannot read is copied to a backup key before a fresh state is written.

Correct, `app/src/storage/migrations.ts:16-20`, with its test in `migrations.test.ts`:

```ts
1: (old) => {
  if (!isRecord(old) || !isRecord(old.settings)) return old;
  const reminder = { on: true, hour: 19, minute: 0 };
  return { ...old, settings: { ...old.settings, reminder } };
},
```

Incorrect, written for contrast:

```ts
if (saved.version !== CURRENT_VERSION) return freshState();
```

### Q3. Every answer key a program can check is computed a second time by a test

*review · [OURS]* `DESIGN.md` 10.4 and hazard 4: a wrong answer key passes every other gate. Each
`hand-name`, `showdown`, `preflop`, `outs` and `odds` exercise has its key written by the author
in the data, and a test computes it again from the cards, the chart or the numbers. A
disagreement fails the test and is resolved by reading both, never by copying the test's answer
into the data unread. `concept` keys are checked by review only.

Correct, `app/src/content/keys.test.ts:45-50`:

```ts
it("has every checkable key equal to the computed key", () => {
  const wrong = exercises
    .map((ex) => ({ id: ex.id, written: ex.answer, computed: computeKey(ex, { chart: OPENING_CHART }) }))
    .filter(({ written, computed }) => computed !== null && computed !== written);
  expect(wrong).toEqual([]);
});
```

Incorrect, written for contrast:

```ts
it("unit 1 has keys", () => {
  expect(unitHands.lessons.every((l) => l.exercises.every((e) => e.answer >= 0))).toBe(true);
});
```

## Sanctioned divergence registry

These are the only sanctioned exceptions to the rules above. Anything else that breaks a rule is
drift, and drift is fixed by a board item, not in passing. A new entry needs a recorded reason
and the owner's agreement.

| # | Rule it departs from | Where | Reason |
|---|---|---|---|
| Z1 | N2 (named exports only) | Route files under `app/src/app/`, which default-export their screen function (for example `app/src/app/lesson/[id].tsx:3`) | Expo Router reads a route's default export; it is the one place the framework requires one (`PLAN.md`, BD-16). A config file that a tool loads by default export (`app/vitest.config.mts:6`) falls under the same reason, and so does a CommonJS config file that sets `module.exports` (`app/eslint.config.js:7`, `app/metro.config.js:19`, `app/svg-transformer.js:23`), because ESLint, Metro and the SVG transformer read it that way. |
| Z2 | U1 (a `_layout.tsx` holds the navigator and nothing else) | `app/src/app/_layout.tsx` renders `RootProviders` around `RootStack` (`app/src/components/root-providers.tsx`, which mounts `PlayerProvider` and `ReminderSync`) | The player provider (rule B4) and the reminder sync (`D11`, BD-18) must sit above every route, and the navigator itself reads the player to guard onboarding (`D20`). The layout file stays a thin render of two components; the providers and the navigator live in `app/src/components/`. |
| Z3 | N1 (kebab-case file names) | `app/assets/fonts/FeltoRank.ttf` and `FeltoRank-OFL.txt` | The file name is the font family name. On Android, `react-native-svg` finds an embedded font by its file name, so the name must equal the `'FeltoRank'` that `tools/build_icons.py` writes into every card face (`D14`, `PLAN.md` BD-22). Renaming the file breaks the ranks. |
| Z4 | N2 (named exports only) | The ambient module declarations `app/src/types/svg.d.ts:13`, `app/src/types/sound.d.ts:5` and `app/src/types/rive.d.ts`, which declare `export default` inside `declare module` | They describe what Metro hands back for an `.svg`, `.wav` or `.riv` import, which is a default export; they define no export of felto's own. |
| Z5 | `D2` (a native `@expo/ui` control wherever one exists), which U2 and U3 carry into code | `PrimaryButton` in `app/src/components/button/primary-button.tsx`, a React Native `Pressable` drawn the same on iOS and Android, used for Check and Continue (`app/src/components/lesson/lesson-run-view.tsx:65-69`, `feedback-sheet.tsx:49`) | `GF-2` of `docs/incomplete/game-feel/DESIGN.md`, agreed by Zach on 2026-10-05: a native `Button` cannot take a raised edge or a press that sinks it, which every button in the Duolingo references has. Switches, pickers and the time dialog stay native. Because it imports no `@expo/ui`, the button is one file, not a U3 pair (`PLAN.md` BD-G7). |
| Z6 | `D2`, which U2 and U3 carry into code | The answer feedback sheet `app/src/components/lesson/feedback-sheet.tsx` and the lesson progress bar `app/src/components/lesson/lesson-progress.tsx`, React Native views drawn the same on iOS and Android | The amendment under `GF-2` of `docs/incomplete/game-feel/DESIGN.md`, Zach's answer of 2026-10-05 (board item 29): he wants controls to carry the app's tokens, and the native `@expo/ui` sheet and progress views do not. The sheet now rises on the plan's spring and pads above Android's gesture bar. Its screen-reader behaviour is written by hand (`use-sheet-focus.ts`, `LessonFrame`'s `overlayModal`). Every other native control stays native |
| Z7 | `D2`, which U2 and U3 carry into code | The game kit in `app/src/components/kit/`: `GameText`, `RollingNumber`, `Bubble`, `Popover`, `Tag`, `Sparkles`, `SparkleBurst`, `GameButton`, `GameSwitch`, `GameSheet`, `GameDialog` and `Scrim`, React Native views drawn the same on iOS and Android, shown together on the development route `/dev/kit` | `GF-10` of `docs/incomplete/game-feel/DESIGN.md`, Zach's answer of 2026-10-05 ("All, with a custom tab bar too"): every native control left is replaced by a piece drawn from the tokens, and this entry supersedes the last sentence of Z5 and of Z6 for each control a later item replaces. What the native pieces gave for free is written by hand, piece by piece: the switch has the `switch` role, its label and its checked state; the sheet, the dialog and the popover are modal for a screen reader, move its focus to their title (`use-sheet-focus.ts`), close on the reader's escape gesture and on Android's back button (`use-back-close.ts`); layered text (`GameText`, `RollingNumber`, `Bubble`) is read once, whole. Text on a tone's face is large text or a pair of `TAG_PAINT` (`app/src/theme/tokens.ts`). No gate checks any of this; each later item that wires a piece into a screen checks it with a screen reader |

## Known gaps

These are places where the code departs from a rule and no registry entry sanctions it. They
are listed so a later board item can close them; they are not licences. Counted and read on
2026-10-05 (board item 16).

- U5: every text style spells its weight as a raw string, `fontWeight: "800"`, `"700"`,
  `"600"` (45 sites under `app/src`, for example `app/src/components/stat-bar.tsx:66`).
  `app/src/theme/tokens.ts` has `TYPE` sizes but no weight tokens. A weight is not a colour or a
  size, so the rule's text does not forbid it, but its reason does: one place to change the type.
- O1: two hooks run past 15 lines: `useLessonRun` in `app/src/components/lesson/use-lesson-run.ts:17-56`
  (40 lines) and `useLoadFixture` in `app/src/screens/use-load-fixture.ts:13-34` (22 lines). Both
  are a hook that wires one concept to several effects; the rule's own note says not to split a
  function only to meet the count.
- O3: `app/src/components/boss/unit-exercises.ts:11` and `app/src/storage/use-stored-player.ts:7`
  hold a comment that says what, not why (audits of items 14 and 8).
- U5: colour comments cite `tools/build_icons.py` line numbers
  (`app/src/theme/tokens.ts:29`, for example), which move when the generator changes; nothing
  checks them. U5 asks for the citation and does not say how it stays true.

## Owner policy, as it applies to `app/`

Zach answered these policies for the whole of his work in `.personal-config.json`. This table
says how each one applies to the TypeScript in `app/` (2026-10-05).

| Policy | How it applies here | Rule |
|---|---|---|
| Comments explain why only | As written | O3 |
| Functions of roughly 6 to 15 lines | Markup and data tables exempt | O1 |
| Named exports only | Route files default-export (Z1); tool-read files and ambient types (Z1, Z4) | N2 |
| Ecosystem-default file names | kebab-case; router syntax exempt | N1 |
| No parent-relative imports | `@/` and `@art/` aliases | B1 |
| Strict types | `strict`, no escape hatches | V1 |
| Extract by concept | Pure functions for rules, hooks for screens | O2, B2 |
| One data client | One data module over `expo-sqlite/kv-store`; no `fetch` | B4 |
| Loading, empty and error states | Named for each screen that reads state | U4 |
| Tokens only for design values | Light and dark values in `tokens.ts` | U5 |
| A new test file for each feature | Colocated `*.test.ts`, vitest, node | Q1 |
| Copy registers asked, never picked silently | Settled for the app: the warm register of `D10`. Each phase lists the strings it added | none |
| Note and raise, no drive-by fixes | Drift is fixed by a board item | Registry |

## Outside this file

These rules govern the same files but live elsewhere. The art rules (never hand-edit a generated
SVG, never touch `assets/higgsfield/`) are in `CLAUDE.md`. The rule that every screen is seen on
both platforms before its phase is called built, and the rule that stored player data is
migrated and never dropped, are process rules in `docs/AGENT-PRACTICES.md`, Part 6.
