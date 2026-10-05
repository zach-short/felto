"""Build the six sound effects for Felto.

Style (the sound twin of the extruded-flat art): short, soft, bell-like tones
made of a few sine partials, each with a 5 ms attack and an exponential decay
that reaches zero at the note's end. No noise, no recorded audio, and no
value that changes between runs. Every file is 16-bit mono WAV at 44,100 Hz, under one second, starts
and ends on a zero sample, and peaks below full scale.

The effects, in musical terms (C4 is middle C):

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

# Pitches in Hz, equal temperament at A4 = 440, so chords built from them
# sound in tune.
B3, C4, EB4, E4, G4 = 246.94, 261.63, 311.13, 329.63, 392.00
C5, D5, E5, G5, A5 = 523.25, 587.33, 659.26, 783.99, 880.00
C6, D6, E6, G6, A6, C7 = 1046.50, 1174.66, 1318.51, 1567.98, 1760.00, 2093.00

# Partials as (multiple of the fundamental, relative level). BELL is the
# default; SOFT has weak upper partials, for the two "not this time" sounds.
BELL = ((1, 1.0), (2, 0.35), (3, 0.12), (4, 0.05))
SOFT = ((1, 1.0), (2, 0.12), (3, 0.03))


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


SOUNDS = {
    "answer_right": answer_right,
    "answer_wrong": answer_wrong,
    "lesson_finish": lesson_finish,
    "boss_pass": boss_pass,
    "boss_fail": boss_fail,
    "chest_open": chest_open,
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


def main():
    n = 0
    for name, fn in SOUNDS.items():
        n += write(name, fn())
    print("wrote", n, "wavs to", os.path.abspath(OUT))


if __name__ == "__main__":
    main()
