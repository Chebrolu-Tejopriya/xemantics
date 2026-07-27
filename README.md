# Apply XUI Semantics

Figma plugin for KoinX. Select frames, click **Apply** — primitive colours
become semantic tokens. No training, no preview, no setup.

---

## Install

Figma **desktop app** → **Plugins → Development → Import plugin from manifest…**
→ select `manifest.json`.

Only three files need to be in the folder: `manifest.json`, `code.js`, `ui.html`.
`rules.js` and `main.js` are the sources that build `code.js`.

---

## Use

1. Select one or more frames
2. Click **Apply to selection**
3. Anything it can't resolve appears under **Needs mapping** — click a swatch
   to select those layers on canvas, pick a token, click **Map**

Your mapping choices are saved, so the same case resolves automatically next
time. The plugin gets better as you use it.

---

## How it resolves a colour

For each layer it works out the primitive, then finds the semantic token in
three steps:

**1. Exact rule** — 80+ context rules extracted from the reference screens in
the Train section. Keyed as `property|nodeType|primitive`:

    fills|TEXT|Gray/12            ->  content-primary
    strokes|FRAME|Gray/05         ->  border-secondary
    fills|INSTANCE|Blue/09(Base)  ->  surface-brand-primary

**2. Group fallback** — if that exact combination was never seen, it derives
the right group from context and finds the token in that group aliasing the
same primitive:

| Context | Group |
|---|---|
| `fills` on TEXT | Content |
| `fills` on FRAME / INSTANCE | Surface |
| `strokes` on FRAME / INSTANCE / LINE | Border |
| `fills` on VECTOR / ELLIPSE | Content |

This is what lets it handle primitives that never appeared in the reference
screens — it knows the whole semantic system, not just what it observed.

**3. Any group** — last resort, any semantic token aliasing that primitive.

If all three fail, the layer goes into **Needs mapping** rather than being
guessed at.

---

## Input it understands

- Layers bound to a **local** primitive variable
- Layers bound to a **library** primitive variable (resolved by id, and
  library prefixes like `Light/Gray/12` are stripped)
- Layers using a **raw hex** that matches a primitive in Light or Dark

Layers already on semantic tokens are skipped and counted. Colours that
aren't KoinX primitives — crypto logos, icon artwork — are left alone.

---

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Plugin manifest |
| `code.js` | The plugin — generated, do not edit directly |
| `ui.html` | Panel UI |
| `rules.js` | **Source.** 60 semantic definitions, 80+ rules, hex maps |
| `main.js` | **Source.** Apply logic |

After editing `rules.js` or `main.js`, rebuild:

    cat rules.js main.js > code.js

---

## When to regenerate rules.js

`rules.js` is a snapshot taken 2026-07-24 from the XUI file
(`CZHLKqp4fOchbR6FkTcPC8`). Re-extract it if you add semantic tokens or
repoint existing ones — otherwise the plugin keeps binding to the old
mapping.

The three things it holds:

- `SEMANTICS` — every semantic token and the primitive it aliases
- `RULES` — context rules learned from the reference screens
- `HEX_LIGHT` / `HEX_DARK` — primitive values, for matching raw-hex layers

---

## Known limits

- **First solid paint only.** Gradients and multi-fill layers are skipped and
  reported under Needs mapping.
- **Three vector signatures are resolved by majority**, because a vector can
  be an icon glyph or a decorative shape and node type alone can't tell them
  apart:

  | Signature | Resolved to | Split in reference screens |
  |---|---|---|
  | `fills\|VECTOR\|Blue/09(Base)` | `surface-brand-primary` | 96 vs 54 |
  | `strokes\|VECTOR\|Absolute/White` | `surface-absolute` | 19 vs 4 |
  | `strokes\|VECTOR\|Gray/01-Surface` | `border-pure` | 14 vs 6 |

  Both options are the same colour, so nothing looks wrong — the difference
  only shows in Dev Mode. Spot-check an icon-heavy screen the first time.

## Primitives with no token of their own

`Gray/06` and `Gray/11` sit between defined steps — the border scale runs
04/05/07 and the content scale runs 08/09/10/12 — so a direct lookup on them
always fails. `PRIM_ALIAS` in `rules.js` substitutes the nearest defined step:

    Gray/06  ->  Gray/07   so a stroke resolves to border-primary
    Gray/11  ->  Gray/12   so text resolves to content-primary

This works in every context rather than needing a rule per node type. Add to
`PRIM_ALIAS` if other in-between primitives turn up.

## Absolute/White resolves by context

`Absolute/White` is aliased by two tokens, and which one applies depends on
where the colour sits:

| Context | Resolves to |
|---|---|
| fill on FRAME / INSTANCE / RECTANGLE | `surface-absolute` |
| fill on TEXT / VECTOR | `content-absolute-white` |
| stroke | `surface-absolute` |

Library prefixes are stripped first, so `Light/Absolute/White` matches too.
