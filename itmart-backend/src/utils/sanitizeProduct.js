/**
 * Removes the internal costPrice field from a product object before it's
 * sent in a public API response. Used instead of Prisma's `omit` option,
 * which isn't available in every Prisma client version — this approach
 * works identically regardless of version.
 */
function stripCostPrice(product) {
  if (!product) return product;
  const { costPrice, ...rest } = product;
  return rest;
}

function stripCostPriceFromList(products) {
  return (products || []).map(stripCostPrice);
}

module.exports = { stripCostPrice, stripCostPriceFromList };
