import { Prisma } from '@prisma/client';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { failure } from '../http/api-response.js';
import { logger } from '../logger/logger.js';
import { AppError } from './AppError.js';

export function errorHandler(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) {
  const traceId = request.id;

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send(failure(error.code, error.message, error.details, traceId));
  }

  if (error instanceof ZodError) {
    return reply.status(400).send(
      failure(
        'VALIDATION_ERROR',
        'Dados invalidos',
        error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message
        })),
        traceId
      )
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return reply.status(409).send(failure('CONFLICT', 'Registro duplicado', error.meta, traceId));
    }

    if (error.code === 'P2025') {
      return reply.status(404).send(failure('NOT_FOUND', 'Registro nao encontrado', error.meta, traceId));
    }

    logger.error({ error, traceId }, 'Prisma known request error');
    return reply.status(400).send(failure('DATABASE_ERROR', 'Erro ao acessar dados', { prismaCode: error.code }, traceId));
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return reply.status(400).send(failure('DATABASE_VALIDATION_ERROR', 'Dados invalidos para persistencia', undefined, traceId));
  }

  logger.error({ error, traceId }, 'Unexpected error');
  return reply.status(500).send(failure('INTERNAL_ERROR', 'Erro interno inesperado', undefined, traceId));
}
