import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
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

  return (
    <View style={styles.quoteContainer}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.quoteBody}>
          {/* Accent left bar + quote block */}
          <View style={styles.accentRow}>
            {/* Colored left accent bar */}
            <View style={[styles.accentBar, { backgroundColor: colors.quoteAccent }]} />

            <View style={styles.quoteContent}>
              {/* Quote text continuously wrapped in double quotes */}
              <Text
                style={[
                  styles.quoteText,
                  {
                    color: colors.text,
                  },
                ]}>
                {'\u201C'}{quoteState?.quote.quote}{'\u201D'}
              </Text>

              {/* Author attribution */}
              <View style={styles.authorRow}>
                <View style={[styles.authorDash, { backgroundColor: colors.quoteAccent }]} />
                <Text style={[styles.authorText, { color: colors.textSecondary }]}>
                  {quoteState?.quote.author}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  quoteContainer: {
    marginBottom: 26,
    paddingHorizontal: 2,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteBody: {
    paddingTop: 4,
  },
  accentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  accentBar: {
    width: 3.5,
    borderRadius: 2,
    marginRight: 14,
    marginTop: 4,
    alignSelf: 'stretch',
    opacity: 0.9,
  },
  quoteContent: {
    flex: 1,
  },
  quoteText: {
    fontFamily: 'DancingScript',
    fontSize: 24,
    lineHeight: 34,
    letterSpacing: 0.2,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  authorDash: {
    width: 14,
    height: 2,
    borderRadius: 1,
    opacity: 0.8,
  },
  authorText: {
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
});
