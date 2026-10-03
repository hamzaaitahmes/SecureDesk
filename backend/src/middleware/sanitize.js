import sanitizeHtml from 'sanitize-html';

function cleanValue(value) {
  if (typeof value === 'string') {
    return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
  }
  if (Array.isArray(value)) return value.map(cleanValue);
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete value[key];
      } else {
        value[key] = cleanValue(value[key]);
      }
    }
  }
  return value;
}

export function sanitizeRequest(req, _res, next) {
  if (req.body) cleanValue(req.body);
  next();
}

export { cleanValue };

