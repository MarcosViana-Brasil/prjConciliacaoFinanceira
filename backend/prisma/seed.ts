import { createHash, randomBytes, scryptSync } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const roles = [
  { name: 'ADMIN', description: 'Acesso administrativo completo.' },
  { name: 'FINANCEIRO', description: 'Operacao financeira e conciliacao.' },
  { name: 'AUDITOR', description: 'Consulta de auditoria e rastreabilidade.' },
  { name: 'SOMENTE_LEITURA', description: 'Acesso somente leitura.' },
];

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');

  return `scrypt:${salt}:${hash}`;
}

function hashJson(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

const demoIds = {
  titleMatched: '11111111-1111-4111-8111-111111111111',
  titleDivergent: '22222222-2222-4222-8222-222222222222',
  titleOpen: '33333333-3333-4333-8333-333333333333',
  rawTransactions: '44444444-4444-4444-8444-444444444444',
  rawReceivables: '55555555-5555-4555-8555-555555555555',
  transactionMatched: '66666666-6666-4666-8666-666666666666',
  transactionDivergent: '77777777-7777-4777-8777-777777777777',
  receivableMatched: '88888888-8888-4888-8888-888888888888',
  receivableDivergent: '99999999-9999-4999-8999-999999999999',
  reconciliationMatched: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  reconciliationDivergent: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  divergenceValue: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  jobSeed: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
};

async function seedDemoFinancialData(adminUserId: string) {
  const rawTransactionsPayload = {
    provider: 'REDE',
    transactions: [
      {
        transactionId: 'REDE-TX-1001',
        tid: 'TID1001',
        nsu: 'NSU1001',
        authorizationCode: 'AUTH1001',
        orderNumber: 'PED-1001',
        saleDate: '2026-07-01T10:15:00.000Z',
        grossAmount: '100.00',
        netAmount: '96.50',
        status: 'CAPTURED'
      },
      {
        transactionId: 'REDE-TX-1002',
        tid: 'TID1002',
        nsu: 'NSU1002',
        authorizationCode: 'AUTH1002',
        orderNumber: 'PED-1002',
        saleDate: '2026-07-02T12:00:00.000Z',
        grossAmount: '300.00',
        netAmount: '289.50',
        status: 'CAPTURED'
      }
    ]
  };

  const rawReceivablesPayload = {
    provider: 'REDE',
    receivables: [
      {
        transactionId: 'REDE-TX-1001',
        expectedPaymentDate: '2026-07-31',
        grossAmount: '100.00',
        netAmount: '96.50',
        status: 'PENDING'
      },
      {
        transactionId: 'REDE-TX-1002',
        expectedPaymentDate: '2026-08-01',
        grossAmount: '100.00',
        netAmount: '95.80',
        status: 'ADJUSTED'
      }
    ]
  };

  const integration = await prisma.gatewayIntegration.upsert({
    where: { provider_name: { provider: 'REDE', name: 'Rede Sandbox Demo' } },
    update: {
      status: 'ACTIVE',
      baseUrl: 'https://sandbox.userede.example',
      merchantId: 'PV-001',
      config: { useMocks: true },
      metadata: { demo: true }
    },
    create: {
      provider: 'REDE',
      name: 'Rede Sandbox Demo',
      status: 'ACTIVE',
      baseUrl: 'https://sandbox.userede.example',
      merchantId: 'PV-001',
      config: { useMocks: true },
      metadata: { demo: true }
    }
  });

  await prisma.rawPayload.upsert({
    where: { id: demoIds.rawTransactions },
    update: {
      integrationId: integration.id,
      responsePayload: rawTransactionsPayload,
      rawPayload: rawTransactionsPayload,
      status: 'NORMALIZED',
      processedAt: new Date('2026-07-03T10:20:00.000Z')
    },
    create: {
      id: demoIds.rawTransactions,
      provider: 'REDE',
      integrationId: integration.id,
      endpoint: '/transactions',
      httpMethod: 'GET',
      requestParams: { startDate: '2026-07-01', endDate: '2026-07-03' },
      responsePayload: rawTransactionsPayload,
      responseStatus: 200,
      rawPayload: rawTransactionsPayload,
      payloadHash: hashJson(rawTransactionsPayload),
      status: 'NORMALIZED',
      processedAt: new Date('2026-07-03T10:20:00.000Z'),
      metadata: { demo: true }
    }
  });

  await prisma.rawPayload.upsert({
    where: { id: demoIds.rawReceivables },
    update: {
      integrationId: integration.id,
      responsePayload: rawReceivablesPayload,
      rawPayload: rawReceivablesPayload,
      status: 'NORMALIZED',
      processedAt: new Date('2026-07-03T10:25:00.000Z')
    },
    create: {
      id: demoIds.rawReceivables,
      provider: 'REDE',
      integrationId: integration.id,
      endpoint: '/receivables',
      httpMethod: 'GET',
      requestParams: { startDate: '2026-07-01', endDate: '2026-09-01' },
      responsePayload: rawReceivablesPayload,
      responseStatus: 200,
      rawPayload: rawReceivablesPayload,
      payloadHash: hashJson(rawReceivablesPayload),
      status: 'NORMALIZED',
      processedAt: new Date('2026-07-03T10:25:00.000Z'),
      metadata: { demo: true }
    }
  });

  await prisma.financialTitle.upsert({
    where: { id: demoIds.titleMatched },
    update: {
      status: 'RECONCILED',
      metadata: { demo: true, scenario: 'automatic_match' }
    },
    create: {
      id: demoIds.titleMatched,
      externalId: 'ERP-1001',
      titleNumber: 'TIT-1001',
      customerName: 'Cliente Aurora LTDA',
      customerDocument: '12345678000199',
      orderNumber: 'PED-1001',
      installmentNumber: 1,
      totalInstallments: 1,
      grossAmount: '100.00',
      netAmountExpected: '96.50',
      dueDate: new Date('2026-07-31T00:00:00.000Z'),
      issueDate: new Date('2026-07-01T00:00:00.000Z'),
      status: 'RECONCILED',
      gatewayProvider: 'REDE',
      gatewayReference: 'REDE-TX-1001',
      nsu: 'NSU1001',
      authorizationCode: 'AUTH1001',
      tid: 'TID1001',
      transactionId: 'REDE-TX-1001',
      metadata: { demo: true, scenario: 'automatic_match' }
    }
  });

  await prisma.financialTitle.upsert({
    where: { id: demoIds.titleDivergent },
    update: {
      status: 'DIVERGENT',
      metadata: { demo: true, scenario: 'value_divergence' }
    },
    create: {
      id: demoIds.titleDivergent,
      externalId: 'ERP-1002',
      titleNumber: 'TIT-1002-01',
      customerName: 'Comercial Horizonte SA',
      customerDocument: '98765432000188',
      orderNumber: 'PED-1002',
      installmentNumber: 1,
      totalInstallments: 3,
      grossAmount: '100.00',
      netAmountExpected: '96.50',
      dueDate: new Date('2026-08-01T00:00:00.000Z'),
      issueDate: new Date('2026-07-02T00:00:00.000Z'),
      status: 'DIVERGENT',
      gatewayProvider: 'REDE',
      gatewayReference: 'REDE-TX-1002',
      nsu: 'NSU1002',
      authorizationCode: 'AUTH1002',
      tid: 'TID1002',
      transactionId: 'REDE-TX-1002',
      metadata: { demo: true, scenario: 'value_divergence' }
    }
  });

  await prisma.financialTitle.upsert({
    where: { id: demoIds.titleOpen },
    update: {
      status: 'OPEN',
      metadata: { demo: true, scenario: 'awaiting_gateway' }
    },
    create: {
      id: demoIds.titleOpen,
      externalId: 'ERP-1003',
      titleNumber: 'TIT-1003',
      customerName: 'Mercado Serra Azul',
      customerDocument: '11222333000144',
      orderNumber: 'PED-1003',
      installmentNumber: 1,
      totalInstallments: 1,
      grossAmount: '250.00',
      netAmountExpected: '241.25',
      dueDate: new Date('2026-08-15T00:00:00.000Z'),
      issueDate: new Date('2026-07-03T00:00:00.000Z'),
      status: 'OPEN',
      gatewayProvider: 'REDE',
      metadata: { demo: true, scenario: 'awaiting_gateway' }
    }
  });

  await prisma.redeTransaction.upsert({
    where: { id: demoIds.transactionMatched },
    update: {
      rawPayloadId: demoIds.rawTransactions,
      integrationId: integration.id,
      status: 'CAPTURED',
      metadata: { demo: true }
    },
    create: {
      id: demoIds.transactionMatched,
      rawPayloadId: demoIds.rawTransactions,
      integrationId: integration.id,
      transactionId: 'REDE-TX-1001',
      tid: 'TID1001',
      nsu: 'NSU1001',
      authorizationCode: 'AUTH1001',
      orderNumber: 'PED-1001',
      saleDate: new Date('2026-07-01T10:15:00.000Z'),
      captureDate: new Date('2026-07-01T10:16:00.000Z'),
      grossAmount: '100.00',
      netAmount: '96.50',
      feeAmount: '3.50',
      installmentNumber: 1,
      totalInstallments: 1,
      brand: 'VISA',
      paymentMethod: 'CREDIT',
      status: 'CAPTURED',
      establishmentCode: 'PV-001',
      metadata: { demo: true }
    }
  });

  await prisma.redeTransaction.upsert({
    where: { id: demoIds.transactionDivergent },
    update: {
      rawPayloadId: demoIds.rawTransactions,
      integrationId: integration.id,
      status: 'CAPTURED',
      metadata: { demo: true }
    },
    create: {
      id: demoIds.transactionDivergent,
      rawPayloadId: demoIds.rawTransactions,
      integrationId: integration.id,
      transactionId: 'REDE-TX-1002',
      tid: 'TID1002',
      nsu: 'NSU1002',
      authorizationCode: 'AUTH1002',
      orderNumber: 'PED-1002',
      saleDate: new Date('2026-07-02T12:00:00.000Z'),
      captureDate: new Date('2026-07-02T12:01:00.000Z'),
      grossAmount: '300.00',
      netAmount: '289.50',
      feeAmount: '10.50',
      installmentNumber: 1,
      totalInstallments: 3,
      brand: 'MASTERCARD',
      paymentMethod: 'CREDIT_INSTALLMENTS',
      status: 'CAPTURED',
      establishmentCode: 'PV-001',
      metadata: { demo: true }
    }
  });

  await prisma.redeReceivable.upsert({
    where: { id: demoIds.receivableMatched },
    update: {
      rawPayloadId: demoIds.rawReceivables,
      redeTransactionId: demoIds.transactionMatched,
      status: 'PENDING',
      metadata: { demo: true }
    },
    create: {
      id: demoIds.receivableMatched,
      rawPayloadId: demoIds.rawReceivables,
      redeTransactionId: demoIds.transactionMatched,
      transactionId: 'REDE-TX-1001',
      nsu: 'NSU1001',
      authorizationCode: 'AUTH1001',
      expectedPaymentDate: new Date('2026-07-31T00:00:00.000Z'),
      grossAmount: '100.00',
      netAmount: '96.50',
      feeAmount: '3.50',
      adjustmentAmount: '0.00',
      installmentNumber: 1,
      totalInstallments: 1,
      status: 'PENDING',
      bankCode: '341',
      agency: '0001',
      account: '12345-6',
      metadata: { demo: true }
    }
  });

  await prisma.redeReceivable.upsert({
    where: { id: demoIds.receivableDivergent },
    update: {
      rawPayloadId: demoIds.rawReceivables,
      redeTransactionId: demoIds.transactionDivergent,
      status: 'ADJUSTED',
      metadata: { demo: true }
    },
    create: {
      id: demoIds.receivableDivergent,
      rawPayloadId: demoIds.rawReceivables,
      redeTransactionId: demoIds.transactionDivergent,
      transactionId: 'REDE-TX-1002',
      nsu: 'NSU1002',
      authorizationCode: 'AUTH1002',
      expectedPaymentDate: new Date('2026-08-01T00:00:00.000Z'),
      actualPaymentDate: new Date('2026-08-01T00:00:00.000Z'),
      grossAmount: '100.00',
      netAmount: '95.80',
      feeAmount: '3.50',
      adjustmentAmount: '-0.70',
      installmentNumber: 1,
      totalInstallments: 3,
      status: 'ADJUSTED',
      bankCode: '341',
      agency: '0001',
      account: '12345-6',
      metadata: { demo: true }
    }
  });

  await prisma.reconciliation.upsert({
    where: { id: demoIds.reconciliationMatched },
    update: {
      status: 'MATCHED_AUTOMATICALLY',
      matchLevel: 'STRONG',
      score: 100,
      metadata: { demo: true }
    },
    create: {
      id: demoIds.reconciliationMatched,
      financialTitleId: demoIds.titleMatched,
      redeTransactionId: demoIds.transactionMatched,
      redeReceivableId: demoIds.receivableMatched,
      provider: 'REDE',
      status: 'MATCHED_AUTOMATICALLY',
      matchLevel: 'STRONG',
      score: 100,
      matchedBy: 'seed-demo',
      matchedAt: new Date('2026-07-03T11:00:00.000Z'),
      grossAmountDiff: '0.00',
      netAmountDiff: '0.00',
      dateDiffDays: 0,
      ruleApplied: 'transactionId+nsu+amount',
      justification: 'Conciliação demo automática.',
      metadata: { demo: true }
    }
  });

  await prisma.reconciliation.upsert({
    where: { id: demoIds.reconciliationDivergent },
    update: {
      status: 'DIVERGENT',
      matchLevel: 'MEDIUM',
      score: 82,
      metadata: { demo: true }
    },
    create: {
      id: demoIds.reconciliationDivergent,
      financialTitleId: demoIds.titleDivergent,
      redeTransactionId: demoIds.transactionDivergent,
      redeReceivableId: demoIds.receivableDivergent,
      provider: 'REDE',
      status: 'DIVERGENT',
      matchLevel: 'MEDIUM',
      score: 82,
      matchedBy: 'seed-demo',
      matchedAt: new Date('2026-07-03T11:05:00.000Z'),
      grossAmountDiff: '0.00',
      netAmountDiff: '0.70',
      dateDiffDays: 0,
      ruleApplied: 'transactionId+nsu+installment',
      justification: 'Conciliação demo com diferença no valor líquido.',
      metadata: { demo: true }
    }
  });

  await prisma.reconciliationDivergence.upsert({
    where: { id: demoIds.divergenceValue },
    update: {
      resolved: false,
      metadata: { demo: true }
    },
    create: {
      id: demoIds.divergenceValue,
      reconciliationId: demoIds.reconciliationDivergent,
      financialTitleId: demoIds.titleDivergent,
      redeReceivableId: demoIds.receivableDivergent,
      divergenceType: 'VALUE_DIFFERENCE',
      description: 'Valor líquido esperado no título difere do valor líquido informado pela Rede.',
      expectedValue: { netAmountExpected: '96.50' },
      actualValue: { netAmount: '95.80' },
      severity: 'MEDIUM',
      metadata: { demo: true }
    }
  });

  await prisma.jobExecution.upsert({
    where: { id: demoIds.jobSeed },
    update: {
      status: 'SUCCESS',
      processedCount: 7,
      successCount: 6,
      errorCount: 1,
      metadata: { demo: true }
    },
    create: {
      id: demoIds.jobSeed,
      jobName: 'seed_demo_financeiro',
      status: 'SUCCESS',
      startedAt: new Date('2026-07-03T11:10:00.000Z'),
      finishedAt: new Date('2026-07-03T11:10:03.000Z'),
      durationMs: 3000,
      processedCount: 7,
      successCount: 6,
      errorCount: 1,
      metadata: { demo: true }
    }
  });

  const auditHash = hashJson({ entity: 'seed', entityId: 'demo-financeiro', action: 'IMPORT' });
  await prisma.auditEvent.upsert({
    where: { eventHash: auditHash },
    update: {
      after: { demoIds },
      metadata: { demo: true }
    },
    create: {
      entity: 'seed',
      entityId: 'demo-financeiro',
      action: 'IMPORT',
      userId: adminUserId,
      origin: 'prisma-seed',
      after: { demoIds },
      justification: 'Carga demo para visualização do painel MVP.',
      metadata: { demo: true },
      eventHash: auditHash
    }
  });
}

async function main() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description, deletedAt: null },
      create: role,
    });
  }

  const adminName = requireEnv('ADMIN_NAME');
  const adminEmail = requireEnv('ADMIN_EMAIL').toLowerCase();
  const adminPassword = requireEnv('ADMIN_PASSWORD');

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: 'ADMIN' },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      status: 'ACTIVE',
      deletedAt: null,
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      status: 'ACTIVE',
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  await seedDemoFinancialData(adminUser.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
