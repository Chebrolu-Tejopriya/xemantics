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
  "fills|TEXT|Gray/01-Surface": "Content/content-on-solid",
  "fills|TEXT|Absolute/White": "Content/content-absolute-white",
  "fills|TEXT|Absolute/Black": "Content/content-absolute-black",
  "fills|TEXT|Blue/09(Base)": "Content/content-brand-primary",
  "fills|TEXT|Blue/10": "Content/content-brand-primary",   // Blue/10 has no Content token of its own; without this the group fallback grabs Surface/surface-brand-solid instead
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
  "strokes|INSTANCE|Gray/01-Surface": "Border/border-pure",
  "strokes|INSTANCE|Gray/04": "Border/border-tertiary",
  "strokes|INSTANCE|Gray/05": "Border/border-secondary",
  "strokes|INSTANCE|Gray/07": "Border/border-primary",
  "strokes|INSTANCE|Blue/09(Base)": "Border/border-brand",
  "strokes|INSTANCE|Red/09(Base)": "Border/border-error",
  "strokes|INSTANCE|Orange/09(Base)": "Border/border-warning",
  "strokes|RECTANGLE|Gray/07": "Border/border-primary",
  "strokes|LINE|Gray/05": "Border/border-secondary",
  "strokes|LINE|Gray/07": "Border/border-primary",

  // ---- icons / vectors
  "fills|VECTOR|Gray/12": "Content/content-primary",
  "fills|VECTOR|Gray/10": "Content/content-secondary",
  "fills|VECTOR|Gray/09": "Content/content-tertiary",
  "fills|VECTOR|Gray/08": "Content/content-quaternary",
  "fills|VECTOR|Gray/07": "Border/border-primary",
  "fills|VECTOR|Gray/05": "Border/border-secondary",
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
  "fills|VECTOR|Gray/06": "Border/border-primary",
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
