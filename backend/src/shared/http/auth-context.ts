import type { FastifyRequest } from 'fastify';

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

const requestUsers = new WeakMap<FastifyRequest, AuthenticatedUser>();

export function setAuthenticatedUser(request: FastifyRequest, user: AuthenticatedUser) {
  requestUsers.set(request, user);
}

export function getAuthenticatedUser(request: FastifyRequest) {
  return requestUsers.get(request);
}
