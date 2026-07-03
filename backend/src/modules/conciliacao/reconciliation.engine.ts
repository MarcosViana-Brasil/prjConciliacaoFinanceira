import {
  DivergenceSeverity,
  FinancialTitleStatus,
  ReceivableStatus,
  ReconciliationDivergenceType,
  ReconciliationMatchLevel,
  ReconciliationStatus,
  RedeTransactionStatus
} from '@prisma/client';
import { RECONCILIATION_RULES, RECONCILIATION_WEIGHTS } from './reconciliation.rules.js';
import type {
  BestMatchResult,
  FinancialTitleLike,
  MatchCandidate,
  ReconciliationDifference,
  ReconciliationScoreResult,
  RedeReceivableLike,
  RedeTransactionLike
} from './reconciliation.types.js';
import {
  amountDiff,
  amountsMatch,
  AUTO_MATCH_MIN_SCORE,
  clampScore,
  dateDiffDays,
  datesWithin,
  REVIEW_MIN_SCORE,
  sameText,
  WEAK_MATCH_MIN_SCORE
} from './reconciliation.utils.js';

export function calculateReconciliationScore(input: {
  title: FinancialTitleLike;
  transaction?: RedeTransactionLike | null;
  receivable?: RedeReceivableLike | null;
}): ReconciliationScoreResult {
  if (!input.transaction && !input.receivable) {
    return {
      score: 0,
      matchLevel: ReconciliationMatchLevel.NONE,
      status: ReconciliationStatus.NOT_FOUND,
      ruleApplied: RECONCILIATION_RULES.noMatch,
      differences: [
        {
          type: ReconciliationDivergenceType.RECEIVABLE_NOT_FOUND,
          description: 'Nenhum candidato encontrado para o titulo financeiro',
          severity: DivergenceSeverity.HIGH
        }
      ]
    };
  }

  const candidate = input.transaction ?? input.receivable;
  const scoreParts = calculateScoreParts(input.title, input.transaction, input.receivable);
  const hasWeakAmountDateMatch =
    amountsMatch(input.title.grossAmount, candidate?.grossAmount) &&
    (datesWithin(input.title.issueDate ?? input.title.dueDate, input.transaction?.saleDate) ||
      datesWithin(input.title.dueDate, input.receivable?.expectedPaymentDate));
  const score = clampScore(hasWeakAmountDateMatch ? Math.max(scoreParts.total, WEAK_MATCH_MIN_SCORE) : scoreParts.total);
  const differences = detectDivergences(input.title, input.transaction, input.receivable);
  const matchLevel = getMatchLevel(score);
  const hasCriticalDivergence = differences.some((difference) => difference.severity === DivergenceSeverity.CRITICAL);
  const autoAllowed =
    score >= AUTO_MATCH_MIN_SCORE &&
    !hasCriticalDivergence &&
    input.title.status !== FinancialTitleStatus.CANCELED &&
    !input.title.deletedAt &&
    amountsMatch(input.title.grossAmount, candidate?.grossAmount);

  return {
    score,
    matchLevel,
    status: autoAllowed
      ? ReconciliationStatus.MATCHED_AUTOMATICALLY
      : score >= WEAK_MATCH_MIN_SCORE
        ? ReconciliationStatus.DIVERGENT
        : ReconciliationStatus.NOT_FOUND,
    ruleApplied: inferRuleApplied(input.title, input.transaction, input.receivable, score),
    differences: autoAllowed ? differences.filter((difference) => difference.severity !== DivergenceSeverity.LOW) : differences
  };
}

export function findBestMatchForTitle(title: FinancialTitleLike, candidates: MatchCandidate[]): BestMatchResult {
  let best: BestMatchResult | undefined;

  for (const candidate of candidates) {
    const result = calculateReconciliationScore({
      title,
      transaction: candidate.transaction,
      receivable: candidate.receivable
    });

    if (!best || result.score > best.score) {
      best = {
        ...result,
        transaction: candidate.transaction,
        receivable: candidate.receivable
      };
    }
  }

  return (
    best ?? {
      ...calculateReconciliationScore({ title }),
      transaction: null,
      receivable: null
    }
  );
}

export function detectDivergences(
  title: FinancialTitleLike,
  transaction?: RedeTransactionLike | null,
  receivable?: RedeReceivableLike | null
): ReconciliationDifference[] {
  const candidate = transaction ?? receivable;
  const differences: ReconciliationDifference[] = [];

  if (!candidate) {
    differences.push({
      type: ReconciliationDivergenceType.RECEIVABLE_NOT_FOUND,
      description: 'Recebivel/transacao nao encontrado para conciliacao',
      severity: DivergenceSeverity.HIGH
    });
    return differences;
  }

  if (!amountsMatch(title.grossAmount, candidate.grossAmount)) {
    differences.push({
      type: ReconciliationDivergenceType.VALUE_DIFFERENCE,
      description: 'Valor bruto do titulo difere do candidato',
      expectedValue: title.grossAmount.toString(),
      actualValue: candidate.grossAmount.toString(),
      severity: DivergenceSeverity.HIGH
    });
  }

  const netCandidate = receivable?.netAmount ?? transaction?.netAmount;
  if (title.netAmountExpected && netCandidate && !amountsMatch(title.netAmountExpected, netCandidate)) {
    differences.push({
      type: ReconciliationDivergenceType.VALUE_DIFFERENCE,
      description: 'Valor liquido esperado difere do valor liquido do candidato',
      expectedValue: title.netAmountExpected.toString(),
      actualValue: netCandidate.toString(),
      severity: DivergenceSeverity.MEDIUM
    });
  }

  if (
    title.installmentNumber &&
    candidate.installmentNumber &&
    title.installmentNumber !== candidate.installmentNumber
  ) {
    differences.push({
      type: ReconciliationDivergenceType.INSTALLMENT_DIFFERENCE,
      description: 'Parcela do titulo difere da parcela do candidato',
      expectedValue: title.installmentNumber,
      actualValue: candidate.installmentNumber,
      severity: DivergenceSeverity.MEDIUM
    });
  }

  const candidateDate = transaction?.saleDate ?? receivable?.expectedPaymentDate;
  const dateDifference = dateDiffDays(title.dueDate ?? title.issueDate, candidateDate);
  if (dateDifference !== undefined && Math.abs(dateDifference) > 1) {
    differences.push({
      type: ReconciliationDivergenceType.DATE_DIFFERENCE,
      description: 'Data do titulo fora da tolerancia em relacao ao candidato',
      expectedValue: title.dueDate ?? title.issueDate,
      actualValue: candidateDate,
      severity: Math.abs(dateDifference) > 7 ? DivergenceSeverity.HIGH : DivergenceSeverity.MEDIUM
    });
  }

  if (
    title.status === FinancialTitleStatus.CANCELED ||
    transaction?.status === RedeTransactionStatus.CANCELED ||
    transaction?.status === RedeTransactionStatus.REFUNDED ||
    receivable?.status === ReceivableStatus.CANCELED
  ) {
    differences.push({
      type: ReconciliationDivergenceType.STATUS_DIFFERENCE,
      description: 'Status impede conciliacao automatica segura',
      expectedValue: title.status,
      actualValue: transaction?.status ?? receivable?.status,
      severity: DivergenceSeverity.CRITICAL
    });
  }

  return differences;
}

function calculateScoreParts(title: FinancialTitleLike, transaction?: RedeTransactionLike | null, receivable?: RedeReceivableLike | null) {
  const candidate = transaction ?? receivable;
  let total = 0;

  if (!candidate) return { total };
  if (sameText(title.transactionId, transaction?.transactionId ?? receivable?.transactionId)) total += RECONCILIATION_WEIGHTS.transactionId;
  if (sameText(title.tid, transaction?.tid)) total += RECONCILIATION_WEIGHTS.tid;
  if (sameText(title.nsu, transaction?.nsu ?? receivable?.nsu)) total += RECONCILIATION_WEIGHTS.nsu;
  if (sameText(title.authorizationCode, transaction?.authorizationCode ?? receivable?.authorizationCode)) total += RECONCILIATION_WEIGHTS.authorizationCode;
  if (sameText(title.orderNumber, transaction?.orderNumber)) total += RECONCILIATION_WEIGHTS.orderNumber;
  if (amountsMatch(title.grossAmount, candidate.grossAmount)) total += RECONCILIATION_WEIGHTS.grossAmount;
  if (title.netAmountExpected && amountsMatch(title.netAmountExpected, transaction?.netAmount ?? receivable?.netAmount)) {
    total += RECONCILIATION_WEIGHTS.netAmount;
  }
  if (title.installmentNumber && candidate.installmentNumber && title.installmentNumber === candidate.installmentNumber) {
    total += RECONCILIATION_WEIGHTS.installmentNumber;
  }
  if (title.totalInstallments && candidate.totalInstallments && title.totalInstallments === candidate.totalInstallments) {
    total += RECONCILIATION_WEIGHTS.totalInstallments;
  }
  if (datesWithin(title.issueDate ?? title.dueDate, transaction?.saleDate)) total += RECONCILIATION_WEIGHTS.saleDate;
  if (datesWithin(title.dueDate, receivable?.expectedPaymentDate)) total += RECONCILIATION_WEIGHTS.expectedPaymentDate;
  if (title.gatewayProvider) total += RECONCILIATION_WEIGHTS.gatewayProvider;

  return { total };
}

function getMatchLevel(score: number) {
  if (score >= AUTO_MATCH_MIN_SCORE) return ReconciliationMatchLevel.STRONG;
  if (score >= REVIEW_MIN_SCORE) return ReconciliationMatchLevel.MEDIUM;
  if (score >= WEAK_MATCH_MIN_SCORE) return ReconciliationMatchLevel.WEAK;
  return ReconciliationMatchLevel.NONE;
}

function inferRuleApplied(
  title: FinancialTitleLike,
  transaction?: RedeTransactionLike | null,
  receivable?: RedeReceivableLike | null,
  score = 0
) {
  const candidate = transaction ?? receivable;

  if (!candidate) return RECONCILIATION_RULES.noMatch;
  if (sameText(title.nsu, transaction?.nsu ?? receivable?.nsu) && sameText(title.authorizationCode, transaction?.authorizationCode ?? receivable?.authorizationCode) && amountsMatch(title.grossAmount, candidate.grossAmount)) {
    return RECONCILIATION_RULES.strongNsuAuthorizationAmount;
  }
  if (sameText(title.transactionId, transaction?.transactionId ?? receivable?.transactionId) && amountsMatch(title.grossAmount, candidate.grossAmount)) {
    return RECONCILIATION_RULES.strongTransactionAmount;
  }
  if (sameText(title.tid, transaction?.tid) && amountsMatch(title.grossAmount, candidate.grossAmount)) {
    return RECONCILIATION_RULES.strongTidAmount;
  }
  if (sameText(title.orderNumber, transaction?.orderNumber) && amountsMatch(title.grossAmount, candidate.grossAmount) && title.installmentNumber === candidate.installmentNumber) {
    return RECONCILIATION_RULES.strongOrderAmountInstallment;
  }
  if (sameText(title.orderNumber, transaction?.orderNumber) && amountsMatch(title.grossAmount, candidate.grossAmount)) {
    return RECONCILIATION_RULES.mediumOrderAmount;
  }
  if (title.netAmountExpected && amountsMatch(title.netAmountExpected, transaction?.netAmount ?? receivable?.netAmount) && datesWithin(title.dueDate, receivable?.expectedPaymentDate)) {
    return RECONCILIATION_RULES.mediumNetExpectedReceivable;
  }
  if (score >= WEAK_MATCH_MIN_SCORE) return RECONCILIATION_RULES.weakAmountDate;

  return RECONCILIATION_RULES.noMatch;
}
