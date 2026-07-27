
/* ========================================================================
   XUI Apply Semantics — main
   ======================================================================== */

const PRIM_COLLECTION = "Colors-Primitives";
const SEM_COLLECTION  = "Colors-Semantics";
const OVERRIDE_KEY    = "xui-apply-overrides-v1";

figma.showUI(__html__, { width: 380, height: 580 });

function hex(c) {
  const h = x => Math.round(x * 255).toString(16).padStart(2, "0");
  return ("#" + h(c.r) + h(c.g) + h(c.b)).toUpperCase();
}
function firstSolid(paints) {
  if (!Array.isArray(paints) || !paints.length) return null;
  return paints.find(p => p.type === "SOLID" && p.visible !== false) || null;
}
function walk(root, fn) {
  const stack = [root];
  while (stack.length) {
    const n = stack.pop();
    fn(n);
    if ("children" in n) for (const c of n.children) stack.push(c);
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
function ownFillIsStrongBg(node, resolved, HEX_INDEX) {
  if (!node || !("fills" in node)) return false;
  const solid = firstSolid(node.fills);
  if (!solid) return false;
  const name = boundNameFor(node, "fills", resolved);
  if (name) {
    if (STRONG_BG_SEMANTICS[name]) return true;
    const prim = normalisePrim(name, hex(solid.color));
    return !!(prim && STRONG_BG_PRIMITIVES[prim]);
  }
  const prim = HEX_INDEX[hex(solid.color)];
  return !!(prim && STRONG_BG_PRIMITIVES[prim]);
}

/**
 * True if `node` (text or an icon glyph) sits directly on, or a couple of
 * wrapper frames inside, a strong brand/status background — see
 * STRONG_BG_PRIMITIVES / STRONG_BG_SEMANTICS in rules.js for why this needs
 * to force an absolute token.
 */
function onStrongBackground(node, resolved, HEX_INDEX) {
  let n = node.parent, depth = 0;
  while (n && depth < 3) {
    if (ownFillIsStrongBg(n, resolved, HEX_INDEX)) return true;
    n = n.parent;
    depth++;
  }
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
function normalisePrim(name, actualHex) {
  if (!name) return null;
  if (HEX_LIGHT[name] !== undefined) return name;
  const parts = name.split("/");
  for (let i = 1; i < parts.length; i++) {
    const tail = parts.slice(i).join("/");
    if (HEX_LIGHT[tail] !== undefined) return tail;
  }
  let loose = null;
  for (let i = 1; i < parts.length && !loose; i++) {
    loose = PRIM_CANON[parts.slice(i).join("/").toLowerCase()] || null;
  }
  if (!loose) loose = PRIM_CANON[name.toLowerCase()] || null;
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
  for (const root of nodes) {
    walk(root, n => {
      for (const prop of ["fills", "strokes"]) {
        if (!(prop in n)) continue;
        const solid = firstSolid(n[prop]);
        if (!solid) continue;
        const bv = n.boundVariables && n.boundVariables[prop];
        if (bv && bv.length && bv[0].type === "VARIABLE_ALIAS") {
          varIds[bv[0].id] = 1;
          raw.push({ node: n, prop: prop, varId: bv[0].id, hex: hex(solid.color) });
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
          raw.push({ node: n, prop: prop, varId: key, hex: hex(solid.color) });
        } else {
          raw.push({ node: n, prop: prop, varId: null, hex: hex(solid.color) });
        }
      }
    });
  }
  const resolved = await resolveVarNames(Object.keys(varIds));
  const styleNames = await resolveStyleNames(Object.keys(styleIds));
  for (const id in styleNames) resolved["style:" + id] = styleNames[id];
  return { raw: raw, resolved: resolved };
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

  let applied = 0, structural = 0, removed = 0, alreadySemantic = 0, preserved = 0;
  const unmapped = {};
  const unknown = {};
  const changes = [];
  const alreadySemanticSample = [];
  const unresolvedVarSample = [];

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
        (t.node.type === "TEXT" || t.node.type === "VECTOR" || t.node.type === "BOOLEAN_OPERATION") &&
        onStrongBackground(t.node, resolved, HEX_INDEX)) {
      forced = TEXT_ON_STRONG_BG_SEMANTIC;
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
      if (boundInfo && NAME_ALIAS[boundInfo.name]) forced = NAME_ALIAS[boundInfo.name];
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
      const u = unknown[sig] = unknown[sig] || {
        sig: sig, count: 0, ids: [], hex: t.hex, primitive: label,
        prop: t.prop, type: t.node.type,
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
    let semantic = (overrides && overrides[sig]) || RULES[sig];

    if (!semantic) {
      // primitives with no token of their own stand in for the nearest step
      const lookup = PRIM_ALIAS[primitive] || primitive;
      const grp = GROUP_FOR[t.prop + "|" + t.node.type];
      if (grp) {
        const c = GROUP_INDEX[grp + "|" + lookup];
        if (c && c.length) semantic = c[0];
      }
      if (!semantic) {
        const order = ["Surface", "Content", "Border", "Label"];
        for (let g = 0; g < order.length; g++) {
          const c = GROUP_INDEX[order[g] + "|" + lookup];
          if (c && c.length) { semantic = c[0]; break; }
        }
      }
    }

    if (!semantic || !semVars[semantic]) {
      const u = unmapped[sig] = unmapped[sig] || {
        count: 0, ids: [], hex: t.hex, primitive: primitive,
        prop: t.prop, type: t.node.type,
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
  const unmappedList = Object.keys(unmapped).map(function (sig) {
    const u = unmapped[sig];
    return {
      sig: sig,
      prop: u.prop,
      type: u.type,
      primitive: u.primitive,
      hex: u.hex,
      count: u.count,
      ids: u.ids,
    };
  }).sort(byCount);
  const unknownList = Object.keys(unknown).map(function (sig) {
    return unknown[sig];
  }).sort(byCount);

  return {
    applied: applied,
    structural: structural,
    removed: removed,
    alreadySemantic: alreadySemantic,
    preserved: preserved,
    unmapped: unmappedList,
    unknown: unknownList,
    tokens: tokenPalette(Object.keys(semVars).sort()),
    changes: changes,
    alreadySemanticSample: alreadySemanticSample,
    unresolvedVarSample: unresolvedVarSample,
  };
}

/** Token names paired with their Light/Dark hex, so the picker can show a swatch. */
function tokenPalette(names) {
  return names.map(function (n) {
    const prim = SEMANTICS[n];
    return {
      name: n,
      light: (prim && HEX_LIGHT[prim]) || null,
      dark: (prim && HEX_DARK[prim]) || null,
    };
  });
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
      figma.notify("Applied semantics to " + (r.applied + r.structural + r.removed) + " layers");
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
  } catch (e) {
    figma.ui.postMessage({ type: "error", message: String(e.message || e) });
  }
};

figma.on("selectionchange", function () {
  figma.ui.postMessage({ type: "selection", count: figma.currentPage.selection.length });
});
