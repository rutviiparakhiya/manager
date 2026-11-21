export type ThemeMode = 'light' | 'dark';

export type QuoteIntervalId =
  | '1m'
  | '5m'
  | '10m'
  | '30m'
  | '1h'
  | '6h'
  | '12h'
  | '24h';

export interface QuoteIntervalOption {
  id: QuoteIntervalId;
  label: string;
  shortLabel: string;
  durationMs: number;
}

export const QUOTE_INTERVAL_OPTIONS: QuoteIntervalOption[] = [
  { id: '1m', label: 'Every 1 minute', shortLabel: '1m', durationMs: 1 * 60 * 1000 },
  { id: '5m', label: 'Every 5 minutes', shortLabel: '5m', durationMs: 5 * 60 * 1000 },
  { id: '10m', label: 'Every 10 minutes', shortLabel: '10m', durationMs: 10 * 60 * 1000 },
  { id: '30m', label: 'Every 30 minutes', shortLabel: '30m', durationMs: 30 * 60 * 1000 },
  { id: '1h', label: 'Every 1 hour', shortLabel: '1h', durationMs: 1 * 60 * 60 * 1000 },
  { id: '6h', label: 'Every 6 hours', shortLabel: '6h', durationMs: 6 * 60 * 60 * 1000 },
  { id: '12h', label: 'Every 12 hours', shortLabel: '12h', durationMs: 12 * 60 * 60 * 1000 },
  { id: '24h', label: 'Every 24 hours', shortLabel: '24h', durationMs: 24 * 60 * 60 * 1000 },
];

export const DEFAULT_QUOTE_INTERVAL_ID: QuoteIntervalId = '24h';

export function getQuoteIntervalOption(id: string | null | undefined): QuoteIntervalOption {
  const found = QUOTE_INTERVAL_OPTIONS.find((opt) => opt.id === id);
  return found ?? QUOTE_INTERVAL_OPTIONS[7]; // Default to 24h
}
