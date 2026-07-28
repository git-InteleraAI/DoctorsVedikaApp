/**
 * frontend/src/core/components/DatePickerModal.tsx
 * Pure JS, high-fidelity interactive Calendar DatePicker Modal.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Calendar, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { theme } from '../theme';

export interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (formatted: string, isoDate: string) => void;
  initialDate?: Date;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DatePickerModal({
  visible,
  onClose,
  onSelectDate,
  initialDate = new Date(2000, 0, 1),
}: DatePickerModalProps) {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [selectedDay, setSelectedDay] = useState<number>(initialDate.getDate());
  const [showYearPicker, setShowYearPicker] = useState<boolean>(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i);

  function handlePrevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
  }

  function handleNextMonth() {
    const nextMonthDate = new Date(year, month + 1, 1);
    if (nextMonthDate <= new Date()) {
      setCurrentDate(nextMonthDate);
      setSelectedDay(1);
    }
  }

  function handleSelectYear(selectedYear: number) {
    setCurrentDate(new Date(selectedYear, month, 1));
    setShowYearPicker(false);
  }

  function handleConfirm() {
    const dayPad = selectedDay.toString().padStart(2, '0');
    const monthPad = (month + 1).toString().padStart(2, '0');
    const monthShort = MONTH_NAMES[month].substring(0, 3);

    const formatted = `${dayPad} ${monthShort} ${year}`;
    const isoDate = `${year}-${monthPad}-${dayPad}`;

    onSelectDate(formatted, isoDate);
    onClose();
  }

  const gridItems: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    gridItems.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    gridItems.push(d);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <Calendar size={20} color="#00A8B5" />
                  <Text style={styles.headerTitle}>Select Date of Birth</Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={8}>
                  <X size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.monthRow}>
                <TouchableOpacity
                  onPress={() => setShowYearPicker(!showYearPicker)}
                  style={styles.monthYearSelector}
                >
                  <Text style={styles.monthYearText}>
                    {MONTH_NAMES[month]} {year}
                  </Text>
                  <ChevronDown size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <View style={styles.monthNavBtns}>
                  <TouchableOpacity
                    onPress={handlePrevMonth}
                    style={styles.navIconBtn}
                    hitSlop={6}
                  >
                    <ChevronLeft size={20} color={theme.colors.textPrimary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleNextMonth}
                    style={styles.navIconBtn}
                    hitSlop={6}
                  >
                    <ChevronRight size={20} color={theme.colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>

              {showYearPicker ? (
                <View style={styles.yearPickerContainer}>
                  <ScrollView style={styles.yearScroll} showsVerticalScrollIndicator={false}>
                    {years.map((y) => (
                      <TouchableOpacity
                        key={y}
                        style={[styles.yearItem, y === year && styles.yearItemActive]}
                        onPress={() => handleSelectYear(y)}
                      >
                        <Text style={[styles.yearItemText, y === year && styles.yearItemTextActive]}>
                          {y}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                <View style={styles.calendarBody}>
                  <View style={styles.daysHeaderRow}>
                    {DAYS_OF_WEEK.map((dayName) => (
                      <Text key={dayName} style={styles.dayHeaderCell}>
                        {dayName}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.daysGrid}>
                    {gridItems.map((item, index) => {
                      if (item === null) {
                        return <View key={`empty-${index}`} style={styles.dayCell} />;
                      }
                      const isSelected = item === selectedDay;
                      const isToday =
                        item === new Date().getDate() &&
                        month === new Date().getMonth() &&
                        year === new Date().getFullYear();

                      return (
                        <TouchableOpacity
                          key={`day-${item}`}
                          style={[
                            styles.dayCell,
                            isSelected && styles.dayCellSelected,
                            !isSelected && isToday && styles.dayCellToday,
                          ]}
                          onPress={() => setSelectedDay(item)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              isSelected && styles.dayTextSelected,
                              !isSelected && isToday && styles.dayTextToday,
                            ]}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                  <Text style={styles.confirmBtnText}>Set Date</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 37, 55, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2537',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthYearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#E6F7F5',
  },
  monthNavBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  monthYearText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00A8B5',
  },
  yearPickerContainer: {
    height: 220,
    marginVertical: 8,
  },
  yearScroll: {
    flex: 1,
  },
  yearItem: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  yearItemActive: {
    backgroundColor: '#00A8B5',
  },
  yearItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  yearItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calendarBody: {
    marginBottom: 16,
  },
  daysHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayHeaderCell: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: '#00A8B5',
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: '#00A8B5',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F2537',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayTextToday: {
    color: '#00A8B5',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#00A8B5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
