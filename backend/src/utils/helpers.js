/**
 * Generates a URL-friendly slug from a string.
 * Supports Cyrillic transliteration for international character support.
 */
export const generateSlug = (name) => {
  if (!name) return '';

  const cyrillicToLatin = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };

  let slug = name.toLowerCase().trim();

  // Transliterate Cyrillic
  slug = slug.split('').map(char => cyrillicToLatin[char] || char).join('');

  return slug
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric except space and hyphen
    .replace(/\s+/g, '-')         // Replace spaces with -
    .replace(/-+/g, '-')          // Replace multiple - with single -
    .replace(/^-+/, '')           // Trim forward -
    .replace(/-+$/, '');          // Trim trailing -
}

/**
 * Basic XSS sanitization for input data.
 */
export const sanitizeInput = (data) => {
  if (!data) return {};
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Remove potentially dangerous HTML tags and trim
      sanitized[key] = value.trim()
        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
        .replace(/[<>]/g, '');
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
