// Categories form a tree of any depth (up to MAX_DEPTH levels):
//   Imprimantes > Jet d'encre > A3, Accessoires > Câbles > USB-C...
// These helpers work on the full list of categories loaded once.

const prisma = require('../config/prisma');

// Main category = level 1. Deep enough for precise searches, while keeping
// menus usable on a phone.
const MAX_DEPTH = 5;

const byName = (a, b) => (a.nameFr || a.nameEn).localeCompare(b.nameFr || b.nameEn, 'fr');

async function loadAllCategories({ withAttributes = false } = {}) {
  return prisma.category.findMany({
    include: withAttributes ? { attributes: { orderBy: { sortOrder: 'asc' } } } : undefined,
    orderBy: { nameEn: 'asc' },
  });
}

/** Flat list → main categories, each with `children` nested to any depth. */
function buildTree(list) {
  const nodes = new Map(list.map((c) => [c.id, { ...c, children: [] }]));
  const roots = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : null;
    if (parent) parent.children.push(node);
    else roots.push(node); // also catches a parent that no longer exists
  }
  const sort = (arr) => {
    arr.sort(byName);
    arr.forEach((n) => sort(n.children));
  };
  sort(roots);
  return roots;
}

/** Ids of a category and of everything below it, at every level. */
function descendantIds(list, rootId) {
  const childrenOf = new Map();
  list.forEach((c) => {
    if (!c.parentId) return;
    if (!childrenOf.has(c.parentId)) childrenOf.set(c.parentId, []);
    childrenOf.get(c.parentId).push(c.id);
  });
  const ids = [];
  const stack = [rootId];
  const seen = new Set();
  while (stack.length) {
    const id = stack.pop();
    if (seen.has(id)) continue; // safety against a loop in old data
    seen.add(id);
    ids.push(id);
    (childrenOf.get(id) || []).forEach((child) => stack.push(child));
  }
  return ids;
}

/** Parents from the main category down to the direct parent (for breadcrumbs). */
function ancestorsOf(list, category) {
  const byId = new Map(list.map((c) => [c.id, c]));
  const chain = [];
  const seen = new Set();
  let current = category.parentId ? byId.get(category.parentId) : null;
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    chain.unshift({ id: current.id, slug: current.slug, nameEn: current.nameEn, nameFr: current.nameFr });
    current = current.parentId ? byId.get(current.parentId) : null;
  }
  return chain;
}

/** Level of a category: 1 for a main category, 2 for its subcategory... */
function levelOf(list, id) {
  const byId = new Map(list.map((c) => [c.id, c]));
  let level = 0;
  let current = byId.get(id);
  const seen = new Set();
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    level += 1;
    current = current.parentId ? byId.get(current.parentId) : null;
  }
  return level;
}

/** How many levels a category's branch has (1 = no subcategories). */
function branchHeight(list, id) {
  const children = list.filter((c) => c.parentId === id);
  if (!children.length) return 1;
  return 1 + Math.max(...children.map((c) => branchHeight(list, c.id)));
}

module.exports = { MAX_DEPTH, loadAllCategories, buildTree, descendantIds, ancestorsOf, levelOf, branchHeight };
