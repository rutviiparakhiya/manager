import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DailyQuoteState, getOrRotateDailyQuote } from '@/services/quotes';

export function MotivationalQuoteCard() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [quoteState, setQuoteState] = useState<DailyQuoteState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadQuote() {
      try {
        const state = await getOrRotateDailyQuote();
        if (isMounted) {
          setQuoteState(state);
        }
      } catch (err) {
        console.error('Failed to load quote:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadQuote();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        },
      ]}>
      {/* Decorative Top Accent Bar */}
      <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />

      <View style={styles.cardHeader}>
        <View style={styles.badgeRow}>
          <View style={[styles.sparkleBadge, { backgroundColor: colors.quoteBg }]}>
            <Ionicons name="sparkles" size={14} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.primary }]}>DAILY INSPIRATION</Text>
          </View>
          <Text style={[styles.cycleText, { color: colors.textMuted }]}>Refreshes every 24h</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.quoteBody}>
          <View style={styles.quoteRow}>
            <MaterialIcons
              name="format-quote"
              size={24}
              color={colors.quoteAccent}
              style={styles.quoteIconLeft}
            />
            <Text
              style={[
                styles.quoteText,
                {
                  color: colors.text,
                },
              ]}>
              {quoteState?.quote.quote}
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
  cardContainer: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  cardHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sparkleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  cycleText: {
    fontSize: 11,
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
  quoteRow: {
    marginTop: 6,
    marginBottom: 14,
  },
  quoteIconLeft: {
    marginBottom: 4,
    opacity: 0.8,
  },
  quoteText: {
    fontFamily: 'LobsterTwo_400Regular',
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: 0.2,
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
  },
  authorText: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});
