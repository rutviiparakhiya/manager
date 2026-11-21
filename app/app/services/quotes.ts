import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOTIVATIONAL_QUOTES, Quote } from '@/data/quotes';
import {
  QuoteIntervalId,
  DEFAULT_QUOTE_INTERVAL_ID,
  getQuoteIntervalOption,
} from '@/types/settings';

const STORAGE_KEY_SEEN_IDS = '@myManager:quotes_seen_ids';
const STORAGE_KEY_CURRENT_QUOTE = '@myManager:current_quote';
const STORAGE_KEY_LAST_TIMESTAMP = '@myManager:quotes_last_timestamp';
const STORAGE_KEY_QUOTE_INTERVAL = '@myManager:quote_refresh_interval';

export interface DailyQuoteState {
  quote: Quote;
  lastShownTimestamp: number;
  timeRemainingMs: number;
  intervalId: QuoteIntervalId;
  intervalLabel: string;
  intervalShortLabel: string;
  seenCount: number;
  totalCount: number;
}

/**
 * Retrieve the saved quote refresh interval from AsyncStorage.
 */
export async function getStoredQuoteInterval(): Promise<QuoteIntervalId> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY_QUOTE_INTERVAL);
    if (saved) {
      return saved as QuoteIntervalId;
    }
    return DEFAULT_QUOTE_INTERVAL_ID;
  } catch (error) {
    console.error('Error reading quote interval:', error);
    return DEFAULT_QUOTE_INTERVAL_ID;
  }
}

/**
 * Save the selected quote refresh interval to AsyncStorage.
 */
export async function setStoredQuoteInterval(intervalId: QuoteIntervalId): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_QUOTE_INTERVAL, intervalId);
  } catch (error) {
    console.error('Error saving quote interval:', error);
  }
}

/**
 * Get or rotate the motivational quote according to the active interval setting.
 * Guarantees a quote NEVER repeats until all quotes in the pool have been shown once.
 */
export async function getOrRotateDailyQuote(forceRotate: boolean = false): Promise<DailyQuoteState> {
  const now = Date.now();

  try {
    const [
      storedQuoteJson,
      storedTimestampStr,
      storedSeenIdsJson,
      storedIntervalId,
    ] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_CURRENT_QUOTE),
      AsyncStorage.getItem(STORAGE_KEY_LAST_TIMESTAMP),
      AsyncStorage.getItem(STORAGE_KEY_SEEN_IDS),
      getStoredQuoteInterval(),
    ]);

    const intervalOption = getQuoteIntervalOption(storedIntervalId);
    const intervalMs = intervalOption.durationMs;

    let seenIds: string[] = [];
    if (storedSeenIdsJson) {
      try {
        const parsed = JSON.parse(storedSeenIdsJson);
        if (Array.isArray(parsed)) {
          seenIds = parsed;
        }
      } catch {
        seenIds = [];
      }
    }

    const lastTimestamp = storedTimestampStr ? parseInt(storedTimestampStr, 10) : 0;
    const elapsed = now - lastTimestamp;

    // If a quote exists and the selected interval has not elapsed yet (and not force rotating)
    if (!forceRotate && storedQuoteJson && elapsed >= 0 && elapsed < intervalMs) {
      try {
        const currentQuote: Quote = JSON.parse(storedQuoteJson);
        return {
          quote: currentQuote,
          lastShownTimestamp: lastTimestamp,
          timeRemainingMs: Math.max(0, intervalMs - elapsed),
          intervalId: intervalOption.id,
          intervalLabel: intervalOption.label,
          intervalShortLabel: intervalOption.shortLabel,
          seenCount: Math.min(seenIds.length, MOTIVATIONAL_QUOTES.length),
          totalCount: MOTIVATIONAL_QUOTES.length,
        };
      } catch (err) {
        console.warn('Failed to parse cached quote, picking a new one', err);
      }
    }

    // Interval has elapsed (or first run / forced rotate):
    // Filter unseen quotes in the current cycle
    let unseenQuotes = MOTIVATIONAL_QUOTES.filter((q) => !seenIds.includes(q.id));

    // If all quotes have been seen, reshuffle and start a fresh cycle
    if (unseenQuotes.length === 0) {
      seenIds = [];
      unseenQuotes = [...MOTIVATIONAL_QUOTES];
    }

    // Pick a random quote from the remaining unseen pool
    const randomIndex = Math.floor(Math.random() * unseenQuotes.length);
    const selectedQuote = unseenQuotes[randomIndex];

    // Update seen IDs
    const updatedSeenIds = [...seenIds, selectedQuote.id];

    // Persist immediately to AsyncStorage
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY_CURRENT_QUOTE, JSON.stringify(selectedQuote)),
      AsyncStorage.setItem(STORAGE_KEY_LAST_TIMESTAMP, now.toString()),
      AsyncStorage.setItem(STORAGE_KEY_SEEN_IDS, JSON.stringify(updatedSeenIds)),
    ]);

    return {
      quote: selectedQuote,
      lastShownTimestamp: now,
      timeRemainingMs: intervalMs,
      intervalId: intervalOption.id,
      intervalLabel: intervalOption.label,
      intervalShortLabel: intervalOption.shortLabel,
      seenCount: updatedSeenIds.length,
      totalCount: MOTIVATIONAL_QUOTES.length,
    };
  } catch (error) {
    console.error('Error in getOrRotateDailyQuote:', error);
    const defaultOption = getQuoteIntervalOption(DEFAULT_QUOTE_INTERVAL_ID);
    return {
      quote: MOTIVATIONAL_QUOTES[0],
      lastShownTimestamp: now,
      timeRemainingMs: defaultOption.durationMs,
      intervalId: defaultOption.id,
      intervalLabel: defaultOption.label,
      intervalShortLabel: defaultOption.shortLabel,
      seenCount: 1,
      totalCount: MOTIVATIONAL_QUOTES.length,
    };
  }
}
