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
