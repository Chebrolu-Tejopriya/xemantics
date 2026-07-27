
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

/** True if `node` has an immediate child whose name is a known table-row name. */
function hasTableRowChild(node) {
  if (!node || !("children" in node)) return false;
  for (const c of node.children) if (TABLE_ROW_NAMES.indexOf(c.name) > -1) return true;
  return false;
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
 */
function tableRole(node) {
  if (TABLE_ROW_NAMES.indexOf(node.name) > -1) return "row";
  if (TABLE_HEADER_NAMES.indexOf(node.name) > -1 && hasTableRowChild(node.parent)) return "header";
  return null;
}

/** True if `node` itself, or any ancestor, is a known table-row instance. */
function withinTableRow(node) {
  let n = node, depth = 0;
  while (n && depth < 6) {
    if (TABLE_ROW_NAMES.indexOf(n.name) > -1) return true;
    n = n.parent;
    depth++;
  }
  return false;
}

/** The semantic name `node`'s own `prop` is bound to, or null. */
function ownBoundSemanticName(node, prop, resolved) {
  const bv = node.boundVariables && node.boundVariables[prop];
  if (!bv || !bv.length || bv[0].type !== "VARIABLE_ALIAS") return null;
  const info = resolved[bv[0].id];
  return info ? info.name : null;
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
 * The primitive behind `node`'s own first solid fill, or null. Synchronous —
 * relies on `resolved`/`HEX_INDEX` already being populated by scan(), since
 * walk() visits every node in the tree (not just text), so an ancestor's own
 * fill binding was already collected and resolved as a side effect.
 */
function ownFillPrimitive(node, resolved, HEX_INDEX) {
  if (!node || !("fills" in node)) return null;
  const solid = firstSolid(node.fills);
  if (!solid) return null;
  const bv = node.boundVariables && node.boundVariables.fills;
  if (bv && bv.length && bv[0].type === "VARIABLE_ALIAS") {
    const info = resolved[bv[0].id];
    return info ? normalisePrim(info.name) : null;
  }
  return HEX_INDEX[hex(solid.color)] || null;
}

/**
 * True if `node` (a TEXT layer) sits directly on, or a couple of wrapper
 * frames inside, a strong brand/status background — see STRONG_BG_PRIMITIVES
 * in rules.js for why this needs to force an absolute token.
 */
function onStrongBackground(node, resolved, HEX_INDEX) {
  let n = node.parent, depth = 0;
  while (n && depth < 3) {
    const prim = ownFillPrimitive(n, resolved, HEX_INDEX);
    if (prim && STRONG_BG_PRIMITIVES[prim]) return true;
    n = n.parent;
    depth++;
  }
  return false;
}

/** Strip a library prefix so "Light/Gray/12" and "Gray/12" both match. */
function normalisePrim(name) {
  if (!name) return null;
  if (HEX_LIGHT[name] !== undefined) return name;
  const parts = name.split("/");
  for (let i = 1; i < parts.length; i++) {
    const tail = parts.slice(i).join("/");
    if (HEX_LIGHT[tail] !== undefined) return tail;
  }
  return name;
}

function buildHexIndex() {
  const idx = {};
  for (const h in HEX_ALIAS) idx[h] = HEX_ALIAS[h];
  for (const n in HEX_LIGHT) if (!idx[HEX_LIGHT[n]]) idx[HEX_LIGHT[n]] = n;
  for (const n in HEX_DARK)  if (!idx[HEX_DARK[n]])  idx[HEX_DARK[n]]  = n;
  return idx;
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

/** Semantic variables available in this file. */
async function collectSemanticVars() {
  const byName = {};
  const local = await figma.variables.getLocalVariablesAsync();
  const cols  = await figma.variables.getLocalVariableCollectionsAsync();
  const S = cols.find(c => c.name === SEM_COLLECTION);
  if (S) for (const v of local) if (v.variableCollectionId === S.id) byName[v.name] = v;
  return byName;
}

async function scan(nodes) {
  const raw = [];
  const varIds = {};
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
        } else {
          raw.push({ node: n, prop: prop, varId: null, hex: hex(solid.color) });
        }
      }
    });
  }
  const resolved = await resolveVarNames(Object.keys(varIds));
  return { raw: raw, resolved: resolved };
}

async function applyTo(nodes, overrides) {
  const semVars = await collectSemanticVars();
  if (!Object.keys(semVars).length) {
    throw new Error('No "' + SEM_COLLECTION + '" variables in this file. Link or publish the XUI library to it.');
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

  let applied = 0, structural = 0, removed = 0, alreadySemantic = 0, notOurColour = 0;
  const unmapped = {};
  const changes = [];

  for (let i = 0; i < raw.length; i++) {
    const t = raw[i];

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
    if (!forced && t.prop === "fills" && t.node.type === "TEXT" &&
        onStrongBackground(t.node, resolved, HEX_INDEX)) {
      forced = TEXT_ON_STRONG_BG_SEMANTIC;
    }
    if (!forced && t.varId) {
      const boundInfo = resolved[t.varId];
      if (boundInfo && NAME_ALIAS[boundInfo.name]) forced = NAME_ALIAS[boundInfo.name];
    }
    if (forced && semVars[forced]) {
      const v = await getSem(forced);
      if (v) {
        const paints = t.node[t.prop].map(function (p) { return Object.assign({}, p); });
        paints[0] = figma.variables.setBoundVariableForPaint(paints[0], "color", v);
        t.node[t.prop] = paints;
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
          continue;
        }
        primitive = normalisePrim(info.name);
      }
    }
    if (!primitive) primitive = HEX_INDEX[t.hex] || null;

    if (!primitive || HEX_LIGHT[primitive] === undefined) {
      notOurColour++;
      continue;
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
    const paints = t.node[t.prop].map(function (p) { return Object.assign({}, p); });
    paints[0] = figma.variables.setBoundVariableForPaint(paints[0], "color", v);
    t.node[t.prop] = paints;
    applied++;
    if (changes.length < 50) {
      changes.push({ layer: (t.node.name || "").slice(0, 24), from: primitive, to: semantic });
    }
  }

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
  }).sort(function (a, b) { return b.count - a.count; });

  return {
    applied: applied,
    structural: structural,
    removed: removed,
    alreadySemantic: alreadySemantic,
    notOurColour: notOurColour,
    unmapped: unmappedList,
    tokens: tokenPalette(Object.keys(semVars).sort()),
    changes: changes,
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
    const np = paints.map(function (p) { return Object.assign({}, p); });
    np[0] = figma.variables.setBoundVariableForPaint(np[0], "color", v);
    node[prop] = np;
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
