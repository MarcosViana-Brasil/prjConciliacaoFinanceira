import type { FastifyRequest } from 'fastify';
import { getAuthenticatedUser } from './auth-context.js';

export type RequestContext = {
  userId?: string;
  userName?: string;
  origin: string;
  ipAddress?: string;
  userAgent?: string;
};

export function getRequestContext(request: FastifyRequest): RequestContext {
  const authenticatedUser = getAuthenticatedUser(request);
  if (authenticatedUser) {
    return {
      userId: authenticatedUser.id,
      userName: authenticatedUser.name,
      origin: 'api',
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    };
  }

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
