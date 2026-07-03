import { createHash, randomBytes, scryptSync } from 'node:crypto';

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortValue(item));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((accumulator, key) => {
        accumulator[key] = sortValue((value as Record<string, unknown>)[key]);
        return accumulator;
      }, {});
  }

  return value;
}

export function hashObject(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(sortValue(value))).digest('hex');
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');

  return `scrypt:${salt}:${hash}`;
}
