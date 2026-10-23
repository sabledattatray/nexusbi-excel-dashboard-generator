/**
 * Safe SQL Identifier Quotation & Parameter Escaping
 * Authoritative source: PRD v9.0 Section 04 (D09, D10, D11) & Section 06 (Q12)
 */

const ALLOWLISTED_OPERATORS = new Set([
  'eq', 'neq', 'in', 'gt', 'gte', 'lt', 'lte', 'between', 'is_null', 'is_not_null',
]);

export function quoteIdent(ident: string): string {
  if (typeof ident !== 'string' || ident.length === 0) {
    throw new Error('Invalid SQL identifier: must be non-empty string');
  }
  if (ident.includes('\0')) {
    throw new Error('Security Error: Null byte in identifier');
  }
  // Escape double quotes by doubling them
  const escaped = ident.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function formatLiteral(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') {
    if (!Number.isFinite(val)) return 'NULL';
    return String(val);
  }
  if (typeof val === 'boolean') {
    return val ? 'TRUE' : 'FALSE';
  }
  if (val instanceof Date) {
    return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
  }
  // String literal: escape single quotes by doubling them
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

export function isAllowedOperator(op: string): boolean {
  return ALLOWLISTED_OPERATORS.has(op.toLowerCase());
}
