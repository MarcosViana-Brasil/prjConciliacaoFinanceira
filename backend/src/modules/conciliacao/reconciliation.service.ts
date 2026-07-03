import {
  AuditAction,
  DivergenceSeverity,
  FinancialTitleStatus,
  JobStatus,
  Prisma,
  ReconciliationDivergenceType,
  ReconciliationStatus
} from '@prisma/client';
import { auditService } from '../auditoria/audit.service.js';
import { jobsService } from '../jobs/jobs.service.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { RequestContext } from '../../shared/http/request-context.js';
import { toInputJson } from '../../shared/utils/json.js';
import { calculateReconciliationScore, findBestMatchForTitle } from './reconciliation.engine.js';
import { mapReconciliation } from './reconciliation.mapper.js';
import { ReconciliationRepository } from './reconciliation.repository.js';
import type {
  BestMatchResult,
  DivergenceFilters,
  MatchCandidate,
  ReconciliationDifference,
  ReconciliationFilters,
  RedeReceivableLike,
  RedeTransactionLike,
  RunReconciliationInput,
  RunReconciliationSummary
} from './reconciliation.types.js';
import { amountDiff, dateDiffDays, toNumber } from './reconciliation.utils.js';

export class ReconciliationService {
  constructor(private readonly reconciliationRepository = new ReconciliationRepository()) {}

  async runWithoutJob(input: RunReconciliationInput, context: RequestContext): Promise<RunReconciliationSummary> {
    const summary: RunReconciliationSummary = {
      processed: 0,
      matchedAutomatically: 0,
      divergent: 0,
      notFound: 0,
      errors: []
    };

    const titles = await this.reconciliationRepository.findTitlesForRun(input);
    const candidatesData = await this.reconciliationRepository.findCandidates(input);

    for (const title of titles) {
      try {
        summary.processed += 1;
        const candidates = this.buildCandidates(candidatesData.transactions, candidatesData.receivables);
        const bestMatch = findBestMatchForTitle(title, candidates);
        const redeReceivableId = bestMatch.receivable?.id;

        if (redeReceivableId && bestMatch.status === ReconciliationStatus.MATCHED_AUTOMATICALLY) {
          const alreadyUsed = await this.reconciliationRepository.hasActiveReceivableReconciliation(redeReceivableId);

          if (alreadyUsed) {
            bestMatch.status = ReconciliationStatus.DIVERGENT;
            bestMatch.differences.push({
              type: ReconciliationDivergenceType.DUPLICATED_RECEIVABLE,
              description: 'Recebivel ja vinculado a uma conciliacao ativa',
              actualValue: redeReceivableId,
              severity: DivergenceSeverity.CRITICAL
            });
          }
        }

        const existing = await this.reconciliationRepository.findActiveForPair({
          financialTitleId: title.id,
          redeTransactionId: bestMatch.transaction?.id,
          redeReceivableId
        });

        if (existing) {
          continue;
        }

        const reconciliation = await this.reconciliationRepository.createReconciliation(
          {
            financialTitleId: title.id,
            redeTransactionId: bestMatch.transaction?.id,
            redeReceivableId,
            provider: input.gatewayProvider,
            status: bestMatch.status,
            matchLevel: bestMatch.matchLevel,
            score: bestMatch.score,
            matchedBy: bestMatch.status === ReconciliationStatus.MATCHED_AUTOMATICALLY ? 'system' : undefined,
            matchedAt: bestMatch.status === ReconciliationStatus.MATCHED_AUTOMATICALLY ? new Date() : undefined,
            grossAmountDiff: this.decimalDiff(title.grossAmount, bestMatch.receivable?.grossAmount ?? bestMatch.transaction?.grossAmount),
            netAmountDiff: this.decimalDiff(title.netAmountExpected, bestMatch.receivable?.netAmount ?? bestMatch.transaction?.netAmount),
            dateDiffDays: dateDiffDays(title.dueDate, bestMatch.receivable?.expectedPaymentDate ?? bestMatch.transaction?.saleDate),
            ruleApplied: bestMatch.ruleApplied,
            metadata: toInputJson({ engineResult: bestMatch })
          },
          bestMatch.status === ReconciliationStatus.MATCHED_AUTOMATICALLY ? [] : bestMatch.differences
        );

        if (bestMatch.status === ReconciliationStatus.MATCHED_AUTOMATICALLY) {
          summary.matchedAutomatically += 1;
          await this.applyTitleReconciled(title.id, bestMatch);
          await auditService.recordEvent({
            entity: 'Reconciliation',
            entityId: reconciliation.id,
            action: AuditAction.RECONCILE_AUTO,
            userId: context.userId,
            origin: context.origin,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            after: reconciliation,
            metadata: { financialTitleId: title.id, score: bestMatch.score }
          });
        } else if (bestMatch.status === ReconciliationStatus.NOT_FOUND) {
          summary.notFound += 1;
        } else {
          summary.divergent += 1;
        }
      } catch (error) {
        summary.errors.push({
          financialTitleId: title.id,
          message: error instanceof Error ? error.message : 'Erro inesperado ao conciliar titulo'
        });
      }
    }

    await auditService.recordEvent({
      entity: 'Reconciliation',
      entityId: `run:${Date.now()}`,
      action: summary.matchedAutomatically ? AuditAction.RECONCILE_AUTO : AuditAction.PROCESS,
      userId: context.userId,
      origin: context.origin,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      after: summary,
      metadata: { operation: 'run_reconciliation', input }
    });

    return summary;
  }

  async run(input: RunReconciliationInput, context: RequestContext): Promise<RunReconciliationSummary> {
    const job = await jobsService.startJob({ jobName: 'reconciliation_run', metadata: input }, context);
    const summary: RunReconciliationSummary = {
      processed: 0,
      matchedAutomatically: 0,
      divergent: 0,
      notFound: 0,
      errors: []
    };

    try {
      const titles = await this.reconciliationRepository.findTitlesForRun(input);
      const candidatesData = await this.reconciliationRepository.findCandidates(input);

      for (const title of titles) {
        try {
          summary.processed += 1;
          const candidates = this.buildCandidates(candidatesData.transactions, candidatesData.receivables);
          const bestMatch = findBestMatchForTitle(title, candidates);
          const redeReceivableId = bestMatch.receivable?.id;

          if (redeReceivableId && bestMatch.status === ReconciliationStatus.MATCHED_AUTOMATICALLY) {
            const alreadyUsed = await this.reconciliationRepository.hasActiveReceivableReconciliation(redeReceivableId);

            if (alreadyUsed) {
              bestMatch.status = ReconciliationStatus.DIVERGENT;
              bestMatch.differences.push({
                type: ReconciliationDivergenceType.DUPLICATED_RECEIVABLE,
                description: 'Recebivel ja vinculado a uma conciliacao ativa',
                actualValue: redeReceivableId,
                severity: DivergenceSeverity.CRITICAL
              });
            }
          }

          const existing = await this.reconciliationRepository.findActiveForPair({
            financialTitleId: title.id,
            redeTransactionId: bestMatch.transaction?.id,
            redeReceivableId
          });

          if (existing) {
            continue;
          }

          const reconciliation = await this.reconciliationRepository.createReconciliation(
            {
              financialTitleId: title.id,
              redeTransactionId: bestMatch.transaction?.id,
              redeReceivableId,
              provider: input.gatewayProvider,
              status: bestMatch.status,
              matchLevel: bestMatch.matchLevel,
              score: bestMatch.score,
              matchedBy: bestMatch.status === ReconciliationStatus.MATCHED_AUTOMATICALLY ? 'system' : undefined,
              matchedAt: bestMatch.status === ReconciliationStatus.MATCHED_AUTOMATICALLY ? new Date() : undefined,
              grossAmountDiff: this.decimalDiff(title.grossAmount, bestMatch.receivable?.grossAmount ?? bestMatch.transaction?.grossAmount),
              netAmountDiff: this.decimalDiff(title.netAmountExpected, bestMatch.receivable?.netAmount ?? bestMatch.transaction?.netAmount),
              dateDiffDays: dateDiffDays(title.dueDate, bestMatch.receivable?.expectedPaymentDate ?? bestMatch.transaction?.saleDate),
              ruleApplied: bestMatch.ruleApplied,
              metadata: toInputJson({ engineResult: bestMatch })
            },
            bestMatch.status === ReconciliationStatus.MATCHED_AUTOMATICALLY ? [] : bestMatch.differences
          );

          if (bestMatch.status === ReconciliationStatus.MATCHED_AUTOMATICALLY) {
            summary.matchedAutomatically += 1;
            await this.applyTitleReconciled(title.id, bestMatch);
            await auditService.recordEvent({
              entity: 'Reconciliation',
              entityId: reconciliation.id,
              action: AuditAction.RECONCILE_AUTO,
              userId: context.userId,
              origin: context.origin,
              ipAddress: context.ipAddress,
              userAgent: context.userAgent,
              after: reconciliation,
              metadata: { financialTitleId: title.id, score: bestMatch.score }
            });
          } else if (bestMatch.status === ReconciliationStatus.NOT_FOUND) {
            summary.notFound += 1;
          } else {
            summary.divergent += 1;
          }
        } catch (error) {
          summary.errors.push({
            financialTitleId: title.id,
            message: error instanceof Error ? error.message : 'Erro inesperado ao conciliar titulo'
          });
        }
      }

      await auditService.recordEvent({
        entity: 'Reconciliation',
        entityId: `run:${job.id}`,
        action: AuditAction.PROCESS,
        userId: context.userId,
        origin: context.origin,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        after: summary,
        metadata: { operation: 'run_reconciliation', input }
      });

      await jobsService.finishJob(
        job.id,
        {
          status: summary.errors.length ? JobStatus.PARTIAL_SUCCESS : JobStatus.SUCCESS,
          processedCount: summary.processed,
          successCount: summary.matchedAutomatically,
          errorCount: summary.errors.length,
          metadata: summary
        },
        context
      );

      return summary;
    } catch (error) {
      await jobsService.finishJob(
        job.id,
        {
          status: JobStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Erro inesperado na conciliacao'
        },
        context
      );
      await auditService.recordEvent({
        entity: 'Reconciliation',
        entityId: `run:${job.id}`,
        action: AuditAction.ERROR,
        userId: context.userId,
        origin: context.origin,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        metadata: { errorMessage: error instanceof Error ? error.message : 'Erro inesperado' }
      });
      throw error;
    }
  }

  async list(filters: ReconciliationFilters) {
    const result = await this.reconciliationRepository.list(filters);
    return {
      data: result.data.map(mapReconciliation),
      pagination: result.pagination
    };
  }

  async getById(id: string) {
    const reconciliation = await this.reconciliationRepository.findById(id);

    if (!reconciliation) {
      throw new AppError('Conciliacao nao encontrada', 404, 'RECONCILIATION_NOT_FOUND');
    }

    const auditEvents = await auditService.listByEntity('Reconciliation', id);

    return {
      ...reconciliation,
      grossAmountDiff: reconciliation.grossAmountDiff?.toFixed(2) ?? null,
      netAmountDiff: reconciliation.netAmountDiff?.toFixed(2) ?? null,
      auditEvents: auditEvents.slice(0, 10)
    };
  }

  async listDivergences(filters: DivergenceFilters) {
    return this.reconciliationRepository.listDivergences(filters);
  }

  async approveManual(id: string, justification: string, context: RequestContext) {
    const before = await this.getExisting(id);
    const after = await this.reconciliationRepository.updateReconciliation(id, {
      status: ReconciliationStatus.MATCHED_MANUALLY,
      matchedBy: context.userName ?? context.userId ?? 'system',
      matchedAt: new Date(),
      justification,
      metadata: toInputJson({
        ...(isPlainObject(before.metadata) ? before.metadata : {}),
        manualApproval: { userName: context.userName, userId: context.userId, approvedAt: new Date().toISOString() }
      })
    });

    if (before.financialTitleId) {
      await this.applyTitleReconciled(before.financialTitleId, {
        receivable: before.redeReceivable,
        transaction: before.redeTransaction
      });
    }

    await this.reconciliationRepository.resolveDivergences(id, context.userName ?? context.userId, justification);
    await auditService.recordEvent({
      entity: 'Reconciliation',
      entityId: id,
      action: AuditAction.RECONCILE_MANUAL,
      userId: context.userId,
      origin: context.origin,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      before,
      after,
      justification
    });

    return mapReconciliation(after);
  }

  async reject(id: string, justification: string, context: RequestContext) {
    const before = await this.getExisting(id);
    const after = await this.reconciliationRepository.updateReconciliation(id, {
      status: ReconciliationStatus.DIVERGENT,
      justification,
      metadata: toInputJson({
        ...(isPlainObject(before.metadata) ? before.metadata : {}),
        rejection: { userName: context.userName, userId: context.userId, rejectedAt: new Date().toISOString(), justification }
      })
    });

    await auditService.recordEvent({
      entity: 'Reconciliation',
      entityId: id,
      action: AuditAction.UPDATE,
      userId: context.userId,
      origin: context.origin,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      before,
      after,
      justification
    });

    return mapReconciliation(after);
  }

  async reverse(id: string, reversalReason: string, context: RequestContext) {
    const before = await this.getExisting(id);
    const after = await this.reconciliationRepository.updateReconciliation(id, {
      status: ReconciliationStatus.REVERSED,
      reversedAt: new Date(),
      reversalReason
    });

    if (before.financialTitleId) {
      await this.reconciliationRepository.updateFinancialTitle(before.financialTitleId, {
        status: before.financialTitle?.paidAmount && toNumber(before.financialTitle.paidAmount) && toNumber(before.financialTitle.paidAmount)! > 0
          ? FinancialTitleStatus.PARTIALLY_PAID
          : FinancialTitleStatus.OPEN
      });
    }

    await auditService.recordEvent({
      entity: 'Reconciliation',
      entityId: id,
      action: AuditAction.REVERSE_RECONCILIATION,
      userId: context.userId,
      origin: context.origin,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      before,
      after,
      justification: reversalReason
    });

    return mapReconciliation(after);
  }

  private buildCandidates<TTransaction extends RedeTransactionLike & { transactionId: string }, TReceivable extends RedeReceivableLike & { transactionId: string }>(
    transactions: TTransaction[],
    receivables: TReceivable[]
  ): MatchCandidate[] {
    const candidates: MatchCandidate[] = [];

    for (const transaction of transactions) {
      const relatedReceivables = receivables.filter((receivable) => receivable.transactionId === transaction.transactionId);

      if (relatedReceivables.length) {
        for (const receivable of relatedReceivables) {
          candidates.push({ transaction, receivable });
        }
      } else {
        candidates.push({ transaction, receivable: null });
      }
    }

    for (const receivable of receivables) {
      if (!transactions.some((transaction) => transaction.transactionId === receivable.transactionId)) {
        candidates.push({ transaction: null, receivable });
      }
    }

    return candidates;
  }

  private async applyTitleReconciled(financialTitleId: string, match: Pick<BestMatchResult, 'receivable' | 'transaction'>) {
    const paidAmount = match.receivable?.grossAmount ?? match.transaction?.grossAmount;
    const paidAt = match.receivable?.actualPaymentDate ?? match.receivable?.expectedPaymentDate ?? match.transaction?.captureDate ?? new Date();

    await this.reconciliationRepository.updateFinancialTitle(financialTitleId, {
      status: FinancialTitleStatus.RECONCILED,
      paidAmount: paidAmount ? new Prisma.Decimal(paidAmount.toString()) : undefined,
      paidAt
    });
  }

  private decimalDiff(
    left: Prisma.Decimal | string | number | { toString(): string } | null | undefined,
    right: Prisma.Decimal | string | number | { toString(): string } | null | undefined
  ) {
    const diff = amountDiff(left, right);
    return diff === undefined ? undefined : new Prisma.Decimal(diff);
  }

  private async getExisting(id: string) {
    const reconciliation = await this.reconciliationRepository.findById(id);

    if (!reconciliation) {
      throw new AppError('Conciliacao nao encontrada', 404, 'RECONCILIATION_NOT_FOUND');
    }

    return reconciliation;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

export const reconciliationService = new ReconciliationService();
