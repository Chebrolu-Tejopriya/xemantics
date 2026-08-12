/**
 * XUI Semantics — baked-in rule set
 * ---------------------------------
 * Extracted from the KoinX XUI file on 2026-07-24:
 *   - 60 semantic token definitions (semantic -> primitive it aliases)
 *   - 82 context rules learned from the 9 reference screens in the Train section
 *   - primitive hex values for Light and Dark, so raw-hex layers can be matched
 *
 * Regenerate this file if the token system changes materially.
 */

/* semantic token name -> the primitive it aliases */
const SEMANTICS = {
  "Surface/surface-primary": "Gray/02-Background",
  "Surface/surface-raised": "Gray/01-Surface",
  "Surface/surface-secondary": "Gray/03",
  "Surface/surface-tertiary": "Gray/04",
  "Surface/surface-absolute": "Absolute/White",
  "Surface/surface-brand-primary": "Blue/09(Base)",
  "Surface/surface-brand-secondary": "Blue/03",
  "Surface/surface-brand-subtle": "Blue/08",
  "Surface/surface-brand-solid": "Blue/10",
  "Surface/surface-error-primary": "Red/09(Base)",
  "Surface/surface-error-secondary": "Red/04",
  "Surface/surface-error-tertiary": "Red/02",
  "Surface/surface-error-subtle": "Red/08",
  "Surface/surface-error-solid": "Red/10",
  "Surface/surface-warning-primary": "Orange/09(Base)",
  "Surface/surface-warning-secondary": "Orange/04",
  "Surface/surface-warning-tertiary": "Orange/02",
  "Surface/surface-warning-subtle": "Orange/08",
  "Surface/surface-warning-solid": "Orange/10",
  "Surface/surface-success-primary": "Green/09(Base)",
  "Surface/surface-success-secondary": "Green/04",
  "Surface/surface-success-tertiary": "Green/02",
  "Surface/surface-success-subtle": "Green/08",
  "Surface/surface-success-solid": "Green/10",

  "Content/content-primary": "Gray/12",
  "Content/content-secondary": "Gray/10",
  "Content/content-tertiary": "Gray/09",
  "Content/content-quaternary": "Gray/08",
  "Content/content-on-solid": "Gray/01-Surface",
  "Content/content-absolute-white": "Absolute/White",
  "Content/content-absolute-black": "Absolute/Black",
  "Content/content-brand-primary": "Blue/09(Base)",
  "Content/content-brand-secondary": "Blue/08",
  "Content/content-error-primary": "Red/09(Base)",
  "Content/content-warning-primary": "Orange/09(Base)",
  "Content/content-success-primary": "Green/09(Base)",
  "Content/content-success-primary-solid": "Green/10",

  "Border/border-primary": "Gray/07",
  "Border/border-secondary": "Gray/05",
  "Border/border-tertiary": "Gray/04",
  "Border/border-pure": "Gray/01-Surface",
  "Border/border-brand": "Blue/09(Base)",
  "Border/border-error": "Red/09(Base)",
  "Border/border-warning": "Orange/09(Base)",
  "Border/border-success": "Green/09(Base)",   // same "(Base) step" pattern as brand/error/warning above

  "Label/label-positive-bg": "Label/positive-bg",
  "Label/label-positive-content": "Label/positive-content",
  "Label/label-negative-bg": "Label/negative-bg",
  "Label/label-negative-content": "Label/negative-content",
  "Label/label-warning-bg": "Label/warning-bg",
  "Label/label-warning-content": "Label/warning-content",
  "Label/label-info-bg": "Label/info-bg",
  "Label/label-info-content": "Label/info-content",
  "Label/label-accent-bg": "Label/accent-bg",
  "Label/label-accent-content": "Label/accent-content",
  "Label/label-accent-2-bg": "Label/accent-2-bg",
  "Label/label-accent-2-content": "Label/accent-2-content",
  "Label/label-accent-3-bg": "Label/accent-3-bg",
  "Label/label-accent-3-content": "Label/accent-3-content",
  "Label/label-neutral-bg": "Label/neutral-bg",
  "Label/label-neutral-content": "Label/neutral-content",
};

/**
 * Context rules: "property|nodeType|primitive" -> semantic token.
 * Learned from the reference screens; these take priority over the fallback.
 */
const RULES = {
  // ---- text
  "fills|TEXT|Gray/12": "Content/content-primary",
  "fills|TEXT|Gray/10": "Content/content-secondary",
  "fills|TEXT|Gray/09": "Content/content-tertiary",
  // Gray/05, Gray/06, Gray/07 have no Content-group token of their own —
  // without an explicit rule the generic group fallback (Surface, Content,
  // Border, Label, in that order) finds nothing in Content and falls
  // through to Border, which DOES alias these steps. Exactly the same bug
  // already fixed for fills|VECTOR|* (icon glyphs) — confirmed here too on
  // a chart axis label ("$400K") wrongly bound to Border/border-secondary.
  // Content/content-quaternary per direct confirmation, same target as the
  // VECTOR fix. Gray/05 specifically was later corrected to
  // content-tertiary per direct request — Gray/06 and Gray/07 stay
  // quaternary.
  "fills|TEXT|Gray/07": "Content/content-quaternary",
  "fills|TEXT|Gray/06": "Content/content-quaternary",
  "fills|TEXT|Gray/05": "Content/content-tertiary",
  "fills|TEXT|Gray/01-Surface": "Content/content-on-solid",
  "fills|TEXT|Absolute/White": "Content/content-absolute-white",
  "fills|TEXT|Absolute/Black": "Content/content-absolute-black",
  "fills|TEXT|Blue/09(Base)": "Content/content-brand-primary",
  "fills|TEXT|Blue/10": "Content/content-brand-primary",   // Blue/10 has no Content token of its own; without this the group fallback grabs Surface/surface-brand-solid instead
  "fills|TEXT|Blue/11": "Content/content-brand-primary",   // same gap one step darker — confirmed live via "Primary/DarkBlue" (#0141CF, exact Blue/11 match)
  "fills|TEXT|Red/09(Base)": "Content/content-error-primary",
  "fills|TEXT|Orange/09(Base)": "Content/content-warning-primary",
  "fills|TEXT|Green/09(Base)": "Content/content-success-primary",
  "fills|TEXT|Green/10": "Content/content-success-primary-solid",
  "fills|TEXT|Label/positive-content": "Label/label-positive-content",
  "fills|TEXT|Label/negative-content": "Label/label-negative-content",
  "fills|TEXT|Label/accent-3-content": "Label/label-accent-3-content",

  // ---- containers
  "fills|FRAME|Gray/01-Surface": "Surface/surface-raised",
  "fills|FRAME|Gray/02-Background": "Surface/surface-primary",
  "fills|FRAME|Gray/03": "Surface/surface-secondary",
  "fills|FRAME|Gray/04": "Surface/surface-tertiary",
  "fills|FRAME|Gray/05": "Border/border-secondary",   // 1px divider frames
  "fills|FRAME|Blue/03": "Surface/surface-brand-secondary",
  "fills|FRAME|Blue/09(Base)": "Surface/surface-brand-primary",
  "fills|FRAME|Red/04": "Surface/surface-error-secondary",
  "fills|FRAME|Red/09(Base)": "Surface/surface-error-primary",
  "fills|FRAME|Orange/04": "Surface/surface-warning-secondary",
  "fills|FRAME|Orange/09(Base)": "Surface/surface-warning-primary",
  "fills|FRAME|Green/04": "Surface/surface-success-secondary",

  "fills|INSTANCE|Gray/01-Surface": "Surface/surface-raised",
  "fills|INSTANCE|Gray/02-Background": "Surface/surface-primary",
  "fills|INSTANCE|Gray/03": "Surface/surface-secondary",
  "fills|INSTANCE|Blue/03": "Surface/surface-brand-secondary",
  "fills|INSTANCE|Blue/09(Base)": "Surface/surface-brand-primary",
  "fills|INSTANCE|Orange/02": "Surface/surface-warning-tertiary",
  "fills|INSTANCE|Label/positive-bg": "Label/label-positive-bg",
  "fills|INSTANCE|Label/negative-bg": "Label/label-negative-bg",
  "fills|INSTANCE|Label/accent-3-bg": "Label/label-accent-3-bg",

  // ---- strokes
  "strokes|FRAME|Gray/01-Surface": "Border/border-pure",
  "strokes|FRAME|Gray/04": "Border/border-tertiary",
  "strokes|FRAME|Gray/05": "Border/border-secondary",
  "strokes|FRAME|Gray/07": "Border/border-primary",
  "strokes|FRAME|Blue/09(Base)": "Border/border-brand",
  "strokes|FRAME|Orange/09(Base)": "Border/border-warning",
  "strokes|FRAME|Green/09(Base)": "Border/border-success",   // confirmed live: exactly this context (strokes · FRAME)
  "strokes|INSTANCE|Gray/01-Surface": "Border/border-pure",
  "strokes|INSTANCE|Gray/04": "Border/border-tertiary",
  "strokes|INSTANCE|Gray/05": "Border/border-secondary",
  "strokes|INSTANCE|Gray/07": "Border/border-primary",
  "strokes|INSTANCE|Blue/09(Base)": "Border/border-brand",
  "strokes|INSTANCE|Red/09(Base)": "Border/border-error",
  "strokes|INSTANCE|Orange/09(Base)": "Border/border-warning",
  "strokes|INSTANCE|Green/09(Base)": "Border/border-success",
  "strokes|RECTANGLE|Gray/07": "Border/border-primary",
  "strokes|LINE|Gray/05": "Border/border-secondary",
  "strokes|LINE|Gray/07": "Border/border-primary",

  // ---- icons / vectors
  //
  // Gray/05, Gray/06, and Gray/07 used to route to Border/* here, copied
  // verbatim from the separate strokes|LINE rules for the same greys
  // (dividers drawn as LINE nodes, correctly Border). That's a different
  // shape of layer — an icon glyph's own fill isn't a divider — and it was
  // wrongly conflated with genuine border colour. Confirmed live: folder/
  // exchange icon glyphs (Binance, CoinDCX, Coinbase, wallet icons) were
  // bound to Border/border-secondary instead of a Content token. Redirected
  // to Content/content-quaternary — the lightest defined Content step, no
  // exact Gray/05-07 equivalent exists in this token system.
  "fills|VECTOR|Gray/12": "Content/content-primary",
  "fills|VECTOR|Gray/10": "Content/content-secondary",
  "fills|VECTOR|Gray/09": "Content/content-tertiary",
  "fills|VECTOR|Gray/08": "Content/content-quaternary",
  "fills|VECTOR|Gray/07": "Content/content-quaternary",
  "fills|VECTOR|Gray/05": "Content/content-tertiary",   // corrected per direct request — Gray/06 and Gray/07 stay quaternary
  "fills|VECTOR|Gray/01-Surface": "Surface/surface-raised",
  "fills|VECTOR|Absolute/White": "Content/content-absolute-white",
  "fills|VECTOR|Absolute/Black": "Content/content-absolute-black",
  "fills|VECTOR|Blue/03": "Surface/surface-brand-secondary",
  "fills|VECTOR|Blue/10": "Surface/surface-brand-solid",
  "fills|VECTOR|Red/09(Base)": "Surface/surface-error-primary",
  "fills|VECTOR|Orange/09(Base)": "Content/content-warning-primary",
  "fills|VECTOR|Green/09(Base)": "Content/content-success-primary",
  "strokes|VECTOR|Gray/12": "Content/content-primary",
  "strokes|VECTOR|Gray/10": "Content/content-secondary",
  "strokes|VECTOR|Gray/09": "Content/content-tertiary",
  "strokes|VECTOR|Gray/08": "Content/content-quaternary",
  "strokes|VECTOR|Gray/07": "Border/border-primary",
  "strokes|VECTOR|Gray/04": "Border/border-tertiary",
  "strokes|VECTOR|Blue/09(Base)": "Content/content-brand-primary",
  "strokes|VECTOR|Blue/10": "Surface/surface-brand-solid",

  "fills|ELLIPSE|Gray/12": "Content/content-primary",
  "fills|ELLIPSE|Gray/09": "Content/content-tertiary",
  "fills|ELLIPSE|Blue/03": "Surface/surface-brand-secondary",
  "fills|ELLIPSE|Blue/09(Base)": "Surface/surface-brand-primary",
  "fills|ELLIPSE|Green/09(Base)": "Surface/surface-success-primary",
  "fills|ELLIPSE|Green/10": "Content/content-success-primary-solid",
  "strokes|ELLIPSE|Absolute/White": "Surface/surface-absolute",

  "fills|RECTANGLE|Gray/09": "Content/content-tertiary",
  "fills|BOOLEAN_OPERATION|Gray/09": "Content/content-tertiary",
  "fills|BOOLEAN_OPERATION|Blue/09(Base)": "Surface/surface-brand-primary",

  // ---- Absolute/White resolves by context: surface on containers, content on text
  "fills|FRAME|Absolute/White": "Surface/surface-absolute",
  "fills|INSTANCE|Absolute/White": "Surface/surface-absolute",
  "fills|RECTANGLE|Absolute/White": "Surface/surface-absolute",
  "fills|ELLIPSE|Absolute/White": "Surface/surface-absolute",

  // ---- Gray/06 and Gray/11 have no token of their own (see PRIM_ALIAS)
  "strokes|FRAME|Gray/06": "Border/border-primary",
  "strokes|INSTANCE|Gray/06": "Border/border-primary",
  "strokes|RECTANGLE|Gray/06": "Border/border-primary",
  "strokes|LINE|Gray/06": "Border/border-primary",
  "strokes|VECTOR|Gray/06": "Border/border-primary",
  "fills|VECTOR|Gray/06": "Content/content-quaternary",   // fill, not a stroke — same icon-vs-border fix as Gray/05 and Gray/07 above
  "fills|TEXT|Gray/11": "Content/content-primary",
  "fills|VECTOR|Gray/11": "Content/content-primary",
  "fills|ELLIPSE|Gray/11": "Content/content-primary",
  "strokes|VECTOR|Gray/11": "Content/content-primary",

  // ---- resolved from majority where the reference screens disagreed
  "strokes|VECTOR|Absolute/White": "Surface/surface-absolute",   // 19 vs 4
  "strokes|VECTOR|Gray/01-Surface": "Border/border-pure",        // 14 vs 6
  "fills|VECTOR|Blue/09(Base)": "Surface/surface-brand-primary", // 96 vs 54
};

/**
 * Primitives that no semantic token aliases, and what to treat them as.
 *
 * Gray/06 and Gray/11 sit between defined steps — the border scale runs
 * 04/05/07 and the content scale runs 08/09/10/12 — so a lookup on them
 * always fails. Substituting the nearest defined step means they resolve
 * correctly in every context: Gray/06 as a stroke finds border-primary,
 * Gray/11 as text finds content-primary, and so on.
 */
const PRIM_ALIAS = {
  "Gray/06": "Gray/07",   // -> border-primary in stroke contexts
  "Gray/11": "Gray/12",   // -> content-primary in text/icon contexts
};

/**
 * Structural rule for tables: a table's header fill is always
 * surface-secondary, and a table's row border is always border-secondary,
 * regardless of which primitive is actually sitting underneath it.
 *
 * This exists because the primitive-matching rules above can't fix it — in
 * the "Customers" reference table (Train section), the Heading instance's
 * fill is correctly bound to Gray/02-Background, and Gray/02-Background
 * *is* surface-primary everywhere else in the file. The header primitive
 * itself was hand-picked wrong, not merely unmapped, so no primitive rule
 * can distinguish this case from a legitimate surface-primary layer. Same
 * story for the row border, bound to a stray "[Day]/Gray/04" (#D3E0E6)
 * that doesn't match the system's real Gray/04 at all.
 *
 * Confirmed again in the "Transactions/Categrozed" table, which uses a
 * *different* component-naming pair ("Transaction Heading" / "Transaction")
 * for the exact same header/border bug — its header used a stray
 * "[Day]/Gray/03" and its row border the same stray "[Day]/Gray/04", while
 * the correct reference version of that same screen (node 2892:13284) uses
 * clean Surface/surface-secondary and Border/border-secondary respectively.
 * That confirms both the fix and that KoinX has more than one table-
 * component naming convention, so this is a list of known pairs, not a
 * single name.
 */
const TABLE_HEADER_NAMES = ["Heading", "Transaction Heading"];
const TABLE_ROW_NAMES = ["Table row", "Transaction"];

/**
 * A third table-component pattern: the Members table names its header row
 * and its body rows identically ("Stable Table/ Row") — there's no separate
 * header name to key on at all. Confirmed live: both the header and a data
 * row are already bound to the semantic token Surface/surface-brand-primary
 * (a bright blue "default/unstyled" placeholder), which is why the whole
 * table — header bar, several row dividers, and every Role badge — renders
 * uniformly blue instead of the header being surface-secondary and the rest
 * resolving normally.
 *
 * Disambiguated by position, not name: among children sharing this exact
 * name, the FIRST one is the header, the rest are rows — but only when
 * there are at least two of them (a lone match is left alone rather than
 * guessed at, since one row by itself isn't evidence of a header+body pair).
 */
const AMBIGUOUS_TABLE_ROW_NAMES = ["Stable Table/ Row"];
const TABLE_HEADER_SEMANTIC = "Surface/surface-secondary";
const TABLE_BORDER_SEMANTIC = "Border/border-secondary";

/**
 * Structural rule: text sitting on a strong brand or status background must
 * use an absolute token, never a theme-reactive Content token.
 *
 * Found live in the Navbar component: the active "Customers" item's
 * background is genuinely bound to Surface/surface-brand-primary, and its
 * label is bound to Content/content-primary — already a semantic token, just
 * the wrong one. It happens to render white right now only because the file
 * is being viewed in Dark theme, where content-primary resolves to white; in
 * Light theme content-primary resolves near-black and would go invisible on
 * the same blue pill. Same failure mode as the original Add-Customer button
 * fix, just triggered by background context instead of the text's own colour.
 *
 * Scoped to the saturated "primary"/"solid" tier only — surface-brand-
 * secondary/subtle and the error/warning/success secondary/tertiary/subtle
 * tiers are pale tints that need normal dark text, not white, or they'd
 * become unreadable.
 */
const STRONG_BG_PRIMITIVES = {
  "Blue/09(Base)": 1,     // surface-brand-primary
  "Blue/10": 1,           // surface-brand-solid
  "Red/09(Base)": 1,      // surface-error-primary
  "Red/10": 1,            // surface-error-solid
  "Orange/09(Base)": 1,   // surface-warning-primary
  "Orange/10": 1,         // surface-warning-solid
  "Green/09(Base)": 1,    // surface-success-primary
  "Green/10": 1,          // surface-success-solid
};

/**
 * The same strong backgrounds, but by SEMANTIC token name — needed because a
 * background is very often already converted to the token by the time this
 * check runs (e.g. an "already semantic" layer, or one this same plugin run
 * just fixed moments earlier). STRONG_BG_PRIMITIVES alone misses that case
 * entirely: normalisePrim can't turn "Surface/surface-brand-primary" back
 * into "Blue/09(Base)", so the check silently passed it through.
 *
 * Confirmed live on the Members table's Role badges: background genuinely
 * bound to Surface/surface-brand-primary (already the token, not a raw
 * primitive), label text bound to Content/content-primary (dark, near-
 * invisible on the blue pill) and the icon glyph the same dark colour —
 * hence checking both TEXT and icon (VECTOR/BOOLEAN_OPERATION) fills below.
 */
const STRONG_BG_SEMANTICS = {
  "Surface/surface-brand-primary": 1,
  "Surface/surface-brand-solid": 1,
  "Surface/surface-error-primary": 1,
  "Surface/surface-error-solid": 1,
  "Surface/surface-warning-primary": 1,
  "Surface/surface-warning-solid": 1,
  "Surface/surface-success-primary": 1,
  "Surface/surface-success-solid": 1,
};
const TEXT_ON_STRONG_BG_SEMANTIC = "Content/content-absolute-white";

/**
 * Below this perceptual brightness (0-255), a background counts as
 * "strong" even if it isn't one of the specific brand/status colours
 * above — a dark-theme page/card background, for instance. Every
 * confirmed live dark-mode surface (Surface/surface-primary #0A0A12,
 * surface-raised #171A26, surface-secondary #212538) scores under 40;
 * every existing STRONG_BG_PRIMITIVES colour scores 77+ (Green/09(Base),
 * the dimmest of them, scores ~129) — 50 sits comfortably in the gap
 * between the two, so this can't misfire on the colours already handled
 * by name above.
 */
const STRONG_BG_DARK_THRESHOLD = 50;

/**
 * How many ancestor levels onStrongBackground() will walk looking for the
 * nearest one with an actual visible fill. Generous on purpose — plain
 * auto-layout wrapper frames (no fill of their own) are common between an
 * icon/label and the real background several levels up; confirmed live,
 * one case needed 5 levels. Cheap to check either way, since the walk
 * stops at the FIRST fill-bearing ancestor regardless of how deep that is.
 */
const STRONG_BG_MAX_DEPTH = 10;

/**
 * An ancestor's fill below this opacity doesn't count as "the nearest real
 * background" for onStrongBackground()'s walk — confirmed live: a
 * default-off hover-state highlight (bound to a real colour, "pure white",
 * but effectively invisible in the actual screenshot) sat directly between
 * an icon and the real dark page background, and stopped the walk before
 * it ever reached the background that actually mattered. Well below
 * TINT_OPACITY_MAX (0.3) — a legitimate pale tint is meant to be visible
 * and stays well clear of this cutoff.
 */
const MIN_MEANINGFUL_FILL_OPACITY = 0.05;

/**
 * The inverse case: text ALREADY bound to Content/content-on-solid, but NOT
 * actually sitting on a strong/solid background (per STRONG_BG_SEMANTICS /
 * STRONG_BG_PRIMITIVES above), is almost certainly wrong and needs
 * correcting to Content/content-primary, the standard default for ordinary
 * text.
 *
 * This exists specifically because "already semantic" layers are normally
 * left alone on every subsequent run — a layer that was wrongly converted
 * to content-on-solid BEFORE a fix existed (e.g. via the "Gray/1" ambiguity
 * bug) stays wrong forever otherwise, since re-running the plugin never
 * revisits an already-token-bound layer.
 *
 * Confirmed live: a Workspace Settings organisation-name field is bound to
 * Content/content-on-solid (#ffffff), sitting on a plain
 * Surface/surface-primary input field — not any branded/solid background —
 * rendering as invisible white-on-white text.
 */
const CONTENT_ON_SOLID = "Content/content-on-solid";
const WRONGLY_ON_SOLID_FALLBACK = "Content/content-primary";

/**
 * Legacy/foreign variable NAMES that should be treated as directly aliasing
 * a semantic token — not primitives, so no hex or primitive lookup could
 * ever resolve them; the plugin would otherwise drop them as "not a KoinX
 * colour" and never even attempt a rule.
 *
 * "Label/Background/<letter>" / "Label/Foreground/<letter>" (and their
 * "Light/"-prefixed forms) are a legacy Label component found live on the
 * Transactions/Categrozed table's Category cells, with FOUR distinct
 * colour-coded suffixes (S/I/P/R), not one generic style — an earlier pass
 * of this rule collapsed all four to a flat neutral grey, which erased the
 * colour-coding entirely. Each is now mapped to whichever defined Label
 * token its actual hex is closest to:
 *
 *   S  bg #E3FCEF fg #00AE78  -> positive  (bg #E0FAEE fg #167E4D — green family)
 *   I  bg #FFE5F5 fg #D02090  -> accent-3  (bg #FAE0EE fg #BF2275 — magenta family)
 *   P  bg #FFF2E6 fg #FF6347  -> warning   (bg #FAEEE0 fg #985D1B — bg near-exact, orange family)
 *   R  bg #FFF1F1 fg #B22222  -> negative  (bg #FAE1E0 fg #C32822 — fg near-exact, red family)
 *
 * This is inferred from colour proximity, not confirmed against what each
 * letter stands for (e.g. whether "S" really means a sales-type category) —
 * worth a visual spot-check against the correct reference table
 * (node 2892:13284) once applied.
 */
const NAME_ALIAS = {
  "Label/Background/S": "Label/label-positive-bg",
  "Light/Label/Background/S": "Label/label-positive-bg",
  "Label/Foreground/S": "Label/label-positive-content",
  "Light/Label/Foreground/S": "Label/label-positive-content",

  "Label/Background/I": "Label/label-accent-3-bg",
  "Light/Label/Background/I": "Label/label-accent-3-bg",
  "Label/Foreground/I": "Label/label-accent-3-content",
  "Light/Label/Foreground/I": "Label/label-accent-3-content",

  "Label/Background/P": "Label/label-warning-bg",
  "Light/Label/Background/P": "Label/label-warning-bg",
  "Label/Foreground/P": "Label/label-warning-content",
  "Light/Label/Foreground/P": "Label/label-warning-content",

  "Label/Background/R": "Label/label-negative-bg",
  "Light/Label/Background/R": "Label/label-negative-bg",
  "Label/Foreground/R": "Label/label-negative-content",
  "Light/Label/Foreground/R": "Label/label-negative-content",

  // "Steel" isn't a defined KoinX colour family at all (no hex table entry
  // under any spelling), so it can never resolve through the normal
  // primitive pipeline — forced straight to the semantic token per direct
  // request. Both the bracketed-day-mode form seen live and the bare form
  // are covered defensively, same pattern as the Label aliases above.
  "[Day]/Steel/01-Surface": "Surface/surface-raised",
  "Steel/01-Surface": "Surface/surface-raised",
};

/**
 * Colours to leave exactly as they are — never converted, never listed under
 * "Needs mapping" either. The SecondaryAccent ramp is a separate palette
 * that deliberately sits outside the semantic system (per explicit request:
 * "for SecondaryAccent colors keep it unchanged").
 */
const PRESERVE_NAME_PATTERNS = [
  /SecondaryAccent/i,
];

/**
 * Component/layer names that mark a subtree as protected artwork — crypto
 * currency logos, exchange/wallet logos, and country flags carry their own
 * fixed brand colours and must never be recoloured to a semantic token,
 * per direct request ("they must stay however they are").
 *
 * Unlike PRESERVE_NAME_PATTERNS (which matches a bound VARIABLE's name),
 * this matches the LAYER/component NAME and is checked structurally — walk
 * up the ancestor chain, not just the node itself — because this kind of
 * artwork is almost always raw, unbound multi-colour paths with nothing to
 * match by variable name at all. "Crypto Logos" and "Exchanges&Wallets" are
 * confirmed live component instance names (seen wrapping BTC/ETH icons and
 * exchange logos like Binance/Coinbase in the Transactions table). "Flags"
 * is included per the same request but not independently confirmed live —
 * worth flagging if it turns out to miss real instances or over-match.
 */
const PRESERVE_ARTWORK_NAME_PATTERNS = [
  /Crypto\s*Logos?/i,
  /Exchanges?\s*&?\s*Wallets?/i,
  /\bFlags?\b/i,
];

/**
 * How close a raw, unbound hex has to be to a known primitive (Euclidean
 * RGB distance, 0-441 max) before it's treated as a near-duplicate of that
 * primitive rather than a genuinely unknown colour.
 *
 * Confirmed need: a nav item's selected-state fill is a raw #E5EEFF with no
 * Variable or Style binding at all — distance to Blue/03 (#EAF2FF, what
 * Surface/surface-brand-secondary aliases) is ~6, clearly the same colour
 * with a slightly different value from manual entry, not a different one.
 * 20 is tight enough that unrelated hues (typically 100+) never match.
 */
const NEAREST_MATCH_MAX_DISTANCE = 20;

/**
 * A "primary"-tier Surface primitive used at reduced paint opacity is
 * almost always a hand-rolled stand-in for the proper pale "secondary"
 * token — every family (brand/error/warning/success) already has one
 * defined for exactly this "light wash" look, at full opacity, with no
 * transparency trick needed.
 *
 * Confirmed live: a nav item's selected-state highlight is raw #0052FE
 * (exact Blue/09(Base), what Surface/surface-brand-primary aliases) at 10%
 * paint opacity — a pale lavender wash. Rather than preserve that opacity
 * on brand-primary (technically correct, but not how this design system
 * expresses a light tint), it should redirect to
 * Surface/surface-brand-secondary at full opacity, the token that already
 * *is* that pale colour.
 *
 * Scoped to the "-primary" tier only, not "-solid" — a solid token is
 * typically a hover/pressed full-opacity state, not a tint base, so
 * reduced opacity on it doesn't imply the same "meant to be pale" pattern.
 */
const OPACITY_TINT_REDIRECT = {
  "Blue/09(Base)": "Surface/surface-brand-secondary",
  "Red/09(Base)": "Surface/surface-error-secondary",
  "Orange/09(Base)": "Surface/surface-warning-secondary",
  "Green/09(Base)": "Surface/surface-success-secondary",
};

/**
 * Paint opacity below this counts as "clearly a tint/wash technique", not
 * some other deliberate partial transparency. 30% gives comfortable margin
 * above the confirmed 10% case while staying well under 50%, where a
 * different intent (e.g. a scrim/overlay) becomes more plausible.
 */
const TINT_OPACITY_MAX = 0.3;

/**
 * A wrapper whose fill is bound to Surface/surface-absolute AND whose stroke
 * is bound to one of these Border tokens, nested inside a table row, should
 * have both removed entirely rather than recoloured.
 *
 * Confirmed on the Transactions/Categrozed table's Category cell wrapper: it
 * carries this fill+stroke pair, sized to the full cell, while every other
 * cell wrapper in the same row has no fill of its own at all — transparent,
 * letting the row's own background show through. An opaque theme-invariant
 * white swatch here isn't a wrong colour choice, it's not supposed to have a
 * fill at all. Two stroke variants confirmed live so far (border-tertiary on
 * one instance, border-primary on another — same wrapper pattern, different
 * row). Matched by the semantic tokens themselves, not by the wrapper's own
 * layer name — Figma auto-named it the generic "Component 66"/"Component
 * 70", too fragile to key a structural rule on.
 */
const REMOVE_IN_TABLE_ROW = {
  fillSemantic: "Surface/surface-absolute",
  strokeSemantics: ["Border/border-tertiary", "Border/border-primary"],
};

/**
 * Raw hex values seen in the file that aren't an exact primitive swatch but
 * should be treated as one — usually a slightly-off value from manual
 * colour entry rather than picking the variable. Checked before the normal
 * hex lookup, so it wins over whatever primitive happens to share a name.
 */
const HEX_ALIAS = {
  "#EFF2F5": "Gray/02-Background",   // -> surface-primary
  "#DEDFE2": "Gray/04",              // -> border-tertiary (strokes) / surface-tertiary (fills)
  "#D3E0E6": "Gray/04",              // same stray value confirmed live, unbound this time — see "[Day]/Gray/04" cases in the table structural rule comments
};

/**
 * Bound-variable names that aren't a real KoinX primitive at all (not in
 * HEX_LIGHT/HEX_DARK under any spelling) but should be treated as one.
 * Confirmed live: "Absolute/Green-Dark" (#009B69), used for the "Incoming"
 * value in a cash-flow widget — nearest real step is Green/10 (#00AE78),
 * and it's used the same way Red/09(Base) is for the negative "Outgoing"
 * value, so it should resolve the same way (Content/content-success-
 * primary-solid via the normal Green/10 rule) rather than being left raw.
 */
const PRIMITIVE_NAME_ALIAS = {
  "Absolute/Green-Dark": "Green/10",
};

/**
 * Fallback when no exact rule exists: which token group does this context
 * belong to? Derived from the reference screens, where property + node type
 * predicted the group correctly ~95% of the time.
 */
const GROUP_FOR = {
  "fills|TEXT": "Content",
  "fills|FRAME": "Surface",
  "fills|INSTANCE": "Surface",
  "fills|COMPONENT": "Surface",
  "fills|RECTANGLE": "Surface",
  "fills|GROUP": "Surface",
  "fills|VECTOR": "Content",
  "fills|ELLIPSE": "Content",
  "fills|STAR": "Content",
  "fills|POLYGON": "Content",
  "fills|BOOLEAN_OPERATION": "Content",
  "strokes|FRAME": "Border",
  "strokes|INSTANCE": "Border",
  "strokes|COMPONENT": "Border",
  "strokes|RECTANGLE": "Border",
  "strokes|LINE": "Border",
  "strokes|ELLIPSE": "Border",
  "strokes|VECTOR": "Content",
  "strokes|BOOLEAN_OPERATION": "Content",
};

/** Primitive hex values, used to match layers that carry a raw colour. */
const HEX_LIGHT = {"Gray/01-Surface":"#FFFFFF","Gray/02-Background":"#F1F5F9","Gray/03":"#ECF1F7","Gray/04":"#E2E8F0","Gray/05":"#DBE2EC","Gray/06":"#D2DBE7","Gray/07":"#CBD5E1","Gray/08":"#AEBDD2","Gray/09":"#64748B","Gray/10":"#334155","Gray/11":"#1E293B","Gray/12":"#0F172A","Blue/01":"#FCFDFF","Blue/02":"#F5FAFF","Blue/03":"#EAF2FF","Blue/04":"#DCEAFF","Blue/05":"#CBE0FF","Blue/06":"#B4D2FF","Blue/07":"#98C0FF","Blue/08":"#73A5FF","Blue/09(Base)":"#0052FE","Blue/10":"#0148DF","Blue/11":"#0141CF","Blue/12":"#0E2B6C","Orange/01":"#FEFCFB","Orange/02":"#FFF5EF","Orange/03":"#FFEBDF","Orange/04":"#FFD9C4","Orange/05":"#FFCBAE","Orange/06":"#FFBB96","Orange/07":"#FCA87F","Orange/08":"#F1905F","Orange/09(Base)":"#FB6F04","Orange/10":"#EA6703","Orange/11":"#C35A00","Orange/12":"#572E18","Red/01":"#FFFCFC","Red/02":"#FFF7F7","Red/03":"#FFEAE9","Red/04":"#FFDAD8","Red/05":"#FFCBC9","Red/06":"#FFBAB8","Red/07":"#FCA5A4","Red/08":"#FF6A7C","Red/09(Base)":"#F7324C","Red/10":"#E9193F","Red/11":"#D90034","Red/12":"#6B0819","Green/01":"#FAFEFC","Green/02":"#F2FCF7","Green/03":"#E1F8EC","Green/04":"#CEF3E0","Green/05":"#B8ECD2","Green/06":"#9CE2C0","Green/07":"#74D4A9","Green/08":"#1EBF88","Green/09(Base)":"#0FBA83","Green/10":"#00AE78","Green/11":"#008255","Green/12":"#0C3D2A","Absolute/White":"#FFFFFF","Absolute/Black":"#000000","Label/positive-bg":"#E0FAEE","Label/positive-content":"#167E4D","Label/negative-bg":"#FAE1E0","Label/negative-content":"#C32822","Label/warning-bg":"#FAEEE0","Label/warning-content":"#985D1B","Label/info-bg":"#E0EBFA","Label/info-content":"#2267C1","Label/accent-bg":"#EEE0FA","Label/accent-content":"#7B23C7","Label/neutral-bg":"#EBECF0","Label/neutral-content":"#60697B","Label/accent-2-bg":"#FAE0F9","Label/accent-2-content":"#B21FAD","Label/accent-3-bg":"#FAE0EE","Label/accent-3-content":"#BF2275"};

const HEX_DARK = {"Gray/01-Surface":"#171A26","Gray/02-Background":"#0A0A12","Gray/03":"#212538","Gray/04":"#2D3246","Gray/05":"#3A3F54","Gray/06":"#484E63","Gray/07":"#595F75","Gray/08":"#6D7389","Gray/09":"#A9AFC5","Gray/10":"#BDC3D9","Gray/11":"#EFF5FF","Gray/12":"#FFFFFF","Blue/01":"#0B111E","Blue/02":"#101728","Blue/03":"#121D3A","Blue/04":"#172C6B","Blue/05":"#1F377F","Blue/06":"#284390","Blue/07":"#3150A6","Blue/08":"#3A5EC4","Blue/09(Base)":"#4A78FF","Blue/10":"#6290FF","Blue/11":"#8DB3FF","Blue/12":"#D1E1FF","Orange/01":"#16100D","Orange/02":"#1F1510","Orange/03":"#351C0F","Orange/04":"#4B1C00","Orange/05":"#592504","Orange/06":"#693315","Orange/07":"#80431C","Orange/08":"#A45723","Orange/09(Base)":"#FF8C40","Orange/10":"#FFA054","Orange/11":"#F5AF69","Orange/12":"#FFDBC7","Red/01":"#170E0E","Red/02":"#211212","Red/03":"#3E0E12","Red/04":"#560411","Red/05":"#670A18","Red/06":"#791924","Red/07":"#8F2E3A","Red/08":"#BB3C4C","Red/09(Base)":"#FF5A6E","Red/10":"#FF6E82","Red/11":"#FF98A0","Red/12":"#FFD1D2","Green/01":"#0B130F","Green/02":"#111B16","Green/03":"#102D21","Green/04":"#0A3C29","Green/05":"#0E4A33","Green/06":"#17583F","Green/07":"#29684F","Green/08":"#317D60","Green/09(Base)":"#21D39A","Green/10":"#3FF1B8","Green/11":"#70F5CA","Green/12":"#AEF0D2","Absolute/White":"#FFFFFF","Absolute/Black":"#000000","Label/positive-bg":"#1E382C","Label/positive-content":"#5CE0A2","Label/negative-bg":"#381F1E","Label/negative-content":"#E26965","Label/warning-bg":"#382C1E","Label/warning-content":"#E0A25C","Label/info-bg":"#1E2A38","Label/info-content":"#5C95E0","Label/accent-bg":"#2C1E38","Label/accent-content":"#AF72E4","Label/neutral-bg":"#262A31","Label/neutral-content":"#929AAA","Label/accent-2-bg":"#381E37","Label/accent-2-content":"#E05CDC","Label/accent-3-bg":"#381E2C","Label/accent-3-content":"#E160A5"};

/* ========================================================================
   Xemantics — main
   ======================================================================== */

const PRIM_COLLECTION = "Colors-Primitives";
const SEM_COLLECTION  = "Colors-Semantics";
const OVERRIDE_KEY    = "xui-apply-overrides-v1";

// Starts compact (the empty "Select a frame" state is short) and the UI
// resizes itself to fit its actual content via a "resize" message below —
// otherwise a fixed 580px window left a huge blank area under the button
// before any results existed to fill it.
figma.showUI(__html__, { width: 380, height: 230 });

function hex(c) {
  const h = x => Math.round(x * 255).toString(16).padStart(2, "0");
  return ("#" + h(c.r) + h(c.g) + h(c.b)).toUpperCase();
}
function firstSolid(paints) {
  if (!Array.isArray(paints) || !paints.length) return null;
  return paints.find(p => p.type === "SOLID" && p.visible !== false) || null;
}

/**
 * Core primitive -> semantic resolution: a saved override, else an exact
 * RULES entry, else the nearest-step/group fallback chain. Shared between
 * the main per-paint loop and resolveMixedTextFill() (for a mixed-fill
 * text layer where every character-range segment must independently
 * resolve through this exact same logic to check they all agree) — kept
 * as one function so the two paths can never quietly drift apart.
 */
function resolveSemanticForPrimitive(prop, type, primitive, overrides, GROUP_INDEX) {
  const sig = prop + "|" + type + "|" + primitive;
  let semantic = (overrides && overrides[sig]) || RULES[sig];
  if (!semantic) {
    const lookup = PRIM_ALIAS[primitive] || primitive;
    const grp = GROUP_FOR[prop + "|" + type];
    if (grp) {
      const c = GROUP_INDEX[grp + "|" + lookup];
      if (c && c.length) semantic = c[0];
      // Deliberately NO fallback to a different group here. A Surface
      // context must never resolve to a Content/Border/Label token just
      // because some OTHER group happens to alias the same primitive —
      // confirmed live: a table header background (Surface) was wrongly
      // bound to Content/content-primary this way. This exact bug class
      // was previously patched per-primitive (the Gray/05-07 icon fix
      // added explicit RULES entries to dodge it) rather than fixed at
      // the root, which meant every primitive WITHOUT a hand-added
      // workaround kept hitting it — especially foreign (non-KoinX)
      // primitives, which have none. Leaving it unresolved (falls into
      // "Needs mapping", with a same-group suggestion from
      // nearestSemanticInGroup) is correct; guessing across groups isn't.
    } else {
      // No known group for this prop+type combination at all (context
      // genuinely ambiguous) — searching every group as a last resort is
      // reasonable here, since there's no "correct" group to violate.
      const order = ["Surface", "Content", "Border", "Label"];
      for (let g = 0; g < order.length; g++) {
        const c = GROUP_INDEX[order[g] + "|" + lookup];
        if (c && c.length) { semantic = c[0]; break; }
      }
    }
  }
  return semantic;
}
/**
 * Visits every node in the tree, passing each callback both the node and
 * whether IT (or any ancestor) is hidden — a node's own `visible` defaults
 * true even when it sits inside a hidden parent, so ancestor state has to
 * be tracked through the walk rather than checked on each node in
 * isolation. Used to route hidden layers out of the review lists (see
 * "Hidden layers" in applyTo()) instead of cluttering them with colours
 * the user can't even see on canvas.
 */
function walk(root, fn) {
  const stack = [{ n: root, hidden: root.visible === false }];
  while (stack.length) {
    const item = stack.pop();
    const n = item.n, hidden = item.hidden;
    fn(n, hidden);
    if ("children" in n) {
      for (const c of n.children) stack.push({ n: c, hidden: hidden || c.visible === false });
    }
  }
}

/** True if `name` is any known table-row name, ambiguous or not. */
function isAnyRowName(name) {
  return TABLE_ROW_NAMES.indexOf(name) > -1 || AMBIGUOUS_TABLE_ROW_NAMES.indexOf(name) > -1;
}

/** True if `node` has an immediate child whose name is a known table-row name. */
function hasTableRowChild(node) {
  if (!node || !("children" in node)) return false;
  for (const c of node.children) if (isAnyRowName(c.name)) return true;
  return false;
}

/** `node`'s siblings (including itself) that share its exact name. */
/** True if `name` matches one of the patterns in PRESERVE_NAME_PATTERNS. */
function isPreservedName(name) {
  if (!name) return false;
  for (let i = 0; i < PRESERVE_NAME_PATTERNS.length; i++) {
    if (PRESERVE_NAME_PATTERNS[i].test(name)) return true;
  }
  return false;
}

/**
 * True if `node` itself, or any ancestor, is a component/frame whose name
 * marks it as protected artwork (crypto logo, exchange/wallet logo, flag)
 * — see PRESERVE_ARTWORK_NAME_PATTERNS in rules.js. Bounded ancestor walk,
 * same shape as withinTableRow/onStrongBackground.
 */
function isWithinPreservedArtwork(node) {
  let n = node, depth = 0;
  while (n && depth < 8) {
    if (n.name) {
      for (let i = 0; i < PRESERVE_ARTWORK_NAME_PATTERNS.length; i++) {
        if (PRESERVE_ARTWORK_NAME_PATTERNS[i].test(n.name)) return true;
      }
    }
    n = n.parent;
    depth++;
  }
  return false;
}

function siblingsWithSameName(node) {
  const p = node.parent;
  if (!p || !("children" in p)) return [];
  return p.children.filter(function (c) { return c.name === node.name; });
}

/**
 * "header" if `node` IS a table Heading instance itself (sitting beside
 * matching row siblings), "row" if `node` IS a table row instance itself,
 * else null. Deliberately an identity check, not an ancestor walk: both
 * instances contain "Stable Table/ Cell" children with their own fills (and
 * text with its own colour), which already resolve correctly through the
 * normal primitive rules — sweeping them into this override too was the bug
 * (it forced the header's cell text onto Surface/surface-secondary instead
 * of leaving it to resolve to Content/content-primary as it should).
 *
 * For AMBIGUOUS_TABLE_ROW_NAMES, header and row share one name, so identity
 * alone can't tell them apart — resolved positionally instead: first among
 * same-named siblings is the header, the rest are rows, and a lone match
 * (no real header+body pairing) is left unclassified rather than guessed at.
 */
function tableRole(node) {
  if (AMBIGUOUS_TABLE_ROW_NAMES.indexOf(node.name) > -1) {
    const sibs = siblingsWithSameName(node);
    if (sibs.length < 2) return null;
    return sibs[0] === node ? "header" : "row";
  }
  if (TABLE_ROW_NAMES.indexOf(node.name) > -1) return "row";
  if (TABLE_HEADER_NAMES.indexOf(node.name) > -1 && hasTableRowChild(node.parent)) return "header";
  return null;
}

/** True if `node` itself, or any ancestor, is a known table-row instance. */
function withinTableRow(node) {
  let n = node, depth = 0;
  while (n && depth < 6) {
    if (isAnyRowName(n.name)) return true;
    n = n.parent;
    depth++;
  }
  return false;
}

/**
 * The name `node`'s own `prop` is bound to — via a Variable, or a legacy
 * Figma Style — or null. Both binding systems are checked because they're
 * completely separate APIs (boundVariables vs. fillStyleId/strokeStyleId);
 * a colour applied as a Style has no boundVariables entry at all, and was
 * previously invisible to every check here, falling through to its raw
 * computed hex with no name — confirmed live: a stroke showing "[Day]/
 * Gray/04" in Figma's own panel was reported by this plugin only as its hex
 * #D3E0E6, because it's Style-bound, not Variable-bound.
 *
 * Style names are looked up through the same `resolved` map scan() already
 * builds for variables, under a "style:<id>" key — see scan().
 */
function boundNameFor(node, prop, resolved) {
  const bv = node.boundVariables && node.boundVariables[prop];
  if (bv && bv.length && bv[0].type === "VARIABLE_ALIAS") {
    const info = resolved[bv[0].id];
    return info ? info.name : null;
  }
  const styleId = node[prop === "fills" ? "fillStyleId" : "strokeStyleId"];
  if (styleId && typeof styleId === "string" && styleId.length) {
    const info = resolved["style:" + styleId];
    return info ? info.name : null;
  }
  return null;
}

/** The semantic name `node`'s own `prop` is bound to, or null. */
function ownBoundSemanticName(node, prop, resolved) {
  return boundNameFor(node, prop, resolved);
}

/**
 * True only if `node`'s fill AND stroke BOTH match REMOVE_IN_TABLE_ROW at
 * once — checked jointly, not per-paint, so a node with only one of the two
 * (e.g. a legitimately white element with some other stroke) is left alone.
 */
function matchesRemovePattern(node, resolved) {
  return ownBoundSemanticName(node, "fills", resolved) === REMOVE_IN_TABLE_ROW.fillSemantic &&
         REMOVE_IN_TABLE_ROW.strokeSemantics.indexOf(ownBoundSemanticName(node, "strokes", resolved)) > -1;
}

/**
 * True if `node`'s own first solid fill is a "strong" brand/status
 * background — checked BOTH as a raw primitive (Blue/09(Base) etc.) AND as
 * an already-converted semantic token (Surface/surface-brand-primary etc.),
 * since a background very often already IS the token by the time this runs.
 * Synchronous — relies on `resolved`/`HEX_INDEX` already being populated by
 * scan(), since walk() visits every node in the tree (not just text), so an
 * ancestor's own fill binding was already collected and resolved.
 */
/**
 * Cheap perceptual brightness (0-255, no gamma correction — this is a
 * background/foreground heuristic, not a WCAG contrast calculation).
 * Confirmed live: Green/09(Base) (#0FBA83), one of the existing strong
 * brand/status colours, scores ~129 here — comfortably above
 * STRONG_BG_DARK_THRESHOLD, so the darkness check below can never
 * duplicate or conflict with the existing name/primitive list; it only
 * catches colours meaningfully darker than any of those.
 */
function perceptualBrightness(hexColor) {
  const i = parseInt(hexColor.slice(1), 16);
  const r = (i >> 16) & 255, g = (i >> 8) & 255, b = i & 255;
  return (r * 299 + g * 587 + b * 114) / 1000;
}
function isVeryDark(hexColor) {
  return perceptualBrightness(hexColor) < STRONG_BG_DARK_THRESHOLD;
}

/**
 * True if `node` has an actual visible solid fill of its own (as opposed
 * to being transparent/fill-less, which is the common case for a plain
 * auto-layout wrapper frame — those don't represent a "background" at
 * all, and checking one would be checking nothing).
 */
/**
 * True only if `node`'s own fill is not just present but actually shows up
 * on screen. Two SEPARATE opacity values compound here, and both have to
 * be checked: the fill PAINT's own opacity (solid.opacity), and the
 * NODE's overall layer opacity (node.opacity — the "Appearance > Opacity"
 * slider in Figma's UI, entirely independent of the paint's own opacity).
 * `firstSolid()` only checks `visible !== false`, neither of these.
 * Confirmed live: an icon's immediate parent frame had its own fill bound
 * to a real colour ("pure white") at full PAINT opacity, but the FRAME
 * itself was set to 0% layer opacity — a default-off hover-state
 * highlight — so it rendered nothing visible, yet the first version of
 * this check (which only looked at solid.opacity) still treated it as a
 * real background and stopped the walk right there, never reaching the
 * actual dark page background several levels further up. Any legitimate
 * low-opacity TINT (handled separately by OPACITY_TINT_REDIRECT) still
 * has meaningfully non-zero opacity on both fronts, so this cutoff is set
 * well below that, not to be confused with it.
 */
function hasOwnVisibleFill(node) {
  if (!node || !("fills" in node)) return false;
  const solid = firstSolid(node.fills);
  if (!solid) return false;
  const paintOpacity = typeof solid.opacity === "number" ? solid.opacity : 1;
  const nodeOpacity = typeof node.opacity === "number" ? node.opacity : 1;
  return (paintOpacity * nodeOpacity) > MIN_MEANINGFUL_FILL_OPACITY;
}

/**
 * Whether a node WITH a confirmed visible fill counts as "strong" — either
 * one of the specific bright brand/status colours (STRONG_BG_PRIMITIVES /
 * STRONG_BG_SEMANTICS — badges, pills, solid buttons), or, more generally,
 * any colour dark enough on its own that pure black content on top of it
 * would be unreadable (a dark-theme page/card background, say). The
 * second check is by actual rendered brightness, not name, since the SAME
 * semantic name (e.g. Surface/surface-primary) means a pale colour in
 * light mode and a near-black one in dark mode — a name-only list can't
 * tell those apart, only the real colour can.
 */
function ownFillIsStrongBg(node, resolved, HEX_INDEX) {
  const solid = firstSolid(node.fills);
  const renderedHex = hex(solid.color);
  const name = boundNameFor(node, "fills", resolved);
  if (name) {
    if (STRONG_BG_SEMANTICS[name]) return true;
    const prim = normalisePrim(name, renderedHex);
    if (prim && STRONG_BG_PRIMITIVES[prim]) return true;
  } else {
    const prim = HEX_INDEX[renderedHex];
    if (prim && STRONG_BG_PRIMITIVES[prim]) return true;
  }
  return isVeryDark(renderedHex);
}

/**
 * True if `node` (text or an icon glyph) sits on a strong/dark background
 * — walks up to the NEAREST ancestor that actually has a visible fill of
 * its own (skipping plain fill-less wrapper frames, which are extremely
 * common for an icon+label row like this) and judges by that one alone,
 * rather than checking a fixed number of levels regardless of whether
 * they're meaningful. Confirmed live: an icon glyph's nearest fill-bearing
 * ancestor was 5 frames up (three plain auto-layout wrappers in between
 * had no fill of their own) — the previous fixed depth of 3 could never
 * reach it. Stopping at the first real fill also means a normal light
 * card sitting on top of a dark/coloured page correctly does NOT force
 * its own content to white just because the page underneath is dark.
 */
function onStrongBackground(node, resolved, HEX_INDEX, trace) {
  let n = node.parent, depth = 0;
  while (n && depth < STRONG_BG_MAX_DEPTH) {
    const solid = "fills" in n ? firstSolid(n.fills) : null;
    const paintOpacity = solid && typeof solid.opacity === "number" ? solid.opacity : 1;
    const nodeOpacity = typeof n.opacity === "number" ? n.opacity : 1;
    const visible = hasOwnVisibleFill(n);
    if (trace) {
      trace.push({
        name: (n.name || "").slice(0, 30),
        type: n.type,
        depth: depth,
        hasFill: !!solid,
        paintOpacity: solid ? paintOpacity : null,
        nodeOpacity: nodeOpacity,
        hex: solid ? hex(solid.color) : null,
        countedAsFill: visible,
        strong: visible ? ownFillIsStrongBg(n, resolved, HEX_INDEX) : null,
      });
    }
    if (visible) return ownFillIsStrongBg(n, resolved, HEX_INDEX);
    n = n.parent;
    depth++;
  }
  if (trace) trace.push({ stopped: "max depth (" + STRONG_BG_MAX_DEPTH + ") reached with no visible fill found" });
  return false;
}

/**
 * Loose spellings of every primitive: unpadded step numbers, no "-Surface"/
 * "-Background"/"(Base)" suffix — e.g. "gray/1" -> "Gray/01-Surface",
 * "blue/9" -> "Blue/09(Base)". Confirmed needed live: a raw "Gray/1" (not
 * "Gray/01-Surface") shows up bound in the file and previously fell straight
 * through to "not a KoinX colour" because the exact-string lookup below has
 * no tolerance for it.
 */
const PRIM_CANON = (function () {
  const m = {};
  for (const n in HEX_LIGHT) {
    m[n.toLowerCase()] = n;
    const parts = n.split("/");
    if (parts.length === 2) {
      const numMatch = /^(\d+)/.exec(parts[1]);
      if (numMatch) {
        const unpadded = parts[0] + "/" + parseInt(numMatch[1], 10);
        m[unpadded.toLowerCase()] = n;
      }
    }
  }
  return m;
})();

/**
 * NAME_ALIAS is keyed on exact bound-variable names, but designers don't
 * spell those consistently — confirmed live: "[Day]/Steel/01-Surface" (the
 * key as originally entered) never matched because the real bound name is
 * "[Day]/Steel/01 - Surface", with spaces around the dash. Normalise both
 * sides (collapse "any spacing around a dash" to a bare dash, collapse
 * runs of whitespace) before comparing, so spacing variants of the same
 * name all resolve to the same alias without needing a duplicate entry
 * per variant.
 */
function normAliasKey(s) {
  return String(s).trim().replace(/\s*-\s*/g, "-").replace(/\s+/g, " ");
}
const NAME_ALIAS_NORM = (function () {
  const m = {};
  for (const k in NAME_ALIAS) m[normAliasKey(k)] = NAME_ALIAS[k];
  return m;
})();
function lookupNameAlias(name) {
  if (!name) return null;
  if (NAME_ALIAS[name] !== undefined) return NAME_ALIAS[name];
  const norm = NAME_ALIAS_NORM[normAliasKey(name)];
  return norm !== undefined ? norm : null;
}

/**
 * Strip a library prefix so "Light/Gray/12" and "Gray/12" both match
 * (exact, unconditionally trusted — the prefix and suffix agree, there's no
 * ambiguity about which primitive is meant), and tolerate loose/unpadded
 * forms like "Gray/1" via PRIM_CANON — but when `actualHex` (the paint's
 * real rendered colour) is known, the loose guess is only a fallback for
 * when nothing better explains that colour.
 *
 * The loose guess is checked AGAINST THE WHOLE PALETTE, not validated in
 * isolation — an earlier version of this just measured the guess's own
 * distance to actualHex and accepted it if "close enough", but that's too
 * permissive: Gray/01-Surface's DARK-mode hex (#171A26) is coincidentally
 * close to Gray/12's LIGHT-mode hex (#0F172A), since both are dark navy
 * tones in this system, so a wrong guess still passed. Comparing against
 * the single best match across all primitives instead — via
 * nearestPrimitive(), which already does exactly this search — catches it:
 * confirmed live, a "Gray/1" text layer whose actual colour was #0F172A
 * (an exact match for Gray/12) was wrongly resolving as Gray/01-Surface,
 * producing Content/content-on-solid (near-invisible on a light
 * background) instead of Content/content-primary.
 */
/**
 * Explicit "Light" prefix strip, independent of the "/"-based tail search
 * above — per direct request, as a defensive fallback in case the raw
 * name doesn't split cleanly on "/" the way "Light/Gray/09" does (a
 * different separator, extra whitespace, a nested path like "Light/
 * Colors/Gray/09" where the immediate tail isn't the primitive itself,
 * etc). Strips ANY leading "Light" — with or without a following
 * separator — and tries the remainder both as-is and via its own
 * "/"-tail search.
 */
function stripLightPrefix(name) {
  if (!name) return null;
  const m = /^Light[\s/\-_]*(.+)$/i.exec(name.trim());
  return m ? m[1].trim() : null;
}

function normalisePrim(name, actualHex) {
  if (!name) return null;
  if (PRIMITIVE_NAME_ALIAS[name] !== undefined) return PRIMITIVE_NAME_ALIAS[name];
  if (HEX_LIGHT[name] !== undefined) return name;
  const parts = name.split("/");
  for (let i = 1; i < parts.length; i++) {
    const tail = parts.slice(i).join("/");
    if (HEX_LIGHT[tail] !== undefined) return tail;
  }
  const afterLight = stripLightPrefix(name);
  if (afterLight) {
    if (HEX_LIGHT[afterLight] !== undefined) return afterLight;
    const lightParts = afterLight.split("/");
    for (let i = 0; i < lightParts.length; i++) {
      const tail = lightParts.slice(i).join("/");
      if (HEX_LIGHT[tail] !== undefined) return tail;
    }
  }
  let loose = null;
  for (let i = 1; i < parts.length && !loose; i++) {
    loose = PRIM_CANON[parts.slice(i).join("/").toLowerCase()] || null;
  }
  if (!loose) loose = PRIM_CANON[name.toLowerCase()] || null;
  if (!loose && afterLight) loose = PRIM_CANON[afterLight.toLowerCase()] || null;
  if (!loose) return name;
  if (actualHex) {
    const best = nearestPrimitive(actualHex);
    if (best) return best;   // the real colour explains itself better than the name guess
  }
  return loose;
}

function buildHexIndex() {
  const idx = {};
  for (const h in HEX_ALIAS) idx[h] = HEX_ALIAS[h];
  for (const n in HEX_LIGHT) if (!idx[HEX_LIGHT[n]]) idx[HEX_LIGHT[n]] = n;
  for (const n in HEX_DARK)  if (!idx[HEX_DARK[n]])  idx[HEX_DARK[n]]  = n;
  return idx;
}

/** Euclidean RGB distance between two "#RRGGBB" strings. */
function hexDistance(a, b) {
  const ai = parseInt(a.slice(1), 16), bi = parseInt(b.slice(1), 16);
  const ar = (ai >> 16) & 255, ag = (ai >> 8) & 255, ab = ai & 255;
  const br = (bi >> 16) & 255, bg = (bi >> 8) & 255, bb = bi & 255;
  return Math.sqrt((ar - br) ** 2 + (ag - bg) ** 2 + (ab - bb) ** 2);
}

/**
 * The nearest known primitive to a raw hex, checked against both the Light
 * and Dark palettes (a hardcoded value could be a copy-paste of either),
 * or null if nothing is within NEAREST_MATCH_MAX_DISTANCE. Last resort —
 * only tried after exact hex/name matching has already failed.
 */
function nearestPrimitive(hexColor) {
  let best = null, bestDist = Infinity;
  for (const n in HEX_LIGHT) {
    const d = hexDistance(hexColor, HEX_LIGHT[n]);
    if (d < bestDist) { bestDist = d; best = n; }
  }
  for (const n in HEX_DARK) {
    const d = hexDistance(hexColor, HEX_DARK[n]);
    if (d < bestDist) { bestDist = d; best = n; }
  }
  return bestDist <= NEAREST_MATCH_MAX_DISTANCE ? best : null;
}

/**
 * Best-guess semantic token for a colour that couldn't be resolved any
 * other way — scoped to the SAME token group the layer's context already
 * calls for (Surface stays Surface, Content stays Content, Border stays
 * Border; never cross-group, per explicit request). Only considers tokens
 * actually present in semVars (real variables in this file/library, not
 * just names known to the rule tables), and only within
 * NEAREST_MATCH_MAX_DISTANCE — same cutoff as nearestPrimitive(), so a
 * colour that isn't genuinely close to anything gets no suggestion at all
 * rather than a confident-looking wrong one. This is a SUGGESTION only:
 * callers pre-fill the token picker with it, but nothing is bound until
 * the user clicks Map — never auto-applied.
 *
 * Two guardrails, both confirmed needed live:
 *
 * 1. Exception tokens (SUGGESTION_EXCLUDED_SEMANTICS) never enter the
 *    candidate pool. content-on-solid / content-absolute-white/black /
 *    surface-absolute exist for one specific case — text or an icon
 *    sitting on a strong colour background — never as a generic "closest
 *    colour" guess. A plain icon on the default page background isn't
 *    that case just because its colour happens to be numerically close.
 * 2. Each candidate is checked against ONE hex, not "whichever of
 *    light/dark is closer". content-on-solid's own primitive
 *    (Gray/01-Surface) is #FFFFFF in light mode but #171A26 (near-black)
 *    in dark mode — checking both meant a near-black icon colour
 *    (#200E32) could "match" a token that actually means solid white,
 *    via a mode the token doesn't even display in for this comparison.
 *    Every other nearest-match in this codebase (nearestPrimitive included)
 *    has the same latent risk, but here it's the primary ranking signal
 *    rather than a narrow last-resort disambiguator, so it bit first.
 */
const SUGGESTION_EXCLUDED_SEMANTICS = {
  "Content/content-on-solid": 1,
  "Content/content-absolute-white": 1,
  "Content/content-absolute-black": 1,
  "Surface/surface-absolute": 1,
};
function nearestSemanticInGroup(hexColor, group, semVars) {
  if (!group) return null;
  let best = null, bestDist = Infinity;
  for (const name in semVars) {
    if (name.split("/")[0] !== group) continue;
    if (SUGGESTION_EXCLUDED_SEMANTICS[name]) continue;
    const prim = SEMANTICS[name];
    if (!prim) continue;
    const lHex = HEX_LIGHT[prim];
    if (!lHex) continue;
    const d = hexDistance(hexColor, lHex);
    if (d < bestDist) { bestDist = d; best = name; }
  }
  return bestDist <= NEAREST_MATCH_MAX_DISTANCE ? best : null;
}
function buildGroupIndex() {
  const g = {};
  for (const sem in SEMANTICS) {
    const prim = SEMANTICS[sem];
    if (!prim) continue;
    const key = sem.split("/")[0] + "|" + prim;
    (g[key] = g[key] || []).push(sem);
  }
  for (const k in g) {
    g[k].sort((a, b) => {
      const s = n => (n.indexOf("-solid") > -1 ? 4 : 0) +
                     (n.indexOf("-subtle") > -1 ? 3 : 0) +
                     (n.indexOf("secondary") > -1 ? 2 : 0) +
                     (n.indexOf("tertiary") > -1 ? 2 : 0) + n.length * 0.01;
      return s(a) - s(b);
    });
  }
  return g;
}

/** Resolve every bound variable id we saw — works for local AND library vars. */
async function resolveVarNames(ids) {
  const out = {};
  for (const id of ids) {
    try {
      const v = await figma.variables.getVariableByIdAsync(id);
      if (!v) continue;
      let colName = null;
      try {
        const c = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
        colName = c ? c.name : null;
      } catch (e) {}
      out[id] = { name: v.name, collection: colName };
    } catch (e) {}
  }
  return out;
}

/**
 * Resolve every legacy Style id we saw, into the SAME shape as
 * resolveVarNames (name + collection), so downstream code can treat a
 * Style-bound colour exactly like a Variable-bound one via boundNameFor().
 * Styles have no collection, so `collection` is always null — meaning a
 * Style can never match the "already semantic" SEM_COLLECTION check, which
 * is correct: these are the OLD system, not the semantic token library.
 */
async function resolveStyleNames(ids) {
  const out = {};
  for (const id of ids) {
    try {
      const s = await figma.getStyleByIdAsync(id);
      if (!s) continue;
      out[id] = { name: s.name, collection: null };
    } catch (e) {}
  }
  return out;
}

/**
 * Semantic variables available to this file — checked locally first, then
 * in any team library enabled here.
 *
 * getLocalVariablesAsync() only ever returns variables OWNED by the current
 * file. A file that merely CONSUMES the published XUI library — the more
 * common case; most product files subscribe to a shared design system
 * rather than duplicating it — has no local "Colors-Semantics" collection
 * at all, so the plugin always reported "No Colors-Semantics variables in
 * this file" there, even with the library properly linked. Library
 * variables have to be explicitly imported by key
 * (figma.variables.importVariableByKeyAsync) before they're usable for
 * binding — that's what the fallback below does, once per name, caching
 * the imported Variable exactly like a local one from here on.
 */
/**
 * `seen`, if passed, gets filled with a human-readable list of whatever
 * library variable collections the API actually returned — even when none
 * of them match — purely so a failing caller can report something more
 * useful than "not found". Left undefined by callers that don't need it
 * (e.g. bindSignature).
 */
async function collectSemanticVars(seen) {
  const byName = {};
  const local = await figma.variables.getLocalVariablesAsync();
  const cols  = await figma.variables.getLocalVariableCollectionsAsync();
  const S = cols.find(c => c.name === SEM_COLLECTION);
  if (S) for (const v of local) if (v.variableCollectionId === S.id) byName[v.name] = v;
  if (Object.keys(byName).length) return byName;

  // Wrapped as one block, including the `figma.teamLibrary` property access
  // itself: without the "teamlibrary" permission in manifest.json, simply
  // reading that property throws synchronously (not just calling its
  // methods) — confirmed live, this surfaced as a raw, confusing internal
  // Figma error instead of falling through cleanly to the message below.
  try {
    if (!figma.teamLibrary) return byName;
    const libCols = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    if (seen) {
      for (const c of libCols) {
        seen.push((c.libraryName ? c.libraryName + " / " : "") + c.name);
      }
    }
    const libMatch = libCols.find(c => c.name === SEM_COLLECTION);
    if (!libMatch) return byName;

    const libVars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(libMatch.key);
    for (const lv of libVars) {
      try {
        const imported = await figma.variables.importVariableByKeyAsync(lv.key);
        if (imported) byName[imported.name] = imported;
      } catch (e) {}
    }
  } catch (e) {
    return byName;
  }
  return byName;
}

async function scan(nodes) {
  const raw = [];
  const varIds = {};
  const styleIds = {};
  const mixed = [];
  for (const root of nodes) {
    walk(root, (n, hidden) => {
      for (const prop of ["fills", "strokes"]) {
        if (!(prop in n)) continue;
        if (!Array.isArray(n[prop])) {
          // figma.mixed — a text layer with more than one colour across its
          // characters (or a mixed multi-node read). firstSolid() requires
          // an array and would silently return null for this, dropping the
          // layer from `raw` entirely: not converted, not flagged, no trace
          // anywhere. Confirmed live: several text layers ("Total",
          // "$25,800", "Salaries and Employee Wages:") were invisible to
          // every report for exactly this reason. Surfaced explicitly
          // instead, since there's no single colour here to offer a "Map"
          // dropdown for — this needs a human to look at the layer itself.
          mixed.push({ node: n, prop: prop, hidden: hidden });
          continue;
        }
        const solid = firstSolid(n[prop]);
        if (!solid) continue;
        const bv = n.boundVariables && n.boundVariables[prop];
        if (bv && bv.length && bv[0].type === "VARIABLE_ALIAS") {
          varIds[bv[0].id] = 1;
          raw.push({ node: n, prop: prop, varId: bv[0].id, hex: hex(solid.color), hidden: hidden });
          continue;
        }
        // No Variable binding — check the separate legacy Style system
        // (fillStyleId/strokeStyleId) before giving up and treating this as
        // an unnamed raw colour. Namespaced so it shares the `resolved` map
        // with variable ids without ever colliding with one.
        const styleId = n[prop === "fills" ? "fillStyleId" : "strokeStyleId"];
        if (styleId && typeof styleId === "string" && styleId.length) {
          const key = "style:" + styleId;
          styleIds[styleId] = 1;
          raw.push({ node: n, prop: prop, varId: key, hex: hex(solid.color), hidden: hidden });
        } else {
          raw.push({ node: n, prop: prop, varId: null, hex: hex(solid.color), hidden: hidden });
        }
      }
    });
  }
  const resolved = await resolveVarNames(Object.keys(varIds));
  const styleNames = await resolveStyleNames(Object.keys(styleIds));
  for (const id in styleNames) resolved["style:" + id] = styleNames[id];
  return { raw: raw, resolved: resolved, mixed: mixed };
}

/**
 * The primitive behind one solid paint, resolved the same way the main
 * loop does (bound variable name, tail-stripped/Light-stripped, then raw
 * hex, then nearest-match for Surface contexts) — factored out so
 * resolveMixedTextFill() can apply the identical logic per text segment
 * without duplicating it by hand.
 */
async function primitiveForPaint(solid, node, prop, resolved, HEX_INDEX) {
  const bv = solid.boundVariables && solid.boundVariables.color;
  if (bv && bv.type === "VARIABLE_ALIAS") {
    let info = resolved[bv.id];
    if (!info) {
      // Segment-level variable ids aren't collected by the main scan pass
      // (only node-level boundVariables are) — resolve on demand here.
      try {
        const v = await figma.variables.getVariableByIdAsync(bv.id);
        if (v) {
          let colName = null;
          try {
            const c = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
            colName = c ? c.name : null;
          } catch (e) {}
          info = { name: v.name, collection: colName };
          resolved[bv.id] = info;
        }
      } catch (e) {}
    }
    if (info) {
      if (info.collection === SEM_COLLECTION || SEMANTICS[info.name] !== undefined) {
        return { alreadySemantic: info.name };
      }
      const rawHexForVar = hex(solid.color);
      let namedPrim = normalisePrim(info.name, rawHexForVar);
      // Same exact-hex fallback as the main loop: a name-based miss just
      // echoes the original (unrecognised) name back, which would
      // otherwise skip the exact-hex check entirely.
      if (namedPrim && HEX_LIGHT[namedPrim] === undefined) {
        namedPrim = HEX_INDEX[rawHexForVar] || namedPrim;
      }
      return { primitive: namedPrim };
    }
  }
  const rawHex = hex(solid.color);
  let primitive = HEX_INDEX[rawHex] || null;
  if (!primitive && GROUP_FOR[prop + "|" + node.type] === "Surface") {
    primitive = nearestPrimitive(rawHex);
  }
  return { primitive: primitive };
}

/**
 * For a TEXT node with mixed (per-character) fills: resolve EACH distinct
 * segment independently to its own semantic token, then apply each token
 * to its own character range. If every segment happens to resolve to the
 * same token, that's just the simple case (one uniform application). If
 * segments genuinely differ — e.g. a "Label:" prefix in one colour and a
 * "$35,490" value in another — each gets its own correct token instead of
 * requiring the whole layer to be left for manual review.
 *
 * Each segment is resolved and applied independently — if one segment's
 * colour genuinely isn't recognisable, it's left untouched and the layer
 * is flagged (with partial: true) for manual review, but that no longer
 * blocks its siblings from being fixed. Confirmed live: "Incoming: $75,490"
 * stayed entirely raw — even its perfectly-resolvable "Incoming:" label —
 * because the green value was bound to "Absolute/Green-Dark", which isn't
 * a defined primitive; the all-or-nothing bail meant the whole layer was
 * skipped instead of just the one bad segment.
 *
 * Confirmed live twice before that: a "Total" text layer had two segments
 * bound to two different variables ("Gray/09" and "Light/Gray/09")
 * resolving to the identical token (Content/content-tertiary) — a harmless
 * authoring inconsistency, safe to flatten. An "Opening Balance: $35,490"
 * layer has a genuinely two-tone label/value pair that need two different
 * tokens.
 */
async function resolveMixedTextFill(node, prop, resolved, HEX_INDEX, GROUP_INDEX, overrides, semVars, getSem) {
  if (prop !== "fills" || node.type !== "TEXT" || typeof node.getStyledTextSegments !== "function") return null;
  let segments;
  try {
    segments = node.getStyledTextSegments(["fills", "fontName"]);
  } catch (e) {
    return null;
  }
  if (!segments || segments.length < 2) return null;

  // Resolve every segment independently. A segment that can't be resolved
  // (e.g. bound to a colour that isn't a recognised primitive at all, like
  // "Absolute/Green-Dark") must NOT block its siblings on the same text node
  // from being converted — confirmed live: "Incoming: $75,490" stayed
  // completely untouched (even its perfectly-resolvable "Incoming:" label)
  // because the green value segment's primitive wasn't recognised, while
  // "Outgoing: $40,490" — where both segments happened to resolve — worked
  // fine. Apply what CAN be applied; leave only the genuinely-unresolvable
  // segment(s) untouched and flag the layer for manual review.
  const resolvedSegments = [];
  let anyUnresolved = false;
  for (const seg of segments) {
    const paints = seg.fills;
    if (!Array.isArray(paints) || !paints.length) { anyUnresolved = true; continue; }
    const solid = firstSolid(paints);
    if (!solid) { anyUnresolved = true; continue; }

    const resolvedPrim = await primitiveForPaint(solid, node, prop, resolved, HEX_INDEX);
    let semantic;
    if (resolvedPrim.alreadySemantic) {
      semantic = resolvedPrim.alreadySemantic;
    } else {
      const primitive = resolvedPrim.primitive;
      if (!primitive || HEX_LIGHT[primitive] === undefined) { anyUnresolved = true; continue; }
      semantic = resolveSemanticForPrimitive(prop, node.type, primitive, overrides, GROUP_INDEX);
    }
    if (!semantic || !semVars[semantic]) { anyUnresolved = true; continue; }
    resolvedSegments.push({ start: seg.start, end: seg.end, fontName: seg.fontName, basePaint: solid, semantic: semantic });
  }
  if (!resolvedSegments.length) return null;

  try {
    const fontsLoaded = {};
    for (const rs of resolvedSegments) {
      const key = JSON.stringify(rs.fontName);
      if (!fontsLoaded[key]) { await figma.loadFontAsync(rs.fontName); fontsLoaded[key] = true; }
    }
    const distinctTokens = {};
    const applied = [];
    for (const rs of resolvedSegments) {
      const v = await getSem(rs.semantic);
      if (!v) { anyUnresolved = true; continue; }
      const newPaint = figma.variables.setBoundVariableForPaint(Object.assign({}, rs.basePaint), "color", v);
      node.setRangeFills(rs.start, rs.end, [newPaint]);
      distinctTokens[rs.semantic] = 1;
      applied.push(rs);
    }
    if (!applied.length) return null;
    return { tokens: Object.keys(distinctTokens), segments: applied.length, partial: anyUnresolved };
  } catch (e) {
    return null;
  }
}

/**
 * Rebinds node[prop][index]'s colour to `variable`, explicitly carrying the
 * paint's opacity over rather than assuming setBoundVariableForPaint
 * preserves it untouched. Pass `newOpacity` to set a specific value instead
 * of preserving the original (used by the OPACITY_TINT_REDIRECT rule,
 * which resets to full opacity since the secondary token it redirects to
 * already IS the pale colour — no transparency trick needed anymore).
 *
 * Confirmed live: a nav item's selected-state highlight was a pale tint —
 * Surface/surface-brand-primary's base colour at 10% paint opacity, giving
 * a soft lavender wash — and after conversion it rendered as a bold,
 * full-strength solid blue block instead, with the opacity row no longer
 * shown in Figma's Fill panel at all. Setting it back explicitly closes
 * off that failure mode regardless of which layer it happens on.
 */
function rebindPaintColor(node, prop, index, variable, newOpacity) {
  const paints = node[prop].map(function (p) { return Object.assign({}, p); });
  const originalOpacity = paints[index].opacity;
  paints[index] = figma.variables.setBoundVariableForPaint(paints[index], "color", variable);
  const finalOpacity = (typeof newOpacity === "number") ? newOpacity : originalOpacity;
  if (typeof finalOpacity === "number") paints[index].opacity = finalOpacity;
  node[prop] = paints;
  return paints;
}

async function applyTo(nodes, overrides) {
  const seenCollections = [];
  const semVars = await collectSemanticVars(seenCollections);
  if (!Object.keys(semVars).length) {
    const hint = seenCollections.length
      ? " The plugin CAN see library variable collections — just none named exactly \"" + SEM_COLLECTION + "\". Found: " +
        seenCollections.slice(0, 12).join(", ") + (seenCollections.length > 12 ? ", …" : "") + "."
      : " No library variable collections were visible to the plugin at all — this usually means no colour VARIABLE collection is published from XUI yet (only styles, or nothing), or the library needs re-enabling.";
    throw new Error('No "' + SEM_COLLECTION + '" variables found — not locally, and not in any team library enabled for this file.' + hint);
  }
  const HEX_INDEX = buildHexIndex();
  const GROUP_INDEX = buildGroupIndex();
  const scanned = await scan(nodes);
  const raw = scanned.raw, resolved = scanned.resolved;

  const cache = {};
  async function getSem(name) {
    if (!(name in cache)) {
      const v = semVars[name];
      cache[name] = v ? await figma.variables.getVariableByIdAsync(v.id) : null;
    }
    return cache[name];
  }

  let applied = 0, structural = 0, removed = 0, alreadySemantic = 0, preserved = 0, mixedResolved = 0;
  const unmapped = {};
  const unknown = {};
  // Layers that are hidden (the node itself, or any ancestor) get the exact
  // same shape of entry as unmapped/unknown, just kept in a separate bucket
  // so the "review this" lists aren't cluttered with colours the user can't
  // currently see on canvas — see the "Hidden layers" section in the UI.
  const hiddenUnmapped = {};
  const hiddenUnknown = {};
  const changes = [];

  // Mixed-fill text layers: try to resolve each segment independently
  // first — see resolveMixedTextFill() — and only report the ones that
  // genuinely need a human decision (some segment couldn't be resolved).
  // Hidden layers (the node itself, or any ancestor, toggled off in
  // Figma) still get resolved/applied normally when possible — no reason
  // to skip a clean auto-fix just because it's not currently visible —
  // but if it genuinely needs a human decision, it goes into a separate
  // "Hidden layers" bucket instead of cluttering the main review list
  // with something the user can't even see on canvas right now.
  const mixedList = [];
  const hiddenMixedList = [];
  for (const m of scanned.mixed) {
    const result = await resolveMixedTextFill(m.node, m.prop, resolved, HEX_INDEX, GROUP_INDEX, overrides, semVars, getSem);
    if (result) {
      mixedResolved++;
      if (changes.length < 50) {
        changes.push({
          layer: (m.node.name || "").slice(0, 24),
          from: "(mixed fill, " + result.segments + " segment" + (result.segments > 1 ? "s" : "") + (result.partial ? ", 1+ unresolved" : "") + ")",
          to: result.tokens.join(" + "),
        });
      }
      // A layer can be partially resolved: some segments got their token
      // applied, but at least one segment's colour wasn't a recognised
      // primitive at all and was left untouched — still worth flagging so
      // it isn't mistaken for fully done.
      if (result.partial) {
        const entry = { layer: (m.node.name || "").slice(0, 40), prop: m.prop, type: m.node.type, id: m.node.id, partial: true };
        (m.hidden ? hiddenMixedList : mixedList).push(entry);
      }
      continue;
    }
    const entry = { layer: (m.node.name || "").slice(0, 40), prop: m.prop, type: m.node.type, id: m.node.id };
    (m.hidden ? hiddenMixedList : mixedList).push(entry);
  }
  const alreadySemanticSample = [];
  const unresolvedVarSample = [];
  const strongBgSample = [];

  for (let i = 0; i < raw.length; i++) {
    const t = raw[i];

    // Preserved colours (e.g. SecondaryAccent) are never touched and never
    // reported — checked first so nothing below can override it.
    if (t.varId) {
      const nameHere = resolved[t.varId] && resolved[t.varId].name;
      if (isPreservedName(nameHere)) { preserved++; continue; }
    }

    // Protected artwork (crypto logos, exchange/wallet logos, flags) —
    // checked structurally, not by bound variable name, since this kind of
    // artwork is almost always raw unbound colour with nothing else to
    // match on. See PRESERVE_ARTWORK_NAME_PATTERNS in rules.js.
    if (isWithinPreservedArtwork(t.node)) { preserved++; continue; }

    // Remove-fill/stroke rule: this exact broken pair, nested inside a table
    // row, gets deleted rather than recoloured — see REMOVE_IN_TABLE_ROW in
    // rules.js. Requires BOTH fill and stroke to match at once (checked on
    // the node directly, not per-paint) and runs before everything else so
    // it also catches the case where it's already bound to these semantic
    // tokens directly.
    if ((t.prop === "fills" || t.prop === "strokes") &&
        matchesRemovePattern(t.node, resolved) && withinTableRow(t.node)) {
      t.node[t.prop] = [];
      removed++;
      if (changes.length < 50) {
        changes.push({ layer: (t.node.name || "").slice(0, 24), from: t.prop, to: "(removed)" });
      }
      continue;
    }

    // Structural rules win regardless of the underlying primitive, and even
    // override a layer that's already (wrongly) bound to a semantic token —
    // see rules.js for what each one is fixing and why.
    const role = tableRole(t.node);
    let forced = (role === "header" && t.prop === "fills") ? TABLE_HEADER_SEMANTIC
               : (role === "row" && t.prop === "strokes") ? TABLE_BORDER_SEMANTIC
               : null;
    if (!forced && t.prop === "fills" &&
        (t.node.type === "TEXT" || t.node.type === "VECTOR" || t.node.type === "BOOLEAN_OPERATION")) {
      // Diagnostic: for a layer whose OWN colour is already dark (a
      // plausible false-negative case — dark content that maybe SHOULD
      // have been forced to white but wasn't), trace exactly what the
      // ancestor walk saw at each level. Capped so this stays cheap, but
      // generous — confirmed live: a table full of dark text cells
      // exhausted a cap of 15 before the scan ever reached the ONE
      // layer (an icon in a header, scanned much later) actually being
      // investigated, hiding it from the report entirely.
      const wantsTrace = t.hex && isVeryDark(t.hex) && strongBgSample.length < 100;
      const traceArr = wantsTrace ? [] : null;
      const strong = onStrongBackground(t.node, resolved, HEX_INDEX, traceArr);
      if (strong) {
        forced = TEXT_ON_STRONG_BG_SEMANTIC;
      } else if (traceArr) {
        strongBgSample.push({ layer: (t.node.name || "").slice(0, 30), prop: t.prop, type: t.node.type, hex: t.hex, id: t.node.id, trace: traceArr });
      }
    }
    if (!forced && t.prop === "fills" &&
        (t.node.type === "TEXT" || t.node.type === "VECTOR" || t.node.type === "BOOLEAN_OPERATION") &&
        t.varId) {
      const boundHere = resolved[t.varId];
      if (boundHere && boundHere.name === CONTENT_ON_SOLID &&
          !onStrongBackground(t.node, resolved, HEX_INDEX)) {
        forced = WRONGLY_ON_SOLID_FALLBACK;
      }
    }
    if (!forced && t.varId) {
      const boundInfo = resolved[t.varId];
      if (boundInfo) {
        const alias = lookupNameAlias(boundInfo.name);
        if (alias) forced = alias;
      }
    }
    if (forced && semVars[forced]) {
      const v = await getSem(forced);
      if (v) {
        rebindPaintColor(t.node, t.prop, 0, v);
        structural++;
        if (changes.length < 50) {
          changes.push({ layer: (t.node.name || "").slice(0, 24), from: "(structural rule)", to: forced });
        }
        continue;
      }
    }

    let primitive = null;

    if (t.varId) {
      const info = resolved[t.varId];
      if (info) {
        if (info.collection === SEM_COLLECTION || SEMANTICS[info.name] !== undefined) {
          alreadySemantic++;
          if (alreadySemanticSample.length < 30) {
            alreadySemanticSample.push({
              layer: (t.node.name || "").slice(0, 24),
              name: info.name, collection: info.collection,
              prop: t.prop, type: t.node.type, hex: t.hex,
            });
          }
          continue;
        }
        primitive = normalisePrim(info.name, t.hex);
        if (primitive && HEX_LIGHT[primitive] === undefined) {
          // normalisePrim couldn't identify a real primitive by name at all
          // — it just echoed the original (unrecognised) name back, which
          // is truthy and so silently skipped the exact-hex fallback below
          // (that check only runs `if (!primitive)`). Confirmed live: a
          // variable literally named "text/green1" (#0FBA83, an EXACT
          // match for Green/09(Base)) and "Primary/Blue" (#0052FE, exact
          // Blue/09(Base)) were both landing in "Unrecognised colour"
          // under their foreign names, even though their rendered colour
          // is an unambiguous match — just checked by name, hex never
          // even attempted for a bound-but-unrecognised variable. If the
          // exact hex doesn't match anything either, this leaves the
          // original name-echo in place (still an accurate, informative
          // "Unrecognised colour" label via `resolved[t.varId].name` below).
          primitive = HEX_INDEX[t.hex] || primitive;
        }
      } else if (unresolvedVarSample.length < 30) {
        // Bound to a variable id, but resolveVarNames couldn't resolve a
        // name for it at all (getVariableByIdAsync returned null/threw) —
        // a distinct failure mode from "already semantic": this falls
        // through to the raw-hex fallback below, silently, with no name
        // to report even if that also fails.
        unresolvedVarSample.push({
          layer: (t.node.name || "").slice(0, 24), prop: t.prop, type: t.node.type, hex: t.hex, id: t.node.id,
        });
      }
    }
    if (!primitive) primitive = HEX_INDEX[t.hex] || null;

    // Raw, unbound colour with no exact primitive match — for a Surface
    // context specifically (per explicit request), snap to the nearest
    // known primitive instead of giving up. Scoped to unbound colours only
    // (no varId at all): a NAMED foreign colour was presumably chosen on
    // purpose and stays in "Unrecognised colour" rather than being guessed.
    if (!primitive && !t.varId && GROUP_FOR[t.prop + "|" + t.node.type] === "Surface") {
      primitive = nearestPrimitive(t.hex);
    }

    if (!primitive || HEX_LIGHT[primitive] === undefined) {
      // Doesn't match any known primitive — surfaced as "Unrecognised colour"
      // instead of silently vanishing into a counter, so it can be checked
      // and mapped by hand rather than disappearing with no trace.
      const label = (t.varId && resolved[t.varId] && resolved[t.varId].name) || t.hex;
      const sig = t.prop + "|" + t.node.type + "|" + label;
      const saved = overrides && overrides[sig];
      if (saved && semVars[saved]) {
        const v = await getSem(saved);
        if (v) {
          rebindPaintColor(t.node, t.prop, 0, v);
          applied++;
          continue;
        }
      }
      const unknownTarget = t.hidden ? hiddenUnknown : unknown;
      const u = unknownTarget[sig] = unknownTarget[sig] || {
        sig: sig, count: 0, ids: [], hex: t.hex, primitive: label,
        prop: t.prop, type: t.node.type,
        suggested: nearestSemanticInGroup(t.hex, GROUP_FOR[t.prop + "|" + t.node.type], semVars),
      };
      u.count++;
      if (u.ids.length < 300) u.ids.push(t.node.id);
      continue;
    }

    // Opacity-tint redirect: a primary-tier Surface primitive at reduced
    // paint opacity is almost always a stand-in for the proper pale
    // secondary token — see OPACITY_TINT_REDIRECT in rules.js.
    if (t.prop === "fills" && OPACITY_TINT_REDIRECT[primitive] &&
        GROUP_FOR[t.prop + "|" + t.node.type] === "Surface") {
      const solid = firstSolid(t.node[t.prop]);
      const opacity = solid && typeof solid.opacity === "number" ? solid.opacity : 1;
      if (opacity < TINT_OPACITY_MAX) {
        const redirectSemantic = OPACITY_TINT_REDIRECT[primitive];
        if (semVars[redirectSemantic]) {
          const v = await getSem(redirectSemantic);
          if (v) {
            rebindPaintColor(t.node, t.prop, 0, v, 1);
            structural++;
            if (changes.length < 50) {
              changes.push({
                layer: (t.node.name || "").slice(0, 24),
                from: primitive + " @ " + Math.round(opacity * 100) + "%",
                to: redirectSemantic,
              });
            }
            continue;
          }
        }
      }
    }

    const sig = t.prop + "|" + t.node.type + "|" + primitive;
    let semantic = resolveSemanticForPrimitive(t.prop, t.node.type, primitive, overrides, GROUP_INDEX);

    if (!semantic || !semVars[semantic]) {
      const unmappedTarget = t.hidden ? hiddenUnmapped : unmapped;
      const u = unmappedTarget[sig] = unmappedTarget[sig] || {
        count: 0, ids: [], hex: t.hex, primitive: primitive,
        prop: t.prop, type: t.node.type,
        suggested: nearestSemanticInGroup(t.hex, GROUP_FOR[t.prop + "|" + t.node.type], semVars),
      };
      u.count++;
      if (u.ids.length < 300) u.ids.push(t.node.id);
      continue;
    }

    const v = await getSem(semantic);
    if (!v) continue;
    rebindPaintColor(t.node, t.prop, 0, v);
    applied++;
    if (changes.length < 50) {
      changes.push({ layer: (t.node.name || "").slice(0, 24), from: primitive, to: semantic });
    }
  }

  const byCount = function (a, b) { return b.count - a.count; };
  function toUnmappedList(dict) {
    return Object.keys(dict).map(function (sig) {
      const u = dict[sig];
      return {
        sig: sig,
        prop: u.prop,
        type: u.type,
        primitive: u.primitive,
        hex: u.hex,
        count: u.count,
        ids: u.ids,
        suggested: u.suggested,
      };
    }).sort(byCount);
  }
  function toUnknownList(dict) {
    return Object.keys(dict).map(function (sig) { return dict[sig]; }).sort(byCount);
  }
  const unmappedList = toUnmappedList(unmapped);
  const unknownList = toUnknownList(unknown);
  // Same entry shape either way, so the UI can render both kinds with the
  // same picker-card component — just kept in one combined list, separate
  // from the visible unmapped/unknown lists above.
  const hiddenList = toUnmappedList(hiddenUnmapped).concat(toUnknownList(hiddenUnknown)).sort(byCount);

  // Cross-reference: a layer traced in strongBgSample (dark content that
  // stayed dark) might ALSO be sitting unmapped — the strong-bg check and
  // the normal primitive/rule resolution run independently, so neither
  // list knows about the other on its own. Tag each trace entry that
  // genuinely needs a token picked, so the UI can jump straight to its
  // card instead of just explaining the colour with nothing to act on.
  const mapIndexById = {};
  unmappedList.concat(unknownList).forEach(function (u) {
    u.ids.forEach(function (id) { mapIndexById[id] = { sig: u.sig, where: "tomap" }; });
  });
  hiddenList.forEach(function (u) {
    u.ids.forEach(function (id) { if (!mapIndexById[id]) mapIndexById[id] = { sig: u.sig, where: "hidden" }; });
  });
  strongBgSample.forEach(function (s) {
    const hit = s.id && mapIndexById[s.id];
    if (hit) { s.needsMapSig = hit.sig; s.needsMapWhere = hit.where; }
  });

  const tokens = await tokenPalette(Object.keys(semVars).sort(), semVars);

  return {
    applied: applied,
    structural: structural,
    removed: removed,
    alreadySemantic: alreadySemantic,
    preserved: preserved,
    mixedResolved: mixedResolved,
    unmapped: unmappedList,
    unknown: unknownList,
    tokens: tokens,
    changes: changes,
    alreadySemanticSample: alreadySemanticSample,
    unresolvedVarSample: unresolvedVarSample,
    strongBgSample: strongBgSample,
    mixedFills: mixedList,
    hidden: hiddenList,
    hiddenMixedFills: hiddenMixedList,
  };
}

/**
 * Best-effort mode-name -> id lookup for a variable's own collection, so we
 * know which valuesByMode entry is "Light" vs "Dark" without hardcoding
 * ids (every file's mode ids are its own). Falls back to positional
 * (first/second mode) if neither name matches — still better than nothing.
 */
async function lightDarkModeIds(collectionId) {
  try {
    const col = await figma.variables.getVariableCollectionByIdAsync(collectionId);
    if (!col || !col.modes || !col.modes.length) return { light: null, dark: null };
    const light = col.modes.find(m => /light/i.test(m.name));
    const dark = col.modes.find(m => /dark/i.test(m.name));
    return {
      light: light ? light.modeId : (col.modes[0] ? col.modes[0].modeId : null),
      dark: dark ? dark.modeId : (col.modes[1] ? col.modes[1].modeId : null),
    };
  } catch (e) {
    return { light: null, dark: null };
  }
}

/**
 * One mode's raw value off a Variable — tries the collection's real Light/
 * Dark mode id first, but if that collection can't be resolved at all,
 * returns positionally instead of by name. Confirmed live: this is
 * exactly what happens for an alias TARGET (a primitive variable) that was
 * never itself explicitly imported into the file — only the top-level
 * semantic variables go through collectSemanticVars()'s
 * importVariableByKeyAsync, so a primitive reached only by following an
 * alias may not have a locally resolvable collection, even though
 * `getVariableByIdAsync` still returns its raw valuesByMode. Falling back
 * to "first key" for BOTH light and dark (the old behaviour) collapsed
 * them onto the same value; this instead keeps them distinct — light gets
 * the first key, dark the second — whenever the variable genuinely has
 * two or more.
 */
async function resolveModeValue(v, wantLight) {
  if (!v || !v.valuesByMode) return undefined;
  const modes = await lightDarkModeIds(v.variableCollectionId);
  const modeId = wantLight ? modes.light : modes.dark;
  let val = modeId != null ? v.valuesByMode[modeId] : undefined;
  if (val === undefined) {
    const keys = Object.keys(v.valuesByMode).sort();
    if (keys.length) {
      const idx = keys.length > 1 && !wantLight ? 1 : 0;
      val = v.valuesByMode[keys[idx]];
    }
  }
  return val;
}

/**
 * Resolves a semantic Variable's actual bound colour for the light or dark
 * side, following exactly one alias hop (semantic -> primitive is always a
 * single hop in this system; a value that's itself still an alias after
 * that isn't chased further, to keep this bounded and simple). Confirmed
 * live: "Border/border-success"'s swatch showed one flat colour instead
 * of a light/dark split — see resolveModeValue() for why, and how the
 * positional fallback fixes it regardless of the exact API quirk involved.
 */
async function resolveVariableHex(v, wantLight) {
  const val = await resolveModeValue(v, wantLight);
  if (val === undefined) return null;
  if (val && val.type === "VARIABLE_ALIAS") {
    try {
      const alias = await figma.variables.getVariableByIdAsync(val.id);
      if (!alias) return null;
      const aliasVal = await resolveModeValue(alias, wantLight);
      if (!aliasVal || aliasVal.type === "VARIABLE_ALIAS" || typeof aliasVal.r !== "number") return null;
      return hex(aliasVal);
    } catch (e) {
      return null;
    }
  }
  return typeof val.r === "number" ? hex(val) : null;
}

/**
 * Token names paired with their Light/Dark hex, so the picker can show a
 * swatch. Prefers the hardcoded SEMANTICS -> primitive -> HEX_LIGHT/DARK
 * table (fast, no extra Figma calls) but falls back to resolving the REAL
 * bound variable's actual colour when a token isn't catalogued there at
 * all — confirmed live: "Border/border-success" is a genuine token in the
 * file that was never added to SEMANTICS, so its picker swatch fell back
 * to a flat placeholder grey instead of its real green. This keeps the
 * swatch accurate for any real token, catalogued or not, instead of
 * needing every one added to the table by hand.
 */
async function tokenPalette(names, semVars) {
  const out = [];
  for (const n of names) {
    const prim = SEMANTICS[n];
    let light = (prim && HEX_LIGHT[prim]) || null;
    let dark = (prim && HEX_DARK[prim]) || null;
    if ((!light || !dark) && semVars && semVars[n]) {
      const v = semVars[n];
      if (!light) light = await resolveVariableHex(v, true);
      if (!dark) dark = await resolveVariableHex(v, false);
    }
    out.push({ name: n, light: light, dark: dark });
  }
  return out;
}

async function bindSignature(sig, semanticName, ids) {
  const semVars = await collectSemanticVars();
  const target = semVars[semanticName];
  if (!target) throw new Error("Token not found: " + semanticName);
  const v = await figma.variables.getVariableByIdAsync(target.id);
  const prop = sig.split("|")[0];
  let n = 0;
  for (let i = 0; i < ids.length; i++) {
    const node = await figma.getNodeByIdAsync(ids[i]);
    if (!node || !(prop in node)) continue;
    const paints = node[prop];
    if (!Array.isArray(paints) || !paints.length) continue;
    rebindPaintColor(node, prop, 0, v);
    n++;
  }
  const saved = (await figma.clientStorage.getAsync(OVERRIDE_KEY)) || {};
  saved[sig] = semanticName;
  await figma.clientStorage.setAsync(OVERRIDE_KEY, saved);
  return n;
}

figma.ui.onmessage = async function (msg) {
  try {
    if (msg.type === "check") {
      figma.ui.postMessage({ type: "selection", count: figma.currentPage.selection.length });
      return;
    }

    if (msg.type === "apply") {
      const sel = figma.currentPage.selection;
      if (!sel.length) {
        figma.ui.postMessage({ type: "error", message: "Select one or more frames first." });
        return;
      }
      const overrides = (await figma.clientStorage.getAsync(OVERRIDE_KEY)) || {};
      const r = await applyTo(sel, overrides);
      figma.ui.postMessage(Object.assign({ type: "done" }, r));
      figma.notify("Applied semantics to " + (r.applied + r.structural + r.removed + r.mixedResolved) + " layers");
      return;
    }

    if (msg.type === "highlight") {
      const nodes = [];
      for (let i = 0; i < Math.min(msg.ids.length, 200); i++) {
        const n = await figma.getNodeByIdAsync(msg.ids[i]);
        if (n) nodes.push(n);
      }
      if (nodes.length) {
        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);
        figma.notify(nodes.length + " layer(s) selected");
      }
      return;
    }

    if (msg.type === "bind") {
      const n = await bindSignature(msg.sig, msg.token, msg.ids);
      figma.ui.postMessage({ type: "bound", sig: msg.sig, count: n });
      figma.notify("Mapped " + n + " layer(s)");
      return;
    }

    if (msg.type === "clearOverrides") {
      await figma.clientStorage.deleteAsync(OVERRIDE_KEY);
      figma.notify("Saved mappings cleared");
      return;
    }

    if (msg.type === "resize") {
      const w = Math.max(320, Math.min(480, msg.width || 380));
      const h = Math.max(160, Math.min(640, msg.height || 230));
      figma.ui.resize(w, h);
      return;
    }
  } catch (e) {
    figma.ui.postMessage({ type: "error", message: String(e.message || e) });
  }
};

figma.on("selectionchange", function () {
  figma.ui.postMessage({ type: "selection", count: figma.currentPage.selection.length });
});
