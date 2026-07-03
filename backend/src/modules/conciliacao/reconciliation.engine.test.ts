import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DivergenceSeverity,
  GatewayProvider,
  ReconciliationDivergenceType,
  ReconciliationMatchLevel,
  ReconciliationStatus
} from '@prisma/client';
import { calculateReconciliationScore } from './reconciliation.engine.js';
import type { FinancialTitleLike, RedeReceivableLike, RedeTransactionLike } from './reconciliation.types.js';

const baseTitle: FinancialTitleLike = {
  grossAmount: '100.00',
  netAmountExpected: '96.50',
  dueDate: '2026-07-02',
  issueDate: '2026-07-01',
  gatewayProvider: GatewayProvider.REDE,
  nsu: 'NSU123',
  authorizationCode: 'AUTH123',
  transactionId: 'TX123',
  tid: 'TID123',
  orderNumber: 'PED123',
  installmentNumber: 1,
  totalInstallments: 1,
  status: 'OPEN'
};

const baseTransaction: RedeTransactionLike = {
  grossAmount: '100.00',
  netAmount: '96.50',
  saleDate: '2026-07-01',
  transactionId: 'TX123',
  tid: 'TID123',
  nsu: 'NSU123',
  authorizationCode: 'AUTH123',
  orderNumber: 'PED123',
  installmentNumber: 1,
  totalInstallments: 1,
  status: 'CAPTURED'
};

const baseReceivable: RedeReceivableLike = {
  grossAmount: '100.00',
  netAmount: '96.50',
  expectedPaymentDate: '2026-07-02',
  transactionId: 'TX123',
  nsu: 'NSU123',
  authorizationCode: 'AUTH123',
  installmentNumber: 1,
  totalInstallments: 1,
  status: 'PENDING'
};

describe('reconciliation engine', () => {
  it('matches strongly by NSU + authorization + amount', () => {
    const result = calculateReconciliationScore({
      title: { ...baseTitle, transactionId: null, tid: null },
      transaction: { ...baseTransaction, transactionId: 'OTHER', tid: null },
      receivable: { ...baseReceivable, transactionId: 'OTHER' }
    });

    assert.equal(result.matchLevel, ReconciliationMatchLevel.STRONG);
    assert.equal(result.status, ReconciliationStatus.MATCHED_AUTOMATICALLY);
  });

  it('matches strongly by transactionId + amount', () => {
    const result = calculateReconciliationScore({
      title: { ...baseTitle, nsu: null, authorizationCode: null },
      transaction: { ...baseTransaction, nsu: null, authorizationCode: null },
      receivable: { ...baseReceivable, nsu: null, authorizationCode: null }
    });

    assert.equal(result.matchLevel, ReconciliationMatchLevel.STRONG);
    assert.equal(result.status, ReconciliationStatus.MATCHED_AUTOMATICALLY);
  });

  it('matches medium by order number + amount', () => {
    const result = calculateReconciliationScore({
      title: { ...baseTitle, transactionId: null, tid: null, nsu: null, authorizationCode: null, netAmountExpected: null },
      transaction: {
        ...baseTransaction,
        transactionId: 'OTHER',
        tid: null,
        nsu: null,
        authorizationCode: null,
        totalInstallments: null
      }
    });

    assert.equal(result.matchLevel, ReconciliationMatchLevel.MEDIUM);
  });

  it('matches weakly by amount + date', () => {
    const result = calculateReconciliationScore({
      title: {
        grossAmount: '100.00',
        dueDate: '2026-07-02',
        issueDate: '2026-07-01'
      },
      transaction: {
        grossAmount: '100.00',
        saleDate: '2026-07-01',
        transactionId: 'UNRELATED'
      }
    });

    assert.equal(result.matchLevel, ReconciliationMatchLevel.WEAK);
    assert.equal(result.status, ReconciliationStatus.DIVERGENT);
  });

  it('returns no match without candidates', () => {
    const result = calculateReconciliationScore({ title: baseTitle });

    assert.equal(result.score, 0);
    assert.equal(result.matchLevel, ReconciliationMatchLevel.NONE);
    assert.equal(result.status, ReconciliationStatus.NOT_FOUND);
  });

  it('detects value divergence', () => {
    const result = calculateReconciliationScore({
      title: baseTitle,
      transaction: { ...baseTransaction, grossAmount: '120.00' }
    });

    assert.ok(result.differences.some((difference) => difference.type === ReconciliationDivergenceType.VALUE_DIFFERENCE));
  });

  it('detects installment divergence', () => {
    const result = calculateReconciliationScore({
      title: baseTitle,
      transaction: { ...baseTransaction, installmentNumber: 2 }
    });

    assert.ok(result.differences.some((difference) => difference.type === ReconciliationDivergenceType.INSTALLMENT_DIFFERENCE));
  });

  it('detects date divergence', () => {
    const result = calculateReconciliationScore({
      title: baseTitle,
      transaction: { ...baseTransaction, saleDate: '2026-08-01' }
    });

    assert.ok(result.differences.some((difference) => difference.type === ReconciliationDivergenceType.DATE_DIFFERENCE));
  });

  it('limits score to 100', () => {
    const result = calculateReconciliationScore({
      title: baseTitle,
      transaction: baseTransaction,
      receivable: baseReceivable
    });

    assert.equal(result.score, 100);
  });

  it('auto reconciles only above minimum score without critical divergences', () => {
    const strong = calculateReconciliationScore({
      title: baseTitle,
      transaction: baseTransaction,
      receivable: baseReceivable
    });
    const blocked = calculateReconciliationScore({
      title: { ...baseTitle, status: 'CANCELED' },
      transaction: baseTransaction,
      receivable: baseReceivable
    });

    assert.equal(strong.status, ReconciliationStatus.MATCHED_AUTOMATICALLY);
    assert.equal(blocked.status, ReconciliationStatus.DIVERGENT);
    assert.ok(blocked.differences.some((difference) => difference.severity === DivergenceSeverity.CRITICAL));
  });
});
