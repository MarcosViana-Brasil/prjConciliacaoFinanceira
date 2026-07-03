import { AuditAction, FinancialTitleStatus, JobStatus, Prisma, type FinancialTitle } from '@prisma/client';
import { auditService } from '../auditoria/audit.service.js';
import { jobsService } from '../jobs/jobs.service.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { RequestContext } from '../../shared/http/request-context.js';
import { toInputJson } from '../../shared/utils/json.js';
import { FinancialTitlesRepository } from './financial-titles.repository.js';
import { mapFinancialTitle } from './financial-titles.mapper.js';
import {
  calculateFinancialTitleStatus,
  ensureNonNegative,
  ensurePositive,
  normalizeDocument,
  normalizeMoney,
  requireMoney,
  validateInstallments
} from './financial-titles.utils.js';
import type {
  CreateFinancialTitleInput,
  FinancialTitleFilters,
  ImportFinancialTitlesInput,
  ImportFinancialTitlesResult,
  JustifiedFinancialTitleInput,
  MarkFinancialTitlePaidInput,
  SoftDeleteFinancialTitleInput,
  UpdateFinancialTitleInput
} from './financial-titles.types.js';

export class FinancialTitlesService {
  constructor(private readonly financialTitlesRepository = new FinancialTitlesRepository()) {}

  async list(filters: FinancialTitleFilters) {
    const result = await this.financialTitlesRepository.list(filters);

    return {
      data: result.data.map(mapFinancialTitle),
      pagination: result.pagination
    };
  }

  async getById(id: string) {
    const title = await this.financialTitlesRepository.findById(id);

    if (!title) {
      throw new AppError('Titulo financeiro nao encontrado', 404, 'FINANCIAL_TITLE_NOT_FOUND');
    }

    const auditEvents = await auditService.listByEntity('FinancialTitle', id);

    return {
      ...mapFinancialTitle(title),
      auditEvents: auditEvents.slice(0, 10)
    };
  }

  async create(input: CreateFinancialTitleInput, context: RequestContext) {
    const existing = await this.financialTitlesRepository.findDuplicate(input);

    if (existing) {
      throw new AppError('Titulo financeiro ja cadastrado', 409, 'FINANCIAL_TITLE_ALREADY_EXISTS', {
        id: existing.id,
        externalId: existing.externalId,
        titleNumber: existing.titleNumber
      });
    }

    return this.createWithoutDuplicateCheck(input, context);
  }

  async update(id: string, input: UpdateFinancialTitleInput, context: RequestContext) {
    const before = await this.getActiveForMutation(id);
    const data = this.buildUpdateData(before, input);
    const after = await this.financialTitlesRepository.update(id, data);

    await this.recordAudit(AuditAction.UPDATE, after.id, context, before, after, input.justification, {
      operation: 'update_financial_title'
    });

    return mapFinancialTitle(after);
  }

  async cancel(id: string, input: JustifiedFinancialTitleInput, context: RequestContext) {
    const before = await this.getActiveForMutation(id);

    this.ensureNotReconciled(before, 'Titulo conciliado exige processo proprio de reversao antes do cancelamento');

    const after = await this.financialTitlesRepository.update(id, {
      status: FinancialTitleStatus.CANCELED
    });

    await this.recordAudit(AuditAction.UPDATE, after.id, context, before, after, input.justification, {
      operation: 'cancel_financial_title'
    });

    return mapFinancialTitle(after);
  }

  async markPaid(id: string, input: MarkFinancialTitlePaidInput, context: RequestContext) {
    const before = await this.getActiveForMutation(id);
    const paidAmount = requireMoney(input.paidAmount, 'paidAmount');

    ensureNonNegative(paidAmount, 'paidAmount');

    const status = calculateFinancialTitleStatus({
      grossAmount: before.grossAmount,
      paidAmount,
      currentStatus: before.status
    });
    const after = await this.financialTitlesRepository.update(id, {
      paidAmount,
      paidAt: input.paidAt,
      status
    });

    await this.recordAudit(AuditAction.UPDATE, after.id, context, before, after, input.justification, {
      operation: 'mark_financial_title_paid'
    });

    return mapFinancialTitle(after);
  }

  async softDelete(id: string, input: SoftDeleteFinancialTitleInput, context: RequestContext) {
    const before = await this.getActiveForMutation(id);

    this.ensureNotReconciled(before, 'Titulo conciliado exige processo proprio de reversao antes da exclusao logica');

    const after = await this.financialTitlesRepository.softDelete(id);

    await this.recordAudit(AuditAction.SOFT_DELETE, after.id, context, before, after, input.justification, {
      operation: 'soft_delete_financial_title'
    });

    return mapFinancialTitle(after);
  }

  async restore(id: string, input: JustifiedFinancialTitleInput, context: RequestContext) {
    const before = await this.financialTitlesRepository.findById(id);

    if (!before) {
      throw new AppError('Titulo financeiro nao encontrado', 404, 'FINANCIAL_TITLE_NOT_FOUND');
    }

    if (!before.deletedAt) {
      throw new AppError('Titulo financeiro nao esta excluido', 400, 'FINANCIAL_TITLE_NOT_DELETED');
    }

    const after = await this.financialTitlesRepository.restore(id);

    await this.recordAudit(AuditAction.UPDATE, after.id, context, before, after, input.justification, {
      operation: 'restore_financial_title'
    });

    return mapFinancialTitle(after);
  }

  async importBatch(input: ImportFinancialTitlesInput, context: RequestContext): Promise<ImportFinancialTitlesResult> {
    const job = await jobsService.startJob(
      {
        jobName: 'financial_titles_import',
        metadata: { source: input.source, total: input.items.length }
      },
      context
    );
    const result: ImportFinancialTitlesResult = {
      total: input.items.length,
      created: 0,
      skipped: 0,
      errors: []
    };

    for (const [index, item] of input.items.entries()) {
      try {
        const existing = await this.financialTitlesRepository.findDuplicate(item);

        if (existing) {
          result.skipped += 1;
          continue;
        }

        await this.createWithoutDuplicateCheck(
          {
            ...item,
            metadata: {
              ...(isPlainObject(item.metadata) ? item.metadata : {}),
              importSource: input.source
            },
            justification: input.justification
          },
          context
        );
        result.created += 1;
      } catch (error) {
        result.errors.push({
          index,
          titleNumber: item.titleNumber,
          externalId: item.externalId,
          message: error instanceof Error ? error.message : 'Erro inesperado ao importar titulo'
        });
      }
    }

    await auditService.recordEvent({
      entity: 'FinancialTitle',
      entityId: `import:${job.id}`,
      action: AuditAction.IMPORT,
      userId: context.userId,
      origin: context.origin,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      justification: input.justification,
      after: result,
      metadata: {
        operation: 'import_financial_titles',
        source: input.source,
        jobId: job.id,
        userName: context.userName
      }
    });

    await jobsService.finishJob(
      job.id,
      {
        status: result.errors.length ? JobStatus.PARTIAL_SUCCESS : JobStatus.SUCCESS,
        processedCount: result.total,
        successCount: result.created,
        errorCount: result.errors.length,
        metadata: { source: input.source, skipped: result.skipped }
      },
      context
    );

    return result;
  }

  private async createWithoutDuplicateCheck(input: CreateFinancialTitleInput, context: RequestContext) {
    const data = this.buildCreateData(input);
    const title = await this.financialTitlesRepository.create(data);

    await this.recordAudit(AuditAction.CREATE, title.id, context, undefined, title, input.justification, {
      operation: 'create_financial_title'
    });

    return mapFinancialTitle(title);
  }

  private buildCreateData(input: CreateFinancialTitleInput): Prisma.FinancialTitleUncheckedCreateInput {
    const grossAmount = requireMoney(input.grossAmount, 'grossAmount');
    const netAmountExpected = normalizeMoney(input.netAmountExpected, 'netAmountExpected');
    const paidAmount = normalizeMoney(input.paidAmount ?? 0, 'paidAmount') ?? new Prisma.Decimal(0);

    ensurePositive(grossAmount, 'grossAmount');
    ensureNonNegative(netAmountExpected, 'netAmountExpected');
    ensureNonNegative(paidAmount, 'paidAmount');
    validateInstallments(input.installmentNumber, input.totalInstallments);

    return {
      externalId: input.externalId,
      titleNumber: input.titleNumber,
      customerName: input.customerName,
      customerDocument: normalizeDocument(input.customerDocument),
      orderNumber: input.orderNumber,
      installmentNumber: input.installmentNumber,
      totalInstallments: input.totalInstallments,
      grossAmount,
      netAmountExpected,
      paidAmount,
      dueDate: input.dueDate,
      issueDate: input.issueDate,
      paidAt: input.paidAt,
      status: calculateFinancialTitleStatus({ grossAmount, paidAmount }),
      gatewayProvider: input.gatewayProvider,
      gatewayReference: input.gatewayReference,
      nsu: input.nsu,
      authorizationCode: input.authorizationCode,
      tid: input.tid,
      transactionId: input.transactionId,
      metadata: toInputJson(input.metadata ?? {})
    };
  }

  private buildUpdateData(before: FinancialTitle, input: UpdateFinancialTitleInput): Prisma.FinancialTitleUncheckedUpdateInput {
    const grossAmount = normalizeMoney(input.grossAmount, 'grossAmount') ?? before.grossAmount;
    const netAmountExpected =
      input.netAmountExpected === null ? null : normalizeMoney(input.netAmountExpected, 'netAmountExpected') ?? before.netAmountExpected;
    const paidAmount = input.paidAmount === null ? null : normalizeMoney(input.paidAmount, 'paidAmount') ?? before.paidAmount;
    const installmentNumber = input.installmentNumber === undefined ? before.installmentNumber : input.installmentNumber;
    const totalInstallments = input.totalInstallments === undefined ? before.totalInstallments : input.totalInstallments;

    ensurePositive(grossAmount, 'grossAmount');
    ensureNonNegative(netAmountExpected ?? undefined, 'netAmountExpected');
    ensureNonNegative(paidAmount ?? undefined, 'paidAmount');
    validateInstallments(installmentNumber, totalInstallments);

    const status =
      input.status ??
      calculateFinancialTitleStatus({
        grossAmount,
        paidAmount,
        currentStatus: before.status
      });

    return {
      customerName: input.customerName,
      customerDocument: input.customerDocument === undefined ? undefined : normalizeDocument(input.customerDocument),
      orderNumber: input.orderNumber,
      installmentNumber: input.installmentNumber,
      totalInstallments: input.totalInstallments,
      grossAmount: input.grossAmount === undefined ? undefined : grossAmount,
      netAmountExpected: input.netAmountExpected === undefined ? undefined : netAmountExpected,
      paidAmount: input.paidAmount === undefined ? undefined : paidAmount,
      dueDate: input.dueDate,
      issueDate: input.issueDate,
      paidAt: input.paidAt,
      status,
      gatewayProvider: input.gatewayProvider,
      gatewayReference: input.gatewayReference,
      nsu: input.nsu,
      authorizationCode: input.authorizationCode,
      tid: input.tid,
      transactionId: input.transactionId,
      metadata: input.metadata === undefined ? undefined : toInputJson(input.metadata)
    };
  }

  private async getActiveForMutation(id: string) {
    const title = await this.financialTitlesRepository.findActiveById(id);

    if (!title) {
      throw new AppError('Titulo financeiro nao encontrado ou excluido', 404, 'FINANCIAL_TITLE_NOT_FOUND');
    }

    return title;
  }

  private ensureNotReconciled(title: FinancialTitle, message: string) {
    if (title.status === FinancialTitleStatus.RECONCILED) {
      throw new AppError(message, 409, 'FINANCIAL_TITLE_RECONCILED');
    }
  }

  private async recordAudit(
    action: AuditAction,
    entityId: string,
    context: RequestContext,
    before: unknown,
    after: unknown,
    justification: string | undefined,
    metadata: Record<string, unknown>
  ) {
    await auditService.recordEvent({
      entity: 'FinancialTitle',
      entityId,
      action,
      userId: context.userId,
      origin: context.origin,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      before,
      after,
      justification,
      metadata: {
        ...metadata,
        userName: context.userName
      }
    });
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

export const financialTitlesService = new FinancialTitlesService();
