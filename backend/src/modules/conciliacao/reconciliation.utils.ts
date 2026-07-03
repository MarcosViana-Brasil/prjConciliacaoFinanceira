export const AMOUNT_TOLERANCE = 0.01;
export const DATE_TOLERANCE_DAYS = 1;
export const AUTO_MATCH_MIN_SCORE = 90;
export const REVIEW_MIN_SCORE = 70;
export const WEAK_MATCH_MIN_SCORE = 40;

import type { DecimalLike } from './reconciliation.types.js';

export function toNumber(value: DecimalLike | null | undefined) {
  if (value === null || value === undefined) return undefined;
  const parsed = Number(value.toString());
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function amountDiff(left: DecimalLike | null | undefined, right: DecimalLike | null | undefined) {
  const leftNumber = toNumber(left);
  const rightNumber = toNumber(right);

  if (leftNumber === undefined || rightNumber === undefined) return undefined;
  return Number((leftNumber - rightNumber).toFixed(2));
}

export function amountsMatch(left: DecimalLike | null | undefined, right: DecimalLike | null | undefined, tolerance = AMOUNT_TOLERANCE) {
  const diff = amountDiff(left, right);
  return diff !== undefined && Math.abs(diff) <= tolerance;
}

export function dateDiffDays(left: Date | string | null | undefined, right: Date | string | null | undefined) {
  const leftDate = toDate(left);
  const rightDate = toDate(right);

  if (!leftDate || !rightDate) return undefined;

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(leftDate).getTime() - startOfDay(rightDate).getTime()) / millisecondsPerDay);
}

export function datesWithin(left: Date | string | null | undefined, right: Date | string | null | undefined, toleranceDays = DATE_TOLERANCE_DAYS) {
  const diff = dateDiffDays(left, right);
  return diff !== undefined && Math.abs(diff) <= toleranceDays;
}

export function sameText(left?: string | null, right?: string | null) {
  if (!left || !right) return false;
  return left.trim().toUpperCase() === right.trim().toUpperCase();
}

export function clampScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

export function toDate(value: Date | string | null | undefined) {
  if (!value) return undefined;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function startOfDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}
