
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

  let applied = 0, alreadySemantic = 0, notOurColour = 0;
  const unmapped = {};
  const changes = [];

  for (let i = 0; i < raw.length; i++) {
    const t = raw[i];
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
    alreadySemantic: alreadySemantic,
    notOurColour: notOurColour,
    unmapped: unmappedList,
    tokens: Object.keys(semVars).sort(),
    changes: changes,
  };
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
      figma.notify("Applied semantics to " + r.applied + " layers");
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
