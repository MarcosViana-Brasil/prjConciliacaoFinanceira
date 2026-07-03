import type { FastifyRequest } from 'fastify';

export type RequestContext = {
  userId?: string;
  origin: string;
  ipAddress?: string;
  userAgent?: string;
};

export function getRequestContext(request: FastifyRequest): RequestContext {
  const userIdHeader = request.headers['x-user-id'];
  const userId = typeof userIdHeader === 'string' && userIdHeader.trim() ? userIdHeader : undefined;

  return {
    userId,
    origin: 'api',
    ipAddress: request.ip,
    userAgent: request.headers['user-agent']
  };
}
