"""Build the sound effects for Felto.

Style (the sound twin of the extruded-flat art, re-voiced by GF-14): one
family of soft chimes in C major. Every note is one voice, CHIME: four sine
partials at 1, 2.005, 3.02 and 4.1 times the fundamental, at levels 1, 0.3,
0.12 and 0.05, a little sharp of whole multiples, as a small glass bell's
are. Each partial decays exponentially and the upper ones die 1.8, 2.8 and 4
times faster than the fundamental, so a note starts bright and mellows. A
note rises over 8 ms (the low tones over 14 ms) and fades to an exact zero
over its last 60 ms (or half its length, if shorter), so it never starts or
ends on a step. SOFT is the same voice with its upper partials damped, for
the low tones, the shimmers and the airy sparkle.

Every note is in C major, so any two effects can sound together. The
fundamentals run from A3 (220 Hz) to E6 (1,319 Hz), most between C5 and C6
(523 to 1,047 Hz). The three "not this time" sounds use only A, C and E,
the A minor chord inside C major, so they agree with each other and with
the chimes. They peak at 0.3 to 0.34, under every chime of D15 (0.55 to
0.6). No recorded audio, and no value that changes between runs. Every
file is 16-bit mono WAV at 44,100 Hz, starts and ends on a zero sample, and
peaks between 0.3 and 0.6 of full scale.

A shimmer is two SOFT copies of a note 6 Hz apart, one either side of it.
They beat six times a second, and the pitch heard stays on the note.

The six effects of D15, for answers and endings, in musical terms (C4 is
middle C). Each stops by one second:

- answer_right: C5 then E5, a rising major third, 90 ms apart; E5 rings
  out by 0.61 s. The first two notes of lesson_finish (peak 0.55).
- answer_wrong: E4 then C4, a soft falling third in SOFT, 120 ms apart;
  C4 rings out by 0.52 s. A gentle "no", not a buzzer (peak 0.34).
- lesson_finish: C5 E5 G5, 90 ms apart, resolving to C6 at 0.27 s over
  the ringing chord; C6 rings out by 0.94 s (peak 0.58).
- boss_pass: the fuller one. G4 C5 E5 G5, 75 ms apart, then from 0.3 s a
  held C major chord (C4 C5 E5 G5) strummed 25 ms a note, with a shimmer
  on C6, out by 0.96 s (peak 0.6).
- boss_fail: A4 E4 C4 A3, a falling A minor chord in SOFT, 150 ms apart;
  A3 rings out by 0.9 s. Slower and quieter than boss_pass (peak 0.32).
- chest_open: a rising pentatonic run, C5 D5 E5 G5 A5 C6, 50 ms apart,
  then a shimmer on C6 and E6, out by 0.87 s (peak 0.58).

The six of GF-5, for presses, ticks and rewards (docs/incomplete/game-feel/).
Each stops by 0.6 s, and main() refuses to write one that runs longer:

- tap: a soft wooden knock for Check and Continue, 45 ms. A C4 tone in
  SOFT, rising over 2 ms, under a burst of noise tuned around C6 that dies
  in about 6 ms (peak 0.4).
- option_select: one soft G5 chime, out by 0.19 s. Lighter than tap
  (peak 0.3).
- heart_lost: C4 then A3 in SOFT, 120 ms apart, out by 0.42 s. It starts a
  major third under answer_wrong and moves with it, so the two sound as
  one chord. Quieter than answer_wrong (peak 0.3).
- xp_tick: a tiny C6 bell, 65 ms, made to repeat fast during a count-up
  (peak 0.3).
- reward_claim: C5 then G5, a rising fifth, 100 ms apart, then a shimmer
  on C6 from 0.2 s, out by 0.55 s. Two notes and a shimmer, not a run, so
  it does not sound like chest_open (peak 0.55).
- sparkle: four airy SOFT notes falling E6 C6 A5 G5 at uneven steps, each
  softer than the last, out by 0.44 s. Quieter than chest_open (peak 0.32).

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

# Ceilings in seconds. D15 gave every effect one second. GF-5 gave the six it
# added 0.6 s, because a sound that plays on every press or tick tires the ear
# if it rings on. They live here, not in app/src/config/dials.ts, because this
# script cannot read that file (game-feel PLAN.md, BD-G19).
CEILING = 1.0
SHORT_CEILING = 0.6
SHORT = ("tap", "option_select", "heart_lost", "xp_tick", "reward_claim", "sparkle")

# Pitches in Hz, equal temperament at A4 = 440, so chords built from them
# sound in tune. Only notes of C major (GF-14), so any two effects can sound
# together.
A3, C4, E4, G4, A4 = 220.00, 261.63, 329.63, 392.00, 440.00
C5, D5, E5, G5, A5 = 523.25, 587.33, 659.26, 783.99, 880.00
C6, E6 = 1046.50, 1318.51

# Partials as (multiple of the fundamental, level, decay speed). The upper
# multiples sit a little sharp, as a small bell's do, and die faster, so a
# note starts bright and mellows instead of beeping.
CHIME = ((1.0, 1.0, 1.0), (2.005, 0.3, 1.8), (3.02, 0.12, 2.8), (4.1, 0.05, 4.0))
# Built from CHIME, so the low tones and the airy notes stay in the one voice
# when CHIME changes. Each step up loses another 0.6, so a low note never
# buzzes and a high one is nearly a pure tone.
SOFT = tuple((m, lvl * 0.6 ** i, speed) for i, (m, lvl, speed) in enumerate(CHIME))

ATTACK = 0.008
SOFT_ATTACK = 0.014
DECAY = 4.0
FADE = 0.06
SHIMMER_BEAT = 6.0


# ---------------------------------------------------------------- SYNTH
def envelope(t, ring, attack):
    # Both ends are squared quarter sines, so the level leaves zero and comes
    # back to exactly zero with no corner, which the ear hears as a click.
    fade = min(FADE, ring / 2)
    rise = math.sin(0.5 * math.pi * min(1.0, t / attack)) ** 2
    fall = math.sin(0.5 * math.pi * min(1.0, (ring - t) / fade)) ** 2
    return rise * fall


def note(buf, start, freq, ring, amp=1.0, voice=CHIME, attack=ATTACK):
    i0 = round(start * RATE)
    for k in range(round(ring * RATE)):
        t = k / RATE
        s = sum(
            lvl * math.exp(-DECAY * speed * t / ring) * math.sin(2 * math.pi * freq * m * t)
            for m, lvl, speed in voice
        )
        buf[i0 + k] += amp * envelope(t, ring, attack) * s


def shimmer(buf, start, freq, ring, amp):
    # Two copies either side of the note beat against each other, so the
    # level wavers while the pitch heard stays on the note, inside the key.
    for f in (freq - SHIMMER_BEAT / 2, freq + SHIMMER_BEAT / 2):
        note(buf, start, f, ring, amp / 2, voice=SOFT)


def blank(seconds):
    return [0.0] * round(seconds * RATE)


def to_frames(buf, peak):
    # Scaling to a set peak keeps every file below full scale, and rounding
    # to integers here is the one place a float becomes a sample.
    top = max(abs(x) for x in buf)
    return struct.pack(f"<{len(buf)}h", *(round(x / top * peak * FULL) for x in buf))


# -------------------------------------------------------------- EFFECTS
def answer_right():
    buf = blank(0.62)
    note(buf, 0.0, C5, 0.3)
    note(buf, 0.09, E5, 0.52)
    return to_frames(buf, 0.55)


def answer_wrong():
    buf = blank(0.56)
    note(buf, 0.0, E4, 0.3, voice=SOFT, attack=SOFT_ATTACK)
    note(buf, 0.12, C4, 0.4, voice=SOFT, attack=SOFT_ATTACK)
    return to_frames(buf, 0.34)


def lesson_finish():
    buf = blank(0.95)
    for i, f in enumerate([C5, E5, G5]):
        note(buf, i * 0.09, f, 0.6, amp=0.8)
    note(buf, 0.27, C6, 0.67)
    return to_frames(buf, 0.58)


def boss_pass():
    buf = blank(0.97)
    for i, f in enumerate([G4, C5, E5, G5]):
        note(buf, i * 0.075, f, 0.3, amp=0.8)
    # The chord is strummed 25 ms a note, so its notes do not all peak on one
    # sample, and the file carries more sound for the same peak
    for i, f in enumerate([C4, C5, E5, G5]):
        note(buf, 0.3 + i * 0.025, f, 0.58, amp=0.55)
    shimmer(buf, 0.375, C6, 0.58, amp=0.6)
    return to_frames(buf, 0.6)


def boss_fail():
    buf = blank(0.96)
    for i, f in enumerate([A4, E4, C4]):
        note(buf, i * 0.15, f, 0.28, voice=SOFT, attack=SOFT_ATTACK)
    note(buf, 0.45, A3, 0.45, voice=SOFT, attack=SOFT_ATTACK)
    return to_frames(buf, 0.32)


def chest_open():
    buf = blank(0.88)
    for i, f in enumerate([C5, D5, E5, G5, A5, C6]):
        note(buf, i * 0.05, f, 0.42, amp=0.7)
    shimmer(buf, 0.25, C6, 0.62, amp=0.6)
    shimmer(buf, 0.3, E6, 0.55, amp=0.35)
    return to_frames(buf, 0.58)


def tap():
    # The tone is the hollow of the block and the noise is the wood. The noise
    # is a fixed integer sequence (a linear congruential generator), so every
    # run writes the same bytes, and a two-pole resonator tunes it around C6.
    ring, attack, width, die, wood_level = 0.045, 0.002, 500.0, 0.006, 0.6
    buf = blank(0.05)
    note(buf, 0.0, C4, ring, voice=SOFT, attack=attack)
    r = math.exp(-math.pi * width / RATE)
    c1, c2 = 2 * r * math.cos(2 * math.pi * C6 / RATE), r * r
    x, y1, y2, wood = 1, 0.0, 0.0, []
    for _ in range(round(ring * RATE)):
        x = (1103515245 * x + 12345) % 2 ** 31
        y1, y2 = x / 2 ** 30 - 1.0 + c1 * y1 - c2 * y2, y1
        wood.append(y1)
    top = max(abs(v) for v in wood)
    for k, v in enumerate(wood):
        t = k / RATE
        buf[k] += wood_level * v / top * math.exp(-t / die) * envelope(t, ring, attack)
    return to_frames(buf, 0.4)


def option_select():
    buf = blank(0.2)
    note(buf, 0.0, G5, 0.19)
    return to_frames(buf, 0.3)


def heart_lost():
    buf = blank(0.43)
    note(buf, 0.0, C4, 0.25, voice=SOFT, attack=SOFT_ATTACK)
    note(buf, 0.12, A3, 0.3, voice=SOFT, attack=SOFT_ATTACK)
    return to_frames(buf, 0.3)


def xp_tick():
    buf = blank(0.07)
    note(buf, 0.0, C6, 0.065)
    return to_frames(buf, 0.3)


def reward_claim():
    buf = blank(0.56)
    note(buf, 0.0, C5, 0.25)
    note(buf, 0.1, G5, 0.45)
    shimmer(buf, 0.2, C6, 0.35, amp=0.5)
    return to_frames(buf, 0.55)


def sparkle():
    buf = blank(0.45)
    # Uneven steps, so it twinkles instead of running like chest_open
    for start, f, amp in [(0.0, E6, 1.0), (0.05, C6, 0.8), (0.11, A5, 0.65), (0.16, G5, 0.5)]:
        note(buf, start, f, 0.28, amp=amp, voice=SOFT)
    return to_frames(buf, 0.32)


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
