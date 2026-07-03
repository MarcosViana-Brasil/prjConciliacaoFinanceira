import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../shared/http/api-response.js';
import { getRequestContext } from '../../shared/http/request-context.js';
import { validateRequest } from '../../shared/validation/validate-request.js';
import {
  settingKeyParamsSchema,
  upsertSettingBodySchema,
  type SettingKeyParams,
  type UpsertSettingBody
} from './settings.schemas.js';
import { settingsService } from './settings.service.js';

export class SettingsController {
  async list(_request: FastifyRequest, reply: FastifyReply) {
    const settings = await settingsService.list();

    return reply.send(success(settings, 'Configuracoes listadas com sucesso'));
  }

  async upsert(request: FastifyRequest, reply: FastifyReply) {
    const { params, body } = validateRequest<SettingKeyParams, unknown, UpsertSettingBody>(request, {
      params: settingKeyParamsSchema,
      body: upsertSettingBodySchema
    });
    const setting = await settingsService.upsert(params.key, body, getRequestContext(request));

    return reply.send(success(setting, 'Configuracao salva com sucesso'));
  }
}
