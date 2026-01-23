export const generateSlug = (name) => {
  return name.trim().toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

export const sanitizeInput = (data) => {
  if (!data) return {};
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Remove caracteres potencialmente perigosos e trim
      sanitized[key] = value.trim().replace(/[<>]/g, '');
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
