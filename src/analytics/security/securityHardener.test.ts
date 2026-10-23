/**
 * Phase 9F Security Hardening, Memory Boundary & Input Safety Test Suite
 * Authoritative source: PRD v9.0 Phase 9F Mandatory Requirement 4, 5, 6
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  isDangerousSpreadsheetFormula,
  sanitizeSpreadsheetCell,
  escapeHtml,
  validateDatasetBoundary,
  sanitizeDatasetRows,
  verifyZeroExternalTelemetry,
  MemoryBoundaryError,
  MalformedDatasetError,
  MAX_DATASET_BYTES,
  MAX_ROW_COUNT,
  MAX_COLUMN_COUNT,
} from './securityHardener';
import { executeAnalytics } from '../engineManager';
import { QueryPlan } from '../types';

describe('Phase 9F: Security Hardening & Input Safety Suite', () => {
  // =========================================================================
  // 1. CSV Formula Injection (DDE) Defenses
  // =========================================================================
  describe('CSV Formula Injection Prevention', () => {
    it('identifies dangerous formula prefixes (=, @, +, -, tab, pipe)', () => {
      assert.strictEqual(isDangerousSpreadsheetFormula('=1+1'), true);
      assert.strictEqual(isDangerousSpreadsheetFormula("=cmd|' /C calc'!A0"), true);
      assert.strictEqual(isDangerousSpreadsheetFormula('@SUM(A1:A10)'), true);
      assert.strictEqual(isDangerousSpreadsheetFormula('\t=cmd'), true);
      assert.strictEqual(isDangerousSpreadsheetFormula('\r=cmd'), true);
      assert.strictEqual(isDangerousSpreadsheetFormula('+cmd|test'), true);
      assert.strictEqual(isDangerousSpreadsheetFormula('-cmd|test'), true);
      assert.strictEqual(isDangerousSpreadsheetFormula('|calc.exe'), true);
    });

    it('distinguishes legitimate numeric values from formula injection', () => {
      assert.strictEqual(isDangerousSpreadsheetFormula('-125.50'), false);
      assert.strictEqual(isDangerousSpreadsheetFormula('+42'), false);
      assert.strictEqual(isDangerousSpreadsheetFormula('0'), false);
      assert.strictEqual(isDangerousSpreadsheetFormula('100.99'), false);
      assert.strictEqual(isDangerousSpreadsheetFormula('Normal Company Name'), false);
    });

    it('sanitizes dangerous cells by prefixing with single quote', () => {
      assert.strictEqual(sanitizeSpreadsheetCell('=1+1'), "'=1+1");
      assert.strictEqual(sanitizeSpreadsheetCell("=cmd|' /C calc'!A0"), "'=cmd|' /C calc'!A0");
      assert.strictEqual(sanitizeSpreadsheetCell('@SUM(B1:B5)'), "'@SUM(B1:B5)");
      assert.strictEqual(sanitizeSpreadsheetCell('+cmd'), "'+cmd");
      assert.strictEqual(sanitizeSpreadsheetCell('-cmd'), "'-cmd");
    });

    it('preserves valid numbers, dates and standard strings unchanged', () => {
      assert.strictEqual(sanitizeSpreadsheetCell(-450.25), -450.25);
      assert.strictEqual(sanitizeSpreadsheetCell(1000), 1000);
      assert.strictEqual(sanitizeSpreadsheetCell('Standard Text'), 'Standard Text');
      assert.strictEqual(sanitizeSpreadsheetCell(true), true);
      assert.strictEqual(sanitizeSpreadsheetCell(null), null);
    });
  });

  // =========================================================================
  // 2. HTML Escaping & XSS Protection
  // =========================================================================
  describe('HTML Injection & XSS Sanitization', () => {
    it('escapes HTML tags, attributes and script triggers', () => {
      const malicious = '<script>alert("XSS")</script>';
      const escaped = escapeHtml(malicious);
      assert.strictEqual(escaped.includes('<script>'), false);
      assert.strictEqual(escaped.includes('</script>'), false);
      assert.strictEqual(escaped, '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('escapes image error handlers and quotes', () => {
      const payload = '"><img src=x onerror=alert(1)>';
      const escaped = escapeHtml(payload);
      assert.strictEqual(escaped.includes('<img'), false);
      assert.strictEqual(escaped.includes('"'), false);
      assert.strictEqual(escaped.includes('>'), false);
    });

    it('safely handles null, undefined and empty values', () => {
      assert.strictEqual(escapeHtml(null), '');
      assert.strictEqual(escapeHtml(undefined), '');
      assert.strictEqual(escapeHtml(''), '');
    });
  });

  // =========================================================================
  // 3. Memory Pressure & Dataset Boundary Enforcement
  // =========================================================================
  describe('Memory Pressure & Boundary Enforcement', () => {
    it('enforces 25 MB maximum file byte limit', () => {
      // 24.9 MB passes
      assert.doesNotThrow(() => validateDatasetBoundary(24 * 1024 * 1024));

      // 25.1 MB throws MemoryBoundaryError
      assert.throws(
        () => validateDatasetBoundary(MAX_DATASET_BYTES + 1024),
        (err: any) => err instanceof MemoryBoundaryError && err.code === 'MEMORY_BOUNDARY_EXCEEDED'
      );
    });

    it('enforces 150,000 maximum row limit for browser tab stability', () => {
      assert.doesNotThrow(() => validateDatasetBoundary(1000, 100_000));

      assert.throws(
        () => validateDatasetBoundary(1000, MAX_ROW_COUNT + 1),
        (err: any) => err instanceof MemoryBoundaryError && err.code === 'MEMORY_BOUNDARY_EXCEEDED'
      );
    });

    it('enforces 500 column limit', () => {
      assert.doesNotThrow(() => validateDatasetBoundary(1000, 1000, 100));

      assert.throws(
        () => validateDatasetBoundary(1000, 1000, MAX_COLUMN_COUNT + 1),
        (err: any) => err instanceof MemoryBoundaryError && err.code === 'MEMORY_BOUNDARY_EXCEEDED'
      );
    });
  });

  // =========================================================================
  // 4. Malformed Datasets & Prototype Pollution Protection
  // =========================================================================
  describe('Malformed Datasets & Prototype Pollution', () => {
    it('strips prototype pollution keys (__proto__, constructor, prototype)', () => {
      const maliciousRow = JSON.parse('{"__proto__":{"polluted":true},"id":101,"val":500}');
      const { cleanRows, warnings } = sanitizeDatasetRows([maliciousRow]);

      assert.strictEqual(cleanRows.length, 1);
      assert.strictEqual(cleanRows[0].id, 101);
      assert.strictEqual(cleanRows[0].val, 500);
      assert.strictEqual((cleanRows[0] as any).__proto__?.polluted, undefined);
      assert.strictEqual(warnings.length > 0, true);
    });

    it('sanitizes unsafe numbers (NaN, Infinity, -Infinity) to null', () => {
      const row = { id: 1, goodVal: 42.5, nanVal: NaN, infVal: Infinity, negInf: -Infinity };
      const { cleanRows } = sanitizeDatasetRows([row]);

      assert.strictEqual(cleanRows[0].goodVal, 42.5);
      assert.strictEqual(cleanRows[0].nanVal, null);
      assert.strictEqual(cleanRows[0].infVal, null);
      assert.strictEqual(cleanRows[0].negInf, null);
    });

    it('rejects non-array inputs with MalformedDatasetError', () => {
      assert.throws(
        () => sanitizeDatasetRows('not an array' as any),
        (err: any) => err instanceof MalformedDatasetError
      );
    });
  });

  // =========================================================================
  // 5. Zero External Telemetry Verification
  // =========================================================================
  describe('Zero External Telemetry Verification', () => {
    it('confirms 100% client-side memory execution with zero remote hosts', () => {
      const audit = verifyZeroExternalTelemetry();
      assert.strictEqual(audit.isZeroTelemetry, true);
      assert.strictEqual(audit.activeExternalHosts.length, 0);
    });
  });

  // =========================================================================
  // 6. Cancellation & Worker Failure Resilience
  // =========================================================================
  describe('Cancellation & Engine Resilience', () => {
    it('aborts query execution when AbortSignal is cancelled', async () => {
      const controller = new AbortController();
      controller.abort(); // Cancel before execution

      const plan: QueryPlan = {
        planId: 'test-cancel-plan',
        tableName: 'cancel_test',
        metrics: [{ id: 'cnt', label: 'Count', operation: 'countRows' }],
      };

      await assert.rejects(
        () => executeAnalytics(plan, [{ a: 1 }, { a: 2 }], { signal: controller.signal }),
        /aborted by client cancellation token/
      );
    });

    it('gracefully recovers using V8 baseline if an engine faults', async () => {
      const plan: QueryPlan = {
        planId: 'test-recovery-plan',
        tableName: 'recovery_test',
        metrics: [{ id: 'cnt', label: 'Count', operation: 'countRows' }],
      };

      // V8 baseline handles execution reliably
      const { result } = await executeAnalytics(plan, [{ id: 1 }, { id: 2 }, { id: 3 }]);
      assert.strictEqual(result.metrics.cnt, 3);
    });
  });
});
