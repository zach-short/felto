"""Build the sound effects for Felto.

Style (the sound twin of the extruded-flat art): short, soft, bell-like tones
made of a few sine partials, each with a 5 ms attack and an exponential decay
that reaches zero at the note's end. No noise, no recorded audio, and no
value that changes between runs. Every file is 16-bit mono WAV at 44,100 Hz, under one second, starts
and ends on a zero sample, and peaks below full scale.

The six effects of D15, for answers and endings, in musical terms (C4 is
middle C):

- answer_right: G5 then C6, a rising fourth, 70 ms apart. The second note
  rings for 0.32 s. Bright and quick, so it can repeat on every answer.
- answer_wrong: one low, soft tone that glides down from E4 to B3 over
  0.34 s, with only weak upper partials. A gentle "no", not a buzzer.
  Quietest of the six (peak 0.45).
- lesson_finish: a C major arpeggio, C5 E5 G5 C6, 80 ms apart; the top C
  rings for 0.4 s.
- boss_pass: a fanfare. G4 C5 E5 in quick steps, then a held C major chord
  (C5 E5 G5 C6) that decays over 0.55 s.
- boss_fail: a falling C minor line, G4 Eb4 C4, slower and softer than the
  fanfare; the low C rings for 0.45 s. Sad, not harsh (peak 0.5).
- chest_open: a sparkle. A fast rising C major pentatonic run from C6 to C7,
  45 ms apart, with a quiet octave shimmer on each note.

The six of GF-5, for presses, ticks and rewards (docs/incomplete/game-feel/).
Each stops by 0.6 s, and main() refuses to write one that runs longer:

- tap: a soft, dry knock for Check and Continue. E4 gliding down to C4 over
  40 ms. Quiet (peak 0.4), so it does not tire on every press.
- option_select: one light pluck on E6, 70 ms, with only weak upper
  partials. Lighter than tap (peak 0.3).
- heart_lost: a short, low, hollow pop that dips from C4 to G3 over 0.23 s,
  made of odd partials only. It starts a major third under answer_wrong and
  is quieter (peak 0.38), so the two can sound together.
- xp_tick: one tiny bright tick on G6, 30 ms, made to repeat fast during a
  count-up (peak 0.3).
- reward_claim: C6 then G6, a rising fifth, 90 ms apart, then a short
  shimmer on C7 that rings out by 0.48 s. Two notes and a shimmer, not a
  run, so it does not sound like chest_open (peak 0.55).
- sparkle: four quick, airy pure tones falling E7 C7 G6 E6 at uneven steps,
  each softer than the last, over 0.37 s. Quieter than chest_open (peak 0.4).

An agent cannot hear these. The gate proves only length, format and level;
Zach approves each sound by ear (afplay assets/sounds/<name>.wav).

Outputs to assets/sounds/.
Run: python3 tools/build_sounds.py
"""
import math
import os
import struct
import wave

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sounds")
RATE = 44100
FULL = 32767
ATTACK = 0.005

# Ceilings in seconds. D15 gave every effect one second. GF-5 gave the six it
# added 0.6 s, because a sound that plays on every press or tick tires the ear
# if it rings on. They live here, not in app/src/config/dials.ts, because this
# script cannot read that file (game-feel PLAN.md, BD-G19).
CEILING = 1.0
SHORT_CEILING = 0.6
SHORT = ("tap", "option_select", "heart_lost", "xp_tick", "reward_claim", "sparkle")

# Pitches in Hz, equal temperament at A4 = 440, so chords built from them
# sound in tune.
G3, B3, C4, EB4, E4, G4 = 196.00, 246.94, 261.63, 311.13, 329.63, 392.00
C5, D5, E5, G5, A5 = 523.25, 587.33, 659.26, 783.99, 880.00
C6, D6, E6, G6, A6, C7, E7 = 1046.50, 1174.66, 1318.51, 1567.98, 1760.00, 2093.00, 2637.02

# Partials as (multiple of the fundamental, relative level). BELL is the
# default; SOFT has weak upper partials, for the two "not this time" sounds.
# HOLLOW has odd partials only, the hollow tone of a stopped pipe, for the
# lost heart; on a phone speaker its third and fifth carry a low note that
# the speaker cannot play. PURE is one sine, for the airy sparkle and shimmer.
BELL = ((1, 1.0), (2, 0.35), (3, 0.12), (4, 0.05))
SOFT = ((1, 1.0), (2, 0.12), (3, 0.03))
HOLLOW = ((1, 1.0), (3, 0.3), (5, 0.1))
PURE = ((1, 1.0),)


# ---------------------------------------------------------------- SYNTH
def envelope(t, dur):
    # The tail factor forces the note to exactly zero at dur, so a note
    # never ends on a step, which the ear hears as a click.
    attack = min(1.0, t / ATTACK)
    decay = math.exp(-4.0 * t / dur)
    tail = min(1.0, (dur - t) / 0.02)
    return attack * decay * tail


def note(buf, start, dur, freq, amp=1.0, partials=BELL, glide_to=None):
    i0 = round(start * RATE)
    n = round(dur * RATE)
    phase = 0.0
    for k in range(n):
        t = k / RATE
        f = freq if glide_to is None else freq + (glide_to - freq) * t / dur
        s = sum(lvl * math.sin(mult * phase) for mult, lvl in partials)
        buf[i0 + k] += amp * envelope(t, dur) * s
        phase += 2 * math.pi * f / RATE


def blank(seconds):
    return [0.0] * round(seconds * RATE)


def to_frames(buf, peak):
    # Scaling to a set peak keeps every file below full scale, and rounding
    # to integers here is the one place a float becomes a sample.
    top = max(abs(x) for x in buf)
    return struct.pack(f"<{len(buf)}h", *(round(x / top * peak * FULL) for x in buf))


# -------------------------------------------------------------- EFFECTS
def answer_right():
    buf = blank(0.45)
    note(buf, 0.0, 0.12, G5)
    note(buf, 0.07, 0.32, C6)
    return to_frames(buf, 0.6)


def answer_wrong():
    buf = blank(0.36)
    note(buf, 0.0, 0.34, E4, partials=SOFT, glide_to=B3)
    return to_frames(buf, 0.45)


def lesson_finish():
    buf = blank(0.7)
    for i, f in enumerate([C5, E5, G5]):
        note(buf, i * 0.08, 0.2, f)
    note(buf, 0.24, 0.4, C6)
    return to_frames(buf, 0.6)


def boss_pass():
    buf = blank(0.9)
    for i, f in enumerate([G4, C5, E5]):
        note(buf, i * 0.09, 0.16, f)
    for f in [C5, E5, G5, C6]:
        note(buf, 0.3, 0.55, f, amp=0.6)
    return to_frames(buf, 0.65)


def boss_fail():
    buf = blank(0.9)
    note(buf, 0.0, 0.25, G4, partials=SOFT)
    note(buf, 0.2, 0.25, EB4, partials=SOFT)
    note(buf, 0.4, 0.45, C4, partials=SOFT)
    return to_frames(buf, 0.5)


def chest_open():
    buf = blank(0.65)
    for i, f in enumerate([C6, D6, E6, G6, A6, C7]):
        note(buf, i * 0.045, 0.3, f, amp=0.7)
        note(buf, i * 0.045, 0.3, 2 * f, amp=0.12, partials=((1, 1.0),))
    return to_frames(buf, 0.55)


def tap():
    buf = blank(0.05)
    note(buf, 0.0, 0.04, E4, glide_to=C4)
    return to_frames(buf, 0.4)


def option_select():
    buf = blank(0.08)
    note(buf, 0.0, 0.07, E6, partials=SOFT)
    return to_frames(buf, 0.3)


def heart_lost():
    buf = blank(0.25)
    note(buf, 0.0, 0.23, C4, partials=HOLLOW, glide_to=G3)
    return to_frames(buf, 0.38)


def xp_tick():
    buf = blank(0.035)
    note(buf, 0.0, 0.03, G6)
    return to_frames(buf, 0.3)


def reward_claim():
    buf = blank(0.5)
    note(buf, 0.0, 0.14, C6)
    note(buf, 0.09, 0.3, G6)
    # Two pure tones 7 Hz apart beat seven times a second, and that wobble
    # is the shimmer
    for f in [C7, C7 + 7]:
        note(buf, 0.18, 0.3, f, amp=0.22, partials=PURE)
    return to_frames(buf, 0.55)


def sparkle():
    buf = blank(0.4)
    # Uneven steps, so it twinkles instead of running like chest_open
    for start, f, amp in [(0.0, E7, 1.0), (0.06, C7, 0.8), (0.11, G6, 0.65), (0.19, E6, 0.5)]:
        note(buf, start, 0.18, f, amp=amp, partials=PURE)
    return to_frames(buf, 0.4)


SOUNDS = {
    "answer_right": answer_right,
    "answer_wrong": answer_wrong,
    "lesson_finish": lesson_finish,
    "boss_pass": boss_pass,
    "boss_fail": boss_fail,
    "chest_open": chest_open,
    "tap": tap,
    "option_select": option_select,
    "heart_lost": heart_lost,
    "xp_tick": xp_tick,
    "reward_claim": reward_claim,
    "sparkle": sparkle,
}


# --------------------------------------------------------------- OUTPUT
def write(name, frames):
    os.makedirs(OUT, exist_ok=True)
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(frames)
    return 1


def checked(name, frames):
    # The gate runs this file, so an effect over its ceiling stops the gate
    # here instead of reaching the app. Two bytes make one 16-bit sample.
    ceiling = SHORT_CEILING if name in SHORT else CEILING
    seconds = len(frames) / 2 / RATE
    if seconds > ceiling:
        raise SystemExit(f"{name} runs {seconds:.3f} s, over its ceiling of {ceiling} s")
    return frames


def main():
    n = 0
    for name, fn in SOUNDS.items():
        n += write(name, checked(name, fn()))
    print("wrote", n, "wavs to", os.path.abspath(OUT))


if __name__ == "__main__":
    main()
