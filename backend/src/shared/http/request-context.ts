import type { FastifyRequest } from 'fastify';

export type RequestContext = {
  userId?: string;
  userName?: string;
  origin: string;
  ipAddress?: string;
  userAgent?: string;
};

export function getRequestContext(request: FastifyRequest): RequestContext {
  const userIdHeader = request.headers['x-user-id'];
  const userNameHeader = request.headers['x-user-name'];
  const userId = typeof userIdHeader === 'string' && userIdHeader.trim() ? userIdHeader : undefined;
  const userName = typeof userNameHeader === 'string' && userNameHeader.trim() ? userNameHeader : undefined;

  return {
    userId,
    userName,
    origin: 'api',
    ipAddress: request.ip,
    userAgent: request.headers['user-agent']
  };
}
