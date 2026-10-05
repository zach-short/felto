# Runtime pass: the felto app

Final form, written 2026-10-05 for board item 16 (app phase 12). This list holds only what a
person on a device must still check. An agent has already seen the main flows on the iPhone 17
Pro simulator and the `Pixel_9` emulator, light and dark (`HANDOFF.md`, steps 13 and 19 to 25).
It cannot hear a sound, feel a haptic, rotate an iOS simulator, tap a notification that
arrives, or read an app on a real phone. Each entry gives the steps, then what to look for.
The entries are in the order to walk them: art and sound first, then a first launch, then each
tab and session, then the other devices. Walk the order once on one phone, then walk the section
"Other devices" on each device named there.

## Setup

- Build once: `bun run --cwd app ios`, and
  `JAVA_HOME=$(/usr/libexec/java_home -v 17) ANDROID_HOME=~/Library/Android/sdk bun run --cwd app android`.
  The Android emulator reaches Metro only after `adb reverse tcp:8081 tcp:8081`.
- A fixture is a named player. Load one with `felto://dev/fixture/<name>`: on iOS
  `xcrun simctl openurl booted felto://dev/fixture/<name>`, on Android
  `adb shell am start -a android.intent.action.VIEW -d "felto://dev/fixture/<name>"`. Quote every
  Android link that holds `&`, because `&` splits an `adb shell` command. The names are:
  `fresh` (a first launch, so it opens onboarding), `unit1-mid` (lessons 1 to 3 done, 2
  hearts, 20 gems, a 4-day streak), `zero-lives` (0 hearts, 20 gems), `boss-ready` (unit 1's
  five lessons done, the boss open), `placed` (the state after passing the placement check) and
  `all-done` (all four units finished, every Practice kind open).
- Other development links: `felto://dev/art` (the art check, with a sample stat bar that holds a
  freeze), `felto://dev/reminders` (what the phone has scheduled),
  `felto://lesson/<id>?at=<n>&pick=<m>&check=1` (a lesson at one exercise, with a choice made
  and checked), `felto://boss/hands?seed=7&play=rrrrwrrrrw` (a boss played by a script, `r` right
  and `w` wrong), `felto://practice-set?seed=5&deal=<kind>`, and
  `felto://onboarding/placement?seed=7&play=rrrrwrrrrw`. These work only in a development build.
- A fixture link during a cold start can be dropped. Open the app first, then send the link.

## A. Look at the art and hear the sounds

1. **The streak freeze icon (D19).**
   Steps: open `assets/icons/ui/streak_freeze.svg` in a browser, and open `felto://dev/art`.
   Look for: the streak flame drawn in ice blue, with the same shape and the same hard shadow
   as the orange flame, readable at the size of the stat bar. Zach approves or asks for a
   change in `ui_freeze()` in `tools/build_icons.py`. Owed since ledger step 11.
2. **The six sounds, by ear (D15).**
   Steps: for each of `answer_right`, `answer_wrong`, `lesson_finish`, `boss_pass`, `boss_fail`,
   `chest_open`, run `afplay assets/sounds/<name>.wav`. Then hear them in the app in entries 12,
   14 and 21.
   Look for: short, soft, bell-like tones, no click at either end, the wrong and fail sounds
   gentle and not a buzzer, the finish and pass sounds clearly happier. To retune, edit the
   notes in `tools/build_sounds.py` and run the gate. Owed since ledger steps 14, 21, 22, 25.
3. **The card ranks (D14).**
   Steps: on iOS and on Android, open any lesson that shows cards (`felto://lesson/hands-2?at=1`).
   Look for: the rank letters in a rounded, bold face, the same shape on both platforms (the
   embedded `FeltoRank`). If Android draws a plain Arial-like face, the font did not load and
   the SVG fallback list took over: the file `app/assets/fonts/FeltoRank.ttf` and its name in
   `app.json` are the places to look. Owed since ledger step 13.
4. **Hard shadows and pale nodes in dark mode (D16).**
   Steps: turn the phone to dark, open `felto://dev/fixture/unit1-mid`, scroll the whole path.
   Look for: every hard shadow darker than the page; the locked nodes (pale discs as the art is
   generated) and the faded chests (very dim on a dark page). Decide whether the pale locked
   nodes and the dim chest are acceptable, or ask for dark-mode art. Owed since ledger steps
   19 and 25.

## B. A first launch and onboarding (D20)

5. **Three screens before the path.**
   Steps: load `fresh` (or install fresh).
   Look for: the happy fish, "Hi, I am Flop!" and "Nice to meet you"; then "Meet the table" with
   Flop, Kicker and Ace, each happy beside its job, and "Deal me in"; then the three happy,
   "How much poker do you know?" and the buttons "I am new" and "I know the basics". No
   notification prompt at any point.
6. **"I am new" starts at unit 1, and onboarding never comes back.**
   Steps: tap "I am new", then close the app fully and open it again.
   Look for: the path with "Meet Flop, your guide. Your first lesson is just below." and "Ranks
   and suits" as the one current stop, the bar reading 0, 0, 5, 0; the same path after the
   restart; the back gesture does not return to onboarding.
7. **The check spends nothing.**
   Steps: from `fresh`, tap "I know the basics"; answer one right and one wrong; tap the cross
   (on Android also press Back).
   Look for: the fish beside each exercise and no heart count; "Nice read!" and "So close." as
   in a lesson; "Leave the check?", and Leave goes back to the question screen so the check can
   start again.
8. **Eight right passes; seven right does not.**
   Steps: from `fresh`, open `felto://onboarding/placement?seed=7&play=rrrrwrrrrw`, then again
   from `fresh` with `play=rrrwrrwrrw`.
   Look for: the first gives the cheering fish, "You know your stuff!", "8 of 10 right. Units 1
   and 2 are done, and unit 3, Preflop, is open." and, after "Go to the path", units 1 and 2 with
   every stop checked, both reviews green, each chest faded with "You placed past this unit.
   Beat Ace to win its chest.", and "Hands in shorthand" as the only current stop. The second
   gives the happy fish, "Unit 1 it is!", "7 of 10 right. You need 8 to skip ahead, so you start
   at unit 1." and the path with "Ranks and suits" current. The fixture `placed` draws the first.
   Item 20's own fix round (ledger step 25 lists none) has no separate entry; this entry is its
   walk.

## C. The Learn tab

9. **A part-way player sees where they are.**
   Steps: load `unit1-mid`; scroll unit 1.
   Look for: "Ranks and suits", "The ten hands" and "Name that hand" with the gold check;
   "Kickers break ties" as the blue star with a gold arc from the top, clockwise, over three
   fifths of the ring; "Who wins the pot?", "Beat Ace" and "Review with Kicker" locked; units 2
   to 4 all locked; each unit's chest faded; the bar reading flame 4, bolt 240, heart 2, gem 20
   and no blue freeze flame.
10. **The fish naps until a lesson is finished today.**
    Steps: on the same path, read the line beside the fish.
    Look for: "Shh, Flop is napping. One lesson today counts for your streak." After a lesson is
    finished that day the fish wakes. A new player (fixture `fresh`, after "I am new") sees
    "Meet Flop, your guide." instead.
11. **Progress survives a restart.**
    Steps: load `unit1-mid`, close the app fully, open it again.
    Look for: the same path and bar as entry 9. Nobody has screenshotted this; it proves the
    provider reads and writes the store on a device (ledger step 15, owed since step 19).
12. **A held freeze shows in the bar (D19).**
    Steps: open `felto://dev/art` (no fixture holds a freeze).
    Look for: the sample bar reading flame 12, a blue freeze flame with 2, bolt 1450, heart 5,
    gem 40. Also read the bar by touch: with VoiceOver or TalkBack on, the sample bar reads
    "12 day streak", "2 streak freezes", "1450 XP", "5 hearts", "40 gems". The singular forms
    need a bar that shows 1, and no fixture has one (`unit1-mid` reads "4 day streak", "240 XP",
    "2 hearts", "20 gems"): load `unit1-mid`, answer one lesson exercise wrong to reach "1 heart"
    on Learn, and buy one freeze in entry 35 for "1 streak freeze" (the bar draws no number at 1).
    This is one of the four small fixes of board item 16.
13. **The three tabs follow the phone's dark mode (D16).**
    Steps: open Learn, Practice and Profile in light and in dark.
    Look for: on dark, a near-black page and every hard shadow darker than the page; the tab
    bar native on both platforms (on iPadOS 26 the tabs sit at the top).
14. **The current node tells a screen reader its progress.**
    Steps: with VoiceOver or TalkBack on, touch the current node in `unit1-mid`.
    Look for: "Kickers break ties, up next, 3 of 5 lessons done". A finished node reads
    "finished" and a locked node "locked". Fix from board item 16.

## D. Lessons

15. **Open the first lesson.**
    Steps: load `fresh`, tap "I am new", tap "Ranks and suits". Tap a locked stop: nothing
    happens.
    Look for: a full-screen lesson with a close cross, a progress bar and 5 hearts at the top,
    the thinking fish beside "Every hand of poker is dealt from one standard deck. How many cards
    are in it?", three choices 48, 52, 54, and a grey Check button.
16. **A right answer is praised, with sound and a buzz.**
    Steps: tap 52, then Check.
    Look for: 52 turns green; a sheet rises with the cheering fish, "Nice read!" and the
    explanation; the right-answer sound plays (not with the iPhone's silent switch on, and not
    with Sound off); the phone gives a success buzz; the progress bar moves one tenth. Owed:
    sounds heard and haptics felt, ledger steps 21 and 22.
17. **A wrong answer costs a heart and names the answer.**
    Steps: answer the next exercise wrong.
    Look for: the chosen choice red and the right one green; the sad fish, "So close." and "The
    answer: ..."; the heart count drops by one at once; an error buzz and the wrong-answer sound.
    Press Check twice fast on a wrong answer: only one heart is spent (the fix of ledger step 23).
18. **A whole lesson counts.**
    Steps: play "Ranks and suits" to the end with 8 right and 2 wrong.
    Look for: the happy fish, "Lesson finished!", "8 of 10 right. Flop is proud of you.", "+80
    XP", "1-day streak" and the lesson-finished sound; Continue goes back to the path, where
    "Ranks and suits" has the gold check, "The ten hands" is the one current stop, and the bar
    reads flame 1, bolt 80, heart 3.
19. **Leaving a lesson part way gives nothing (D8).**
    Steps: after one answer tap the cross; on Android also press Back, once with the feedback
    sheet open and once on the next exercise.
    Look for: "Leave this lesson?" with Stay and Leave every time (STAY and LEAVE on Android);
    Stay brings the sheet back; Leave goes to the path with no XP added and the lesson still
    current; hearts already lost stay lost. Before the first answer the cross leaves at once.
20. **Every exercise kind draws, light and dark.**
    Steps: open `felto://lesson/<id>?at=<n>` for `hands-1` 0 (concept), `hands-2` 1 (five
    cards), `hands-4` 2 and `hands-5` 2 (two and three players), `hands-3` 4 (a seven-card hand:
    "Your hole cards" J of hearts and J of diamonds above "The board" 8 8 3 3 A), `preflop-2` 5,
    `odds-1` 4 (outs), `odds-3` 3 (pot odds), `odds-4` 3 (rule of 2 and 4), `odds-5` 2 (call or
    fold). Add `&pick=<m>&check=1` to see the feedback.
    Look for: cards in rows that fit the screen, players side by side under the board, numbers
    in small tiles for the odds kinds, choices readable in both modes, and the feedback sheet
    not covering the choices on a small phone (see entry 33).
21. **The lessons read well (strings, content).**
    Steps: play through one lesson of each unit, or read the four files in
    `app/src/content/units/`.
    Look for: copy in the warm register of D10; the lesson titles and hand descriptions; the
    preflop chart in `app/src/content/opening-chart.ts` (a simplified teaching chart, tighter than
    published solver charts, with no source cited). Zach has read none of the copy: ledger steps
    16 to 18.

## E. The boss, the review, the chest and lives

22. **The boss opens after five finished lessons, hosted by the shark.**
    Steps: load `boss-ready`; scroll to "Beat Ace" and tap it.
    Look for: the lesson modal with the shark thinking beside the exercise and 5 hearts; a right
    answer shows the shark sad with "Nice read!", a wrong one the shark smug and a heart gone.
23. **A boss played wholly by hand.**
    Steps: from `boss-ready`, play all ten exercises of "Beat Ace" yourself, with no `play=`
    link, once passing (8 right) and once failing (6 right). No agent has done this: the runs
    used a script (ledger step 22).
    Look for: the same results as entries 24 and 25, the sounds and buzzes on every answer, and
    no stuck state at the end.
24. **Eight right passes the boss, and the chest gives 20 gems once (D8).**
    Steps: `boss-ready`, play "Beat Ace" with 8 right (or `felto://boss/hands?seed=7&play=rrrrwrrrrw`);
    tap "Open the chest" twice.
    Look for: the sad shark, "You beat Ace!", "8 of 10 right. Kicker found a chest for you.", "+80
    XP"; the happy squid by the chest, "Kicker found a chest!"; then the cheering squid, the gem,
    "+20 gems!" and "You have 40 gems now."; on the path the bar reads 40 gems, the unit 1 chest
    is at full strength, "Beat Ace" has the gold check, "Review with Kicker" is green and unit 2's
    first lesson is current. Playing the boss again and passing gives no second chest. Pressing
    Back on the boss finish screen skips the chest, which stays tappable (ledger step 22, open).
25. **Fewer than 8 right fails, and the boss stays open.**
    Steps: `boss-ready`, play with 6 right (`felto://boss/hands?seed=11&play=rrrrrrwwww`).
    Look for: the smug shark, "Ace wins this round.", "6 of 10 right. You need 8 to win. Have
    another go when you are ready.", "+60 XP", 1 heart left; the path still shows the purple
    boss, the review locked and the chest faded.
26. **The review costs no hearts and puts the misses first (D8).**
    Steps: after a pass, tap "Review with Kicker"; answer two wrong.
    Look for: the squid thinking beside each exercise; the heart count does not move; the finish
    shows the happy squid, "Review finished!", "8 of 10 right. Kicker is impressed."
27. **At 0 hearts the current lesson does not open; the sheet offers the refill (D8).**
    Steps: load `zero-lives`; tap "Kickers break ties".
    Look for: a sheet over the path with the sleeping fish, "Out of hearts for now.", "One more
    is ready at {time}." (4 hours after the fixture loaded, in the phone's own 12 or 24 hour
    form: this line now uses the one clock format of the app, a fix of board item 16), "Or fill
    all 5 hearts now for 20 gems.", the gem count 20, "Refill for 20 gems" and "Back to the
    path". Refill opens the lesson with 5 hearts and the bar shows 0 gems.
28. **Without 20 gems the sheet only waits.**
    Steps: after the refill, lose 5 hearts (`felto://lesson/hands-4?play=wwwww`), Continue, tap the
    lesson again.
    Look for: the sheet without a refill button: "A refill costs 20 gems. Beat a boss and its
    chest holds 20." and gem count 0; "Back to the path" closes it. A lesson that loses its last
    heart part way shows the plain closed screen with the same time line.

## F. The Practice tab (D21)

No fixture except `all-done` opens a practice kind: unit 1 opens only when its boss is passed.

29. **A new player sees what practice holds.**
    Steps: load `fresh`, tap "I am new", open Practice.
    Look for: the thinking squid beside "Kicker deals fresh hands for everything you have
    learned. Finish unit 1 to open the first two."; five rows, each with a faded lock: "Name the
    hand" and "Who wins?" say "Finish unit 1, Hands, to open this.", "Raise or fold" says unit 3,
    "Count the outs" and "Pot odds" say unit 4; no Start button.
30. **Passing unit 1 opens two kinds.**
    Steps: `boss-ready`, pass the boss, open Practice.
    Look for: the line about no hearts, 5 XP and a set of 10; a "Start a set" button; a card back
    beside "Name the hand" and "Who wins?"; the other three still locked. The fixture `all-done`
    shows all five kinds open.
31. **A set is ten dealt exercises with no hearts at stake.**
    Steps: tap "Start a set"; answer one right and one wrong; tap the cross (on Android also
    press Back over the feedback sheet).
    Look for: a full-screen set with no heart count, hosted by the squid ("Nice read!", "So
    close."); the hearts on Learn do not move; "Leave this set?" and "It will not count for XP
    or your streak." with Stay and Leave; after Leave the XP on Learn is unchanged.
32. **A finished set gives 5 XP for each right answer; practice stays open at 0 hearts.**
    Steps: from `fresh` (after "I am new"), open
    `felto://practice-set?seed=8&deal=showdown&play=rrrrrrrrrw`; then spend all 5 hearts
    (`felto://lesson/hands-1?play=wwwww`, which opens for a new player and costs one heart per
    wrong answer) and open the Practice tab again.
    Look for: the happy squid, "Set finished!", "9 of 10 right. Kicker has another deck ready
    whenever you are.", "+45 XP" and "1-day streak", Learn showing flame 1 and bolt 45; with 0
    hearts the Practice tab still offers "Start a set" and the set opens.
33. **Every dealt kind draws, and the odds tile is right (fix round of item 19, not seen on a
    device).**
    Steps: `felto://practice-set?seed=5&deal=<kind>` for `hand-name`, `showdown`, `preflop`,
    `outs` and `odds`; open `deal=odds` with several seeds, and `felto://practice-set` from `fresh`.
    Look for: five cards with category options; a board and two or three players; a seat and two
    cards with Fold and Raise; hole cards and a board with counts of outs; number tiles with a
    choice of call or fold or a percentage. The last tile reads "1 card" over "The turn only"
    on the flop when the call is not all in, "2 cards" over "Turn and river" when it is, and "1
    card" over "The river" on the turn. A locked set from `fresh` shows the squid, not the fish.

## G. Profile, settings and the reminder

34. **Profile shows the player's numbers and settings in a native form.**
    Steps: Profile tab, fixture `unit1-mid`, light and dark.
    Look for: "Your table" with Day streak 4, Total XP 240, Hearts 2, Gems 20, Lessons finished 3,
    Bosses beaten 0, each beside its icon; then "Streak freeze", "Settings" (Sound effects on,
    Daily reminder on, Reminder time 19:00 or 7:00 PM) and "Start over". From the fix round of
    item 15, not seen on a device: on iOS dark the form background matches the page; the Reset
    row is red; the iOS time picker uses the phone's locale; on Android a muted row looks
    disabled when the reminder is off; toggling the switch on Android logs no "modifiers" error.
35. **A streak freeze can be bought for 10 gems, at most 2 (D19).**
    Steps: Profile, fixture `unit1-mid`; tap "Buy a freeze for 10 gems" twice.
    Look for: "1 freeze held" and 10 gems, then "2 freezes held" and 0 gems; the button greys
    out and the line reads "You hold 2, the most you can. Each one saves your streak on a missed
    day."; on Learn the bar shows the blue freeze flame with 2. With `fresh` the button is grey
    from the start and the line reads "10 more gems to go. Beat a boss and its chest holds 20."
36. **Sound off keeps a lesson silent (D15).**
    Steps: turn "Sound effects" off; play a lesson; restart the app.
    Look for: no sound at any answer or at the finish; the phone still buzzes; the switch is
    still off after the restart.
37. **The reminder asks for permission only when it should (D11).**
    Steps: on a fresh install, open the app (no prompt); then either finish a lesson, or turn
    "Daily reminder" off and on in Profile.
    Look for: no prompt at launch; the phone's notification prompt after the finish or the
    switch; after Allow the line under the switch reads "Flop sends one nudge at {time} on a day
    you have not played yet."; after the phone's refuse button (`Don't Allow`) it says notifications are off in the phone's
    Settings.
38. **The time can be changed.**
    Steps: tap the reminder time (iOS: the time button opens a wheel; Android: the row opens the
    clock dialog, then OK).
    Look for: the row and the line under it show the new time, in the phone's 12 or 24 hour
    form. The phone's own 12 or 24 hour switch cannot be read by the app, so check that a phone
    set to 24 hours and a phone set to 12 hours both show a form that agrees on the row, the
    picker and the line (ledger step 24, open).
39. **A week of reminders is scheduled, and none on a day already played (BD-18).**
    Steps: open `felto://dev/reminders` before and after finishing a lesson.
    Look for: up to 7 entries `felto.reminder.<date>` at the chosen time; after the finish
    today's entry is gone and the others name the new streak.
40. **A notification actually arrives.**
    Steps: Profile, Allow, set the reminder time two minutes ahead on a day not yet played, lock
    the phone, wait.
    Look for: a notification titled "Flop saved you a seat" with "Your {n}-day streak is waiting.
    One quick lesson keeps it going." (or "One quick lesson starts a new streak."); tapping it
    opens the app. No agent has seen one arrive (ledger step 24). Test on the iPhone or the
    Android phone, not only a simulator.
41. **Reset starts over and keeps the settings.**
    Steps: Profile, "Reset progress", then "Reset" in the alert ("Keep my progress" cancels).
    Look for: every stat reads 0 except Hearts 5; Sound, the reminder and its time are as they
    were; after a restart the app opens onboarding or the path as the reset left it.

## H. Errors on screen

42. **The error banner (a save that could not be read).**
    Steps: in a development build, store a damaged value under the key `felto.player` (for
    example from a debugger, or by writing it with a one-off dev script), then open the app.
    Look for: a fresh path with the banner "We could not read your saved progress, so you are
    starting fresh. Your old save is kept safe ..." on Learn, Practice and Profile; the old
    value sits under a key `felto.player.backup.<epoch ms>`. Nobody has seen this on a screen
    (ledger steps 19 and 24).
43. **The error boundary (a screen that throws).**
    Steps: in a development build, make one screen throw while drawing (for example add
    `throw new Error("test")` at the top of `LearnScreen`, run, then remove it).
    Look for: the sad fish, the line "Flop dropped the deck drawing this screen." and a "Deal
    again" button that tries again. This is the new warm wording of board item 16; the old line
    was "Something went wrong drawing this screen." Never ship the throw.

## I. Other devices

44. **iPad, portrait and landscape.**
    Steps: on an iPad simulator or iPad, open Learn (`unit1-mid`), a lesson, the boss finish,
    the out-of-lives sheet, Practice, Profile and onboarding, in portrait and in landscape, light
    and dark. `simctl` cannot rotate a simulator, so use the Simulator menu or a real iPad.
    Look for: the column of content stays a readable width and centred; cards and nodes are not
    stretched; the sheets and the native tabs fit; nothing is cut at the edges. The iPad Pro
    13-inch portrait was seen for Learn only; landscape and every other screen are unseen
    (ledger steps 13, 19, 21, 22, 25).
45. **An Android tablet in landscape.**
    Steps: on an Android tablet, or the emulator with `adb shell wm size 2560x1600` and
    `adb shell wm density 320` (reset with `wm size reset` and `wm density reset`), open the same
    screens in light and dark. After `wm size`, `adb screencap` is stale: use
    `adb emu screenrecord screenshot`.
    Look for: as in entry 44. Learn was seen in landscape in light only; dark and the other
    screens are unseen.
46. **The Android small phone, `Medium_Phone_API_36`.**
    Steps: boot that AVD, build, then walk entries 9, 15 to 20, 22 and 34.
    Look for: nothing overlaps on the small screen; above all the feedback sheet does not cover
    the lower choices of a lesson (ledger step 21, open) and the stat bar fits.
47. **A clean Android `fresh` shot.**
    Steps: on the `Pixel_9`, hide the Expo dev-menu floating button (shake, then "Hide"), load
    `fresh`, tap through onboarding, and look at the path.
    Look for: the whole stat bar, with the gem count. The dev-menu button hid the gem count in
    the earlier shot, and no clean Android `fresh` shot exists (ledger step 19). Also check the
    Android shots go past lesson 4 of `unit1-mid`: scroll to the boss and the chest.

## J. Open findings from the ledger

No fix is built for these. Each entry is a look at the current behaviour, so the finding is
seen once on a device.

48. **A Practice set with nothing right gives "+0 XP" and a streak tile (ledger step 23).**
    Steps: from `all-done`, open `felto://practice-set?seed=8&deal=showdown&play=wwwwwwwwww`.
    Look for: the finish screen with "+0 XP" and a streak tile, though no answer was right. The
    code does this by design (`finishSession`); Zach decides whether it should.
49. **The close cross reads "Leave the lesson" during the placement check (ledger step 25).**
    Steps: from `fresh`, tap "I know the basics", then touch the cross with VoiceOver or
    TalkBack on.
    Look for: the spoken label "Leave the lesson" (`lesson-header.tsx:21`), where the check
    would say "Leave the check". The visible prompt after the tap does say "Leave the check?".
50. **A dev-only floating sheet after a fixture link over a placement result (ledger step 25).**
    Steps: open `felto://onboarding/placement?seed=7&play=rrrrwrrrrw`, then on the result screen
    send `felto://dev/fixture/unit1-mid`.
    Look for: a floating sheet left over the result. It exists in a development build only.

## Decisions that are Zach's, not device checks

These came out of the audits and are open. None blocks the app; each changes a rule of the game
(`D8`) or the copy.

- A finished lesson can be replayed for XP and a streak day again (`game/session.ts:52-63`).
- The review is free, open at 0 hearts and pays 10 XP per right answer on every replay, so it is
  an XP farm.
- A failed boss gives XP and a streak day, by the text of `D8`.
- Pressing Back on the boss finish screen skips "Open the chest" (the chest stays tappable).
- The result screen's cross or Back, after a placement check, returns to the level screen,
  where "I am new" then lands a placed player past units 1 and 2.
- The dev routes still exist in a release build (they only show a page, and a fixture is
  refused outside a development build).
- Rive import is unchecked: the card ranks are live `<text>` and must be turned into outlines
  or set in the font first (`CLAUDE.md`, Never do this).
- Zach reads the Practice dealer template strings (ledger step 20) and the TypeScript rule list
  (ledger step 12). Neither has been read by him.
- The amendment that writes his answers to D15 to D21 into `DESIGN.md` is done (2026-10-05).

Open items in the code only, with no screen to check:

- The dials `minIosVersion`, `minAndroidApi`, `soundEffects` and `soundMaxSeconds` in
  `app/src/config/dials.ts` are read nowhere in `app/src`.
- `game/placement.ts:13` accepts a right count that is not a whole number (the UI cannot make
  one).
- `react-native-svg-transformer` is in `app/package.json` and used by nothing.
- `app.json` has no app icon and no splash, so the home screen shows the default Expo icon.
- There is no open-chest art: the gem replaces the chest.
- No message says that a streak freeze was spent.
