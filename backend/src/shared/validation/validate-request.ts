import type { FastifyRequest } from 'fastify';
import type { z } from 'zod';

export type RequestSchemas = {
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
};

export function validateRequest<TParams = unknown, TQuery = unknown, TBody = unknown>(
  request: FastifyRequest,
  schemas: RequestSchemas
): { params: TParams; query: TQuery; body: TBody } {
  return {
    params: schemas.params?.parse(request.params) as TParams,
    query: schemas.query?.parse(request.query) as TQuery,
    body: schemas.body?.parse(request.body) as TBody
  };
}
