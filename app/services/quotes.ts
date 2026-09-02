import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOTIVATIONAL_QUOTES, Quote } from '@/data/quotes';

const STORAGE_KEY_SEEN_IDS = '@myManager:quotes_seen_ids';
const STORAGE_KEY_CURRENT_QUOTE = '@myManager:current_quote';
const STORAGE_KEY_LAST_TIMESTAMP = '@myManager:quotes_last_timestamp';

// 24 hours in milliseconds
export const ROTATION_INTERVAL_MS = 24 * 60 * 60 * 1000;

export interface DailyQuoteState {
  quote: Quote;
  lastShownTimestamp: number;
  timeRemainingMs: number;
  seenCount: number;
  totalCount: number;
}

/**
 * Get or rotate the daily motivational quote according to the 24-hour elapsed rule.
 * Ensures no repeat quotes until the entire pool has been exhausted.
 */
export async function getOrRotateDailyQuote(): Promise<DailyQuoteState> {
  const now = Date.now();

  try {
    const [storedQuoteJson, storedTimestampStr, storedSeenIdsJson] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_CURRENT_QUOTE),
      AsyncStorage.getItem(STORAGE_KEY_LAST_TIMESTAMP),
      AsyncStorage.getItem(STORAGE_KEY_SEEN_IDS),
    ]);

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

    // If a quote already exists and 24 hours haven't passed yet, persist current quote
    if (storedQuoteJson && elapsed >= 0 && elapsed < ROTATION_INTERVAL_MS) {
      try {
        const currentQuote: Quote = JSON.parse(storedQuoteJson);
        return {
          quote: currentQuote,
          lastShownTimestamp: lastTimestamp,
          timeRemainingMs: Math.max(0, ROTATION_INTERVAL_MS - elapsed),
          seenCount: Math.min(seenIds.length, MOTIVATIONAL_QUOTES.length),
          totalCount: MOTIVATIONAL_QUOTES.length,
        };
      } catch (err) {
        console.warn('Failed to parse cached quote, picking a new one', err);
      }
    }

    // 24 hours have elapsed or first load: select next quote from unseen pool
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

    // Persist to AsyncStorage
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY_CURRENT_QUOTE, JSON.stringify(selectedQuote)),
      AsyncStorage.setItem(STORAGE_KEY_LAST_TIMESTAMP, now.toString()),
      AsyncStorage.setItem(STORAGE_KEY_SEEN_IDS, JSON.stringify(updatedSeenIds)),
    ]);

    return {
      quote: selectedQuote,
      lastShownTimestamp: now,
      timeRemainingMs: ROTATION_INTERVAL_MS,
      seenCount: updatedSeenIds.length,
      totalCount: MOTIVATIONAL_QUOTES.length,
    };
  } catch (error) {
    console.error('Error in getOrRotateDailyQuote:', error);
    // Fallback to first quote if storage error occurs
    return {
      quote: MOTIVATIONAL_QUOTES[0],
      lastShownTimestamp: now,
      timeRemainingMs: ROTATION_INTERVAL_MS,
      seenCount: 1,
      totalCount: MOTIVATIONAL_QUOTES.length,
    };
  }
}
