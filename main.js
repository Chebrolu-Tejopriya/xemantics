
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
      // ancestor walk saw at each level. Capped so this stays cheap.
      const wantsTrace = t.hex && isVeryDark(t.hex) && strongBgSample.length < 15;
      const traceArr = wantsTrace ? [] : null;
      const strong = onStrongBackground(t.node, resolved, HEX_INDEX, traceArr);
      if (strong) {
        forced = TEXT_ON_STRONG_BG_SEMANTIC;
      } else if (traceArr) {
        strongBgSample.push({ layer: (t.node.name || "").slice(0, 30), prop: t.prop, type: t.node.type, hex: t.hex, trace: traceArr });
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
          layer: (t.node.name || "").slice(0, 24), prop: t.prop, type: t.node.type, hex: t.hex,
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
