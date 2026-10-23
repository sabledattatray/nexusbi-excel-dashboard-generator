/**
 * Analytics Engine Feature Flags
 * Authoritative source: PRD v9.0 Section 04 (D05: disabled by default)
 */

export interface AnalyticsFeatureFlags {
  duckdbEngineEnabled: boolean;
  duckdbWorkerThreads: number;
  dualEngineParityValidation: boolean;
  maxMemoryCeilingBytes: number;
  parityToleranceRatio: number;
}

let currentFlags: AnalyticsFeatureFlags = {
  // STRICT REQUIREMENT 2: Disabled by default; v8 JS remains active default
  duckdbEngineEnabled: false,
  duckdbWorkerThreads: 1,
  dualEngineParityValidation: true,
  maxMemoryCeilingBytes: 250 * 1024 * 1024, // 250 MB browser safety boundary
  parityToleranceRatio: 0.0001,
};

export function getAnalyticsFeatureFlags(): AnalyticsFeatureFlags {
  return { ...currentFlags };
}

export const getFeatureFlags = getAnalyticsFeatureFlags;

export function setAnalyticsFeatureFlags(flags: Partial<AnalyticsFeatureFlags>): void {
  currentFlags = { ...currentFlags, ...flags };
}

export function setFeatureFlag<K extends keyof AnalyticsFeatureFlags>(key: K, value: AnalyticsFeatureFlags[K]): void {
  currentFlags[key] = value;
}

export function isDuckDbEnabled(): boolean {
  return currentFlags.duckdbEngineEnabled;
}

