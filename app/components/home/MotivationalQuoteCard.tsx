import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DailyQuoteState, getOrRotateDailyQuote } from '@/services/quotes';

export function MotivationalQuoteCard() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [quoteState, setQuoteState] = useState<DailyQuoteState | null>(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchQuote = useCallback(async () => {
    try {
      const state = await getOrRotateDailyQuote();
      setQuoteState(state);

      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Schedule next rotation when timeRemainingMs expires
      if (state.timeRemainingMs > 0) {
        const delay = Math.min(Math.max(1000, state.timeRemainingMs), 24 * 60 * 60 * 1000);
        timerRef.current = setTimeout(() => {
          fetchQuote();
        }, delay);
      }
    } catch (err) {
      console.error('Failed to load quote:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check and refresh quote whenever Home tab gains focus
  useFocusEffect(
    useCallback(() => {
      fetchQuote();

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }, [fetchQuote])
  );

  const refreshLabel = quoteState?.intervalShortLabel
    ? `Refreshes every ${quoteState.intervalShortLabel}`
    : 'Refreshes every 24h';

  return (
    <View style={styles.quoteContainer}>
      {/* Top refresh interval indicator */}
      <View style={styles.metaRow}>
        <View style={styles.refreshIndicator}>
          <Ionicons name="time-outline" size={13} color={colors.textMuted} />
          <Text style={[styles.cycleText, { color: colors.textMuted }]}>{refreshLabel}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.quoteBody}>
          <View style={styles.quoteRow}>
            <Text
              style={[
                styles.quoteText,
                {
                  color: colors.text,
                },
              ]}>
              &ldquo;{quoteState?.quote.quote}&rdquo;
            </Text>
          </View>

          <View style={styles.authorRow}>
            <View style={[styles.authorDivider, { backgroundColor: colors.cardBorder }]} />
            <Text style={[styles.authorText, { color: colors.textSecondary }]}>
              — {quoteState?.quote.author}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  quoteContainer: {
    marginBottom: 24,
    paddingHorizontal: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 6,
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cycleText: {
    fontSize: 11,
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteBody: {
    paddingTop: 2,
  },
  quoteRow: {
    marginBottom: 10,
  },
  quoteText: {
    fontFamily: 'Satisfy_400Regular',
    fontSize: 24,
    lineHeight: 34,
    letterSpacing: 0.3,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  authorDivider: {
    flex: 1,
    height: 1,
    opacity: 0.6,
  },
  authorText: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});
