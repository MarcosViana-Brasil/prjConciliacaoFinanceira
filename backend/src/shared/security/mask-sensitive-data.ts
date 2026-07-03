const sensitiveKeys = new Set([
  'authorization',
  'token',
  'password',
  'secret',
  'apikey',
  'clientsecret',
  'accesstoken',
  'refreshtoken',
  'cookie'
]);

export function maskSensitiveData(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => maskSensitiveData(item));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => {
        const normalizedKey = key.replace(/[-_]/g, '').toLowerCase();

        if (sensitiveKeys.has(normalizedKey)) {
          return [key, '[MASKED]'];
        }

        return [key, maskSensitiveData(entry)];
      })
    );
  }

  return value;
}
