<!-- personal-config v0.7.0 · 2026-10-04 · config 3b46daed · standard v1.2.0 · adapted -->
# felto

> **Before writing or editing any code, read the matching code standard in full:
> `docs/conventions-python.md` for every `.py` file. Not optional, not conditional on task size.
> If you have not read it this session, read it now.**

> **Before scoping, planning or building a feature, read `docs/AGENT-PRACTICES.md`.** It is the
> process standard. Do not ask how the flow works; it is written down.

## The rules that get broken

- **Never hand-edit an SVG under `assets/icons/` or `assets/mascots/`.** The generators
  overwrite every one of them on each run (`tools/build_icons.py:19`, `tools/build_mascots.py:17`).
  Change the generator, then run it.
- **Never regenerate, rename or move a file in `assets/higgsfield/`.** They came from a paid,
  non-deterministic external service, and `assets/gallery.html` links all 32 by filename.
- **Never trust a preview page as a picture of the current SVGs.** `assets/icons/preview.html`
  and `assets/mascots/preview.html` hold inline copies, and no script rebuilds them
  (`grep -n preview tools/*.py` finds nothing, 2026-10-04).
- **Never run `git commit`, `git push`, `git add -A` or `git add .`.** Print the two blocks
  that Part 11 of the standard describes.

## Stack

- Python 3, standard library only (`math`, `os`). Verified on Python 3.14.6 at
  `/opt/homebrew/bin/python3`, 2026-10-04.
- `xmllint` (libxml 20913, `/usr/bin/xmllint`) to check SVG well-formedness.
- No package manifest, no lockfile, no CI, no tests, no linter (`ls -a`, 2026-10-04).
- Rive is the intended animation tool for these assets (`tools/build_icons.py:12`).

## Architecture

- There is no app code yet. The repo is an asset pipeline: two generators write SVGs, and
  three HTML pages display them.
- The assets point at a game about poker: playing cards, chips, a lesson path with locked,
  current and boss nodes, a streak flame, XP, lives, gems and a chest
  (`tools/build_icons.py:352-358`), and three mascots, fish, squid and shark, each in six poses
  (`tools/build_mascots.py:336-337`).
- The generated SVGs are deterministic. A rebuild in a scratch copy on 2026-10-04 was
  byte-identical to the files on disk (`diff -rq`).
- The style comes from the approved Higgsfield reference: no outlines, solid fills, a darker
  extrusion down and right, a hard pale shadow, one gloss highlight (`tools/build_icons.py:4-6`).

## Directory map

| Path | Belongs here | Does not |
|---|---|---|
| `tools/` | The SVG generators | Generated output |
| `assets/icons/{cards,chips,path,ui}/` | Output of `build_icons.py` (76 SVGs) | Hand edits |
| `assets/mascots/{fish,squid,shark}/` | Output of `build_mascots.py` (18 SVGs) | Hand edits |
| `assets/higgsfield/` | Reference art from Higgsfield (19 PNG, 13 SVG), kept as received | Renamed or regenerated files |
| `assets/gallery.html`, `assets/*/preview.html` | Pages to view the art in a browser | Anything a script reads |
| `docs/` | The process standard and the Python code standard | Generated assets |

## Commands

The whole-repo gate, also `gateCommand` in `.personal-config.json`. Run 2026-10-04, exit 0:

```bash
python3 tools/build_icons.py && python3 tools/build_mascots.py && xmllint --noout assets/icons/*/*.svg assets/mascots/*/*.svg
```

To view the art, open a page in a browser:

```bash
open assets/gallery.html
```

**What the gates do not prove.**

- A generator that exits 0 and prints its `wrote ...` line proves only that files were written.
  Nothing checks how they look. Each generator prints a count taken from its writes
  (`tools/build_icons.py:374`, `tools/build_mascots.py:345`), so a skipped write shows as a short count.
- `xmllint --noout` proves the SVG is well-formed XML, not that it draws the right shape.
- The gate rewrites the generated SVGs in place. After the first commit, run
  `git diff --stat -- assets/icons assets/mascots` after the gate: any line there is a change
  in the art, and it must be one you meant.
- A visual change is proven only by looking at it. Render the SVG files themselves, not the
  preview pages.

## Never do this

- Never ship card SVGs into Rive with live `<text>`: convert the rank text to outlines first,
  or set the font in Rive (`tools/build_icons.py:11-12`).
- Never call merged work shipped. Nothing ships from this repo: there is no app and no deploy.

## Where work is written down

- `HANDOFF.md`: what is true. Environment, settled decisions, the step log. Read first.
- `PASSOFF.md`: what is next, one standalone prompt per item.
