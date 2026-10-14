// Categories arrive from the API as a tree: main categories with `children`
// nested to any depth. These helpers turn it into lists for <select> menus.

/** Tree → flat list in display order, each item with its `depth` (0 = main). */
export function flattenTree(tree = [], depth = 0) {
  return tree.flatMap((cat) => [{ ...cat, depth }, ...flattenTree(cat.children || [], depth + 1)]);
}

/** Ids of a category and of everything below it. */
export function subtreeIds(category) {
  if (!category) return new Set();
  const ids = new Set([category.id]);
  (category.children || []).forEach((child) => subtreeIds(child).forEach((id) => ids.add(id)));
  return ids;
}

/** Find a category anywhere in the tree. */
export function findInTree(tree = [], id) {
  for (const cat of tree) {
    if (cat.id === id) return cat;
    const found = findInTree(cat.children || [], id);
    if (found) return found;
  }
  return null;
}

/** Indented label for <option>, e.g. "    └ Jet d'encre". */
export function indentedLabel(cat, field = 'nameEn') {
  if (!cat.depth) return cat[field];
  return `${'   '.repeat(cat.depth)}└ ${cat[field]}`;
}

// Same limit as the server: main category + 4 levels below it
export const MAX_DEPTH = 5;
