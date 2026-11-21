import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  QuoteIntervalId,
  QuoteIntervalOption,
  QUOTE_INTERVAL_OPTIONS,
  getQuoteIntervalOption,
  DEFAULT_QUOTE_INTERVAL_ID,
} from '@/types/settings';
import {
  getStoredQuoteInterval,
  setStoredQuoteInterval,
  getOrRotateDailyQuote,
} from '@/services/quotes';

export function QuoteIntervalCard() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [selectedIntervalId, setSelectedIntervalId] = useState<QuoteIntervalId>(DEFAULT_QUOTE_INTERVAL_ID);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  // Load saved interval on mount
  useEffect(() => {
    let isMounted = true;
    async function loadInterval() {
      const saved = await getStoredQuoteInterval();
      if (isMounted) {
        setSelectedIntervalId(saved);
      }
    }
    loadInterval();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedOption = getQuoteIntervalOption(selectedIntervalId);

  const handleSelectOption = async (option: QuoteIntervalOption) => {
    setSelectedIntervalId(option.id);
    setIsPickerVisible(false);
    await setStoredQuoteInterval(option.id);
    // Recalculate quote rotation state immediately
    await getOrRotateDailyQuote();
  };

  return (
    <View style={styles.sectionWrapper}>
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Motivational Quotes</Text>
      </View>

      {/* Main Card */}
      <View
        style={[
          styles.cardBox,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.cardBorder,
          },
        ]}>
        {/* Card Header & Description */}
        <View style={styles.cardHeader}>
          <View style={styles.titleWithIcon}>
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: colors.quoteBg,
                  borderColor: colors.quoteBorder,
                },
              ]}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.textColumn}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Change quote every</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Rotation interval for the Home screen quote
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.cardDivider, { backgroundColor: colors.cardBorder }]} />

        {/* Dropdown / Picker Trigger Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsPickerVisible(true)}
          style={[
            styles.dropdownButton,
            {
              backgroundColor: colors.background,
              borderColor: colors.cardBorder,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Quote refresh interval: ${selectedOption.label}`}>
          <View style={styles.dropdownLeft}>
            <Ionicons name="repeat-outline" size={18} color={colors.primary} />
            <Text style={[styles.dropdownSelectedText, { color: colors.text }]}>
              {selectedOption.label}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Information Banner (No-Repeat Guarantee) */}
        <View
          style={[
            styles.noRepeatBanner,
            {
              backgroundColor: colors.quoteBg,
              borderColor: colors.quoteBorder,
            },
          ]}>
          <Ionicons name="sparkles" size={16} color={colors.primary} style={styles.bannerIcon} />
          <Text style={[styles.noRepeatText, { color: colors.textSecondary }]}>
            Quotes never repeat until all quotes in the pool have been shown once.
          </Text>
        </View>
      </View>

      {/* Native-style Modal Picker */}
      <Modal
        visible={isPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPickerVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsPickerVisible(false)}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              },
            ]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Change quote every
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Select your preferred quote refresh frequency
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsPickerVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={colors.icon} />
              </TouchableOpacity>
            </View>

            {/* List of 8 exact options */}
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {QUOTE_INTERVAL_OPTIONS.map((option, index) => {
                const isSelected = option.id === selectedIntervalId;
                const isLast = index === QUOTE_INTERVAL_OPTIONS.length - 1;

                return (
                  <TouchableOpacity
                    key={option.id}
                    activeOpacity={0.7}
                    onPress={() => handleSelectOption(option)}
                    style={[
                      styles.optionRow,
                      isSelected && {
                        backgroundColor: colors.quoteBg,
                      },
                      !isLast && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.cardBorder,
                      },
                    ]}>
                    <View style={styles.optionLeft}>
                      <View
                        style={[
                          styles.radioCircle,
                          {
                            borderColor: isSelected ? colors.primary : colors.cardBorder,
                            backgroundColor: isSelected ? colors.primary : 'transparent',
                          },
                        ]}>
                        {isSelected && <View style={styles.radioInnerDot} />}
                      </View>
                      <Text
                        style={[
                          styles.optionLabel,
                          {
                            color: isSelected ? colors.primary : colors.text,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}>
                        {option.label}
                      </Text>
                    </View>

                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionWrapper: {
    marginBottom: 26,
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  cardBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 14,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    marginBottom: 14,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownSelectedText: {
    fontSize: 15,
    fontWeight: '600',
  },
  noRepeatBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
  },
  bannerIcon: {
    marginTop: 1,
  },
  noRepeatText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  optionsList: {
    maxHeight: 380,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  optionLabel: {
    fontSize: 15,
  },
});
