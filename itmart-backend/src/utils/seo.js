// Référencement (SEO) texts typed in the admin: one line, trimmed, empty →
// null, and cut at a sensible length (Google shows ~60 characters of a title
// and ~160 of a description; a little extra is kept, the admin warns).
const SEO_LIMITS = { title: 70, description: 170, keyword: 60 };

const cleanSeo = (value, kind) => {
  if (value === undefined || value === null) return null;
  const text = String(value).replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.slice(0, SEO_LIMITS[kind]) : null;
};

// Copies the SEO fields present in `body` into `data` (for create / update)
function pickSeoFields(body, data, { keyword = false } = {}) {
  if (body.seoTitle !== undefined) data.seoTitle = cleanSeo(body.seoTitle, 'title');
  if (body.seoDescription !== undefined) data.seoDescription = cleanSeo(body.seoDescription, 'description');
  if (keyword && body.seoKeyword !== undefined) data.seoKeyword = cleanSeo(body.seoKeyword, 'keyword');
  return data;
}

module.exports = { cleanSeo, pickSeoFields, SEO_LIMITS };
