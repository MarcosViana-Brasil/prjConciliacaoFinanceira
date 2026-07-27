'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { api } from '@/lib/api';
import { gatewayProviderOptions } from '@/lib/constants';
import { ApiError, getErrorMessage } from '@/lib/errors';

type FormValues = {
  titleNumber: string;
  externalId: string;
  customerName: string;
  customerDocument: string;
  orderNumber: string;
  installmentNumber: string;
  totalInstallments: string;
  grossAmount: string;
  netAmountExpected: string;
  dueDate: string;
  issueDate: string;
  gatewayProvider: string;
  nsu: string;
  authorizationCode: string;
  tid: string;
  transactionId: string;
  justification: string;
};

type ValidationDetail = {
  path?: string;
  message?: string;
};

const fieldLabels: Record<keyof FormValues, string> = {
  titleNumber: 'Número do título',
  externalId: 'ID externo',
  customerName: 'Cliente',
  customerDocument: 'Documento',
  orderNumber: 'Pedido',
  installmentNumber: 'Parcela',
  totalInstallments: 'Total de parcelas',
  grossAmount: 'Valor bruto',
  netAmountExpected: 'Valor líquido esperado',
  dueDate: 'Vencimento',
  issueDate: 'Emissão',
  gatewayProvider: 'Gateway',
  nsu: 'NSU',
  authorizationCode: 'Autorização',
  tid: 'TID',
  transactionId: 'Transaction ID',
  justification: 'Justificativa'
};

const apiFieldPaths: Record<string, keyof FormValues> = Object.keys(fieldLabels).reduce(
  (acc, field) => ({ ...acc, [field]: field as keyof FormValues }),
  {} as Record<string, keyof FormValues>
);

const moneyPattern = /^\d+([,.]\d{1,2})?$/;

const initialValues: FormValues = {
  titleNumber: '',
  externalId: '',
  customerName: '',
  customerDocument: '',
  orderNumber: '',
  installmentNumber: '',
  totalInstallments: '',
  grossAmount: '',
  netAmountExpected: '',
  dueDate: '',
  issueDate: '',
  gatewayProvider: 'REDE',
  nsu: '',
  authorizationCode: '',
  tid: '',
  transactionId: '',
  justification: ''
};

export function FinancialTitleForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitError, setSubmitError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof FormValues, string>> = {};
    if (!values.titleNumber.trim()) nextErrors.titleNumber = 'Informe o número do título';
    if (!values.customerName.trim()) nextErrors.customerName = 'Informe o cliente';
    if (!values.grossAmount.trim()) nextErrors.grossAmount = 'Informe o valor bruto';
    if (values.grossAmount.trim() && !moneyPattern.test(values.grossAmount.trim())) {
      nextErrors.grossAmount = 'Informe um valor monetário válido, como 120,00';
    }
    if (values.netAmountExpected.trim() && !moneyPattern.test(values.netAmountExpected.trim())) {
      nextErrors.netAmountExpected = 'Informe um valor monetário válido, como 100,00';
    }
    if (!values.dueDate) nextErrors.dueDate = 'Informe o vencimento';
    if (
      values.installmentNumber &&
      values.totalInstallments &&
      Number(values.totalInstallments) < Number(values.installmentNumber)
    ) {
      nextErrors.totalInstallments = 'Total de parcelas deve ser maior ou igual à parcela';
    }
    if (!values.justification.trim()) nextErrors.justification = 'Informe a justificativa';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    setSubmitError(undefined);
    try {
      await api.post('/financial-titles', sanitizePayload(values));
      router.push('/titulos');
    } catch (error) {
      const apiErrors = getApiFieldErrors(error);

      if (Object.keys(apiErrors).length) {
        setErrors((current) => ({ ...current, ...apiErrors }));
        setSubmitError('Corrija os campos destacados e tente novamente.');
      } else {
        setSubmitError(getErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardBody>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          {submitError ? <div className="md:col-span-2 rounded-md border border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] p-3 text-sm text-[var(--app-danger-text)]">{submitError}</div> : null}
          <Field label="Número do título" error={errors.titleNumber}>
            <Input value={values.titleNumber} onChange={(event) => updateField('titleNumber', event.target.value)} />
          </Field>
          <Field label="ID externo">
            <Input value={values.externalId} onChange={(event) => updateField('externalId', event.target.value)} />
          </Field>
          <Field label="Cliente" error={errors.customerName}>
            <Input value={values.customerName} onChange={(event) => updateField('customerName', event.target.value)} />
          </Field>
          <Field label="Documento">
            <Input value={values.customerDocument} onChange={(event) => updateField('customerDocument', event.target.value)} />
          </Field>
          <Field label="Pedido">
            <Input value={values.orderNumber} onChange={(event) => updateField('orderNumber', event.target.value)} />
          </Field>
          <Field label="Valor bruto" error={errors.grossAmount}>
            <Input value={values.grossAmount} onChange={(event) => updateField('grossAmount', event.target.value)} />
          </Field>
          <Field label="Valor líquido esperado" error={errors.netAmountExpected}>
            <Input value={values.netAmountExpected} onChange={(event) => updateField('netAmountExpected', event.target.value)} />
          </Field>
          <Field label="Vencimento" error={errors.dueDate}>
            <Input type="date" value={values.dueDate} onChange={(event) => updateField('dueDate', event.target.value)} />
          </Field>
          <Field label="Emissão">
            <Input type="date" value={values.issueDate} onChange={(event) => updateField('issueDate', event.target.value)} />
          </Field>
          <Field label="Gateway">
            <Select options={gatewayProviderOptions} value={values.gatewayProvider} onChange={(event) => updateField('gatewayProvider', event.target.value)} />
          </Field>
          <Field label="Parcela">
            <Input type="number" value={values.installmentNumber} onChange={(event) => updateField('installmentNumber', event.target.value)} />
          </Field>
          <Field label="Total de parcelas">
            <Input type="number" value={values.totalInstallments} onChange={(event) => updateField('totalInstallments', event.target.value)} />
          </Field>
          <Field label="NSU">
            <Input value={values.nsu} onChange={(event) => updateField('nsu', event.target.value)} />
          </Field>
          <Field label="Autorização">
            <Input value={values.authorizationCode} onChange={(event) => updateField('authorizationCode', event.target.value)} />
          </Field>
          <Field label="TID">
            <Input value={values.tid} onChange={(event) => updateField('tid', event.target.value)} />
          </Field>
          <Field label="Transaction ID">
            <Input value={values.transactionId} onChange={(event) => updateField('transactionId', event.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Justificativa" error={errors.justification}>
              <Input value={values.justification} onChange={(event) => updateField('justification', event.target.value)} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Button disabled={isSubmitting} type="submit">
              Salvar título
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

function sanitizePayload(values: FormValues) {
  return Object.fromEntries(
    Object.entries(values)
      .map(([key, value]) => {
        if (['installmentNumber', 'totalInstallments'].includes(key)) {
          return [key, value ? Number(value) : undefined];
        }
        if (['grossAmount', 'netAmountExpected'].includes(key)) {
          return [key, value.trim() ? value.trim().replace(',', '.') : undefined];
        }
        return [key, value.trim() || undefined];
      })
      .filter(([, value]) => value !== undefined)
  );
}

function getApiFieldErrors(error: unknown) {
  const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
  if (!(error instanceof ApiError) || !Array.isArray(error.details)) return fieldErrors;

  for (const detail of error.details as ValidationDetail[]) {
    const field = detail.path ? apiFieldPaths[detail.path] : undefined;
    if (!field) continue;

    fieldErrors[field] = formatApiFieldMessage(field, detail.message);
  }

  return fieldErrors;
}

function formatApiFieldMessage(field: keyof FormValues, message?: string) {
  if (message === 'Valor monetario invalido') {
    return `${fieldLabels[field]} deve ser um valor monetário válido, como 120,00`;
  }

  if (message?.includes('Required') || message?.includes('Invalid input')) {
    return `${fieldLabels[field]} inválido`;
  }

  return message ? `${fieldLabels[field]}: ${message}` : `${fieldLabels[field]} inválido`;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-[var(--app-subtle)]">{label}</span>
      {children}
      {error ? <span className="text-xs text-rose-700">{error}</span> : null}
    </label>
  );
}
