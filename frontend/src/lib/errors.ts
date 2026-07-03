export class ApiError extends Error {
  code: string;
  details?: unknown;

  constructor(message: string, code = 'API_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Erro inesperado ao comunicar com a API.';
}
