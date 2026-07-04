import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../../shared/utils/env.js';

type TokenPayload = {
  sub: string;
  name: string;
  email: string;
  roles: string[];
  exp: number;
};

export function signToken(payload: Omit<TokenPayload, 'exp'>) {
  const body: TokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + env.AUTH_TOKEN_TTL_SECONDS
  };
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const signature = sign(`${encodedHeader}.${encodedPayload}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | undefined {
  const [encodedHeader, encodedPayload, signature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !signature) return undefined;

  const expected = sign(`${encodedHeader}.${encodedPayload}`);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return undefined;
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as TokenPayload;
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return undefined;

  return payload;
}

function sign(value: string) {
  return createHmac('sha256', env.AUTH_JWT_SECRET).update(value).digest('base64url');
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}
