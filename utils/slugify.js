const crypto = require('crypto');

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateUniqueSlug(base) {
  const random = crypto.randomBytes(3).toString('hex'); // 6 chars
  return `${slugify(base)}-${random}`;
}

function createSlug(base) {
  return generateUniqueSlug(base);
}

module.exports = { generateUniqueSlug, createSlug };
