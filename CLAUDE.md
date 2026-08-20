# Xemantics — project guide for Claude Code

Figma plugin for KoinX (design system: XUI). Converts raw/primitive Figma
colours into semantic design tokens. Repo:
https://github.com/Chebrolu-Tejopriya/xemantics.git

The user works on this same repo from two machines. Claude Code session
history doesn't sync between them — this file is what keeps a fresh session
on either one up to speed, since it travels with the code via git.

## Standing instructions — always follow, no need to ask

- **Commit AND push every change immediately** after making it — `git commit`
  then `git push origin master` in the same turn. Don't wait to be asked.
- **After editing `rules.js` or `main.js`, always rebuild `code.js`**:
  `cat rules.js main.js > code.js`. That's the file Figma actually loads
  (`manifest.json`'s `main` field) — never hand-edit `code.js` directly, it
  gets silently overwritten on the next rebuild.
- When a new/uncatalogued semantic token turns up (flat grey swatch, or
  "Needs mapping" with no suggestion), proactively find its real backing
  primitive and add it to `rules.js`'s `SEMANTICS`/`RULES` tables — don't
  leave it to the live-fallback mechanism alone.
- Every fix needs a standalone smoke test before it's done: mock
  `global.figma`, load `code.js` via `new Function()`, assert the exact
  expected outcome plus a control case that proves the fix doesn't overreach.
  These scratchpad tests are the project's actual regression suite — there's
  no other test runner.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Plugin manifest — name "Xemantics", needs `teamlibrary` permission for library variable access |
| `rules.js` | **Source — all data.** `SEMANTICS`, `RULES`, `HEX_LIGHT`/`HEX_DARK`, structural-rule constants |
| `main.js` | **Source — all logic.** Scan → resolve → apply pipeline, UI message handling |
| `code.js` | **Generated.** `cat rules.js main.js > code.js`. What Figma actually loads. |
| `ui.html` | Plugin panel UI (redesigned 2026-08 for a minimal look) |
| `README.md` | User-facing docs — may lag behind the details below, isn't updated on every fix |

## Architecture: how a colour resolves

1. **Structural overrides run first**, before any primitive lookup — these
   can override even an already-semantic-bound layer: table header/row (by
   component name), strong-background text/icon forcing (see below),
   opacity-tint redirect, remove-fill for one specific broken wrapper
   pattern, `NAME_ALIAS` forced mappings.
2. Then primitive resolution: exact name match → tail/`Light`-prefix
   stripping → loose `PRIM_CANON` match (cross-validated against the WHOLE
   palette via `nearestPrimitive()`, not just the guess in isolation) →
   exact raw-hex match (`HEX_INDEX` — tried even for a NAMED-but-unrecognised
   variable, not only genuinely unbound colours) → nearest-hex distance
   (Surface context only, auto-applied) → `RULES` lookup → **same-group
   only** fallback via `PRIM_ALIAS`/`GROUP_INDEX`.
3. **Cross-group fallback is deliberately removed.** A Surface context must
   never resolve to a Content/Border/Label token just because that group
   happens to alias the same primitive — landing in "Needs mapping" is
   correct; guessing across groups isn't. This was a real recurring bug
   (Gray/05-07 icons, then others), fixed at the root rather than patched
   per-primitive.

## Strong-background detection (forces text/icons to a light colour)

`onStrongBackground()` walks UP the ancestor tree to the nearest ancestor
with an ACTUALLY VISIBLE fill — skipping fill-less wrapper frames, and
skipping fills that exist but aren't visible. "Visible" checks BOTH the
paint's own opacity and the node's own layer opacity (Figma's "Appearance >
Opacity" slider is a separate property from a fill's opacity — both have
independently caused a real bug here). A background counts as "strong" via
either:
- One of 8 specific bright brand/status colours (`STRONG_BG_PRIMITIVES`/
  `STRONG_BG_SEMANTICS` in `rules.js`), or
- General perceptual brightness < `STRONG_BG_DARK_THRESHOLD` (50) — chosen so
  it can't overlap with the list above (the dimmest listed colour,
  Green/09(Base), scores ~129).

Max ancestor search depth is `STRONG_BG_MAX_DEPTH` (10) — confirmed live,
one real case needed 5 levels through plain wrapper frames. A fill's
opacity must exceed `MIN_MEANINGFUL_FILL_OPACITY` (0.05) to count.

## The "suggest nearest token" feature

For an unmapped/unrecognised colour, `nearestSemanticInGroup()` suggests the
closest token by hex distance, strictly within the SAME group the context
already implies (Surface stays Surface, Content stays Content, Border stays
Border — never cross-group). **Suggestion only — never auto-applied**, the
user still clicks Map. Cutoff is `NEAREST_MATCH_MAX_DISTANCE` (20). Two
safety rules learned the hard way:
- "Exception" tokens (`content-on-solid`, `content-absolute-white/black`,
  `surface-absolute`) are excluded from the candidate pool — they're for one
  specific case (strong-background contrast), not a generic nearest-colour
  guess.
- Only the LIGHT-mode hex is compared, never both light and dark — some
  tokens invert drastically between modes (`content-on-solid`'s primitive is
  white in light mode, near-black in dark mode), and comparing both caused
  false matches.

## Hidden layers, mixed fills, Diagnostics

- Layers hidden in Figma (or inside a hidden ancestor) are tracked
  separately from visible ones in every report category, but still
  auto-apply normally when a clean match exists — only genuinely
  needs-a-human cases get redirected to the "Hidden" section.
- Mixed-fill text (per-character colour) resolves each segment
  independently — one unresolvable segment no longer blocks its siblings.
- The Diagnostics panel ("Why wasn't something converted?") explains
  already-semantic skips, unresolved variables, and the strong-background
  trace in plain English, with a filter box and a cross-reference link into
  "To map"/"Hidden" for any traced layer that's also genuinely unmapped.

## Collaboration notes

- **Verify against real data before fixing.** This project has been bitten
  repeatedly by fixing based on a screenshot guess that turned out wrong.
  Use the Figma MCP tools (`get_variable_defs`, `get_metadata`,
  `get_screenshot`) to check real primitive names/hex values before
  assuming a root cause.
- **Keep fixes narrow.** No unrequested refactors, no scope creep — a
  reported bug gets a targeted fix, not a surrounding cleanup. (There was an
  explicit "revert everything, you overreached" incident earlier in this
  project — take it seriously.)
- **Confirm before broad behavioural changes** (widening a threshold,
  generalising a check beyond its original case) — but act directly on
  clear, narrowly-scoped bugs without asking first.
