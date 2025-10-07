import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';

const SimpleDatePicker = ({ 
  value, 
  onChange, 
  placeholder = 'Seleccionar fecha',
  label,
  error,
  style 
}) => {
  const [show, setShow] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || new Date());
  const [showYearSelector, setShowYearSelector] = useState(false);
  
  const styles = getStyles();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const currentDay = selectedDate.getDate();

  // Generar días del mes
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Días del mes anterior
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false
      });
    }

    // Días del mes actual
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && 
                     currentMonth === today.getMonth() && 
                     currentYear === today.getFullYear();
      const isSelected = day === currentDay;
      
      days.push({
        day,
        isCurrentMonth: true,
        isSelected,
        isToday
      });
    }

    // Días del mes siguiente para completar la grilla
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false
      });
    }

    return days;
  };

  const handleDateSelect = (day, isCurrentMonth) => {
    if (!isCurrentMonth) return;
    
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
  };

  const handleConfirm = () => {
    onChange(selectedDate);
    setShow(false);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(currentMonth + direction);
    setSelectedDate(newDate);
  };

  const navigateYear = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(currentYear + direction);
    setSelectedDate(newDate);
  };

  const goToYear = (year) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(year);
    setSelectedDate(newDate);
    setShowYearSelector(false);
  };

  const generateYearList = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Generar años desde 1920 hasta el año actual + 1
    for (let year = currentYear + 1; year >= 1920; year--) {
      years.push(year);
    }
    
    return years;
  };

  const formatDisplayValue = (date) => {
    if (!date) return '';
    
    try {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return date.toString();
    }
  };

  const calendarDays = generateCalendarDays();

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity 
        style={[styles.input, error && styles.inputError]}
        onPress={() => setShow(true)}
      >
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value ? formatDisplayValue(value) : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={Colors.gray[500]} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <Modal
        visible={show}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShow(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShow(false)}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.titleContainer}
                onPress={() => setShowYearSelector(!showYearSelector)}
              >
                <Text style={styles.modalTitle}>
                  {monthNames[currentMonth]} {currentYear}
                </Text>
                <Ionicons name="chevron-down" size={16} color={Colors.text.primary} />
              </TouchableOpacity>
              <View style={styles.headerRight}>
                <TouchableOpacity onPress={() => navigateYear(-1)}>
                  <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigateMonth(-1)}>
                  <Ionicons name="chevron-back-outline" size={20} color={Colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigateMonth(1)}>
                  <Ionicons name="chevron-forward-outline" size={20} color={Colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigateYear(1)}>
                  <Ionicons name="chevron-forward" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Year Selector */}
            {showYearSelector && (
              <View style={styles.yearSelector}>
                <ScrollView style={styles.yearList} showsVerticalScrollIndicator={false}>
                  {generateYearList().map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.yearItem,
                        year === currentYear && styles.yearItemSelected
                      ]}
                      onPress={() => goToYear(year)}
                    >
                      <Text style={[
                        styles.yearText,
                        year === currentYear && styles.yearTextSelected
                      ]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Calendar */}
            <View style={styles.calendarContainer}>
              <View style={styles.dayNamesRow}>
                {dayNames.map((day, index) => (
                  <Text key={index} style={styles.dayName}>{day}</Text>
                ))}
              </View>
              
              <View style={styles.calendarGrid}>
                {calendarDays.map((dayData, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayButton,
                      dayData.isSelected && styles.dayButtonSelected,
                      dayData.isToday && styles.dayButtonToday,
                      !dayData.isCurrentMonth && styles.dayButtonInactive
                    ]}
                    onPress={() => handleDateSelect(dayData.day, dayData.isCurrentMonth)}
                  >
                    <Text style={[
                      styles.dayText,
                      dayData.isSelected && styles.dayTextSelected,
                      dayData.isToday && styles.dayTextToday,
                      !dayData.isCurrentMonth && styles.dayTextInactive
                    ]}>
                      {dayData.day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = () => StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    minHeight: 48,
  },
  inputError: {
    borderColor: Colors.error,
  },
  text: {
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
  placeholder: {
    color: Colors.gray[400],
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  yearSelector: {
    maxHeight: 200,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.gray[50],
  },
  yearList: {
    maxHeight: 180,
  },
  yearItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  yearItemSelected: {
    backgroundColor: Colors.primary,
  },
  yearText: {
    fontSize: 16,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  yearTextSelected: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  calendarContainer: {
    marginBottom: 20,
  },
  dayNamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary,
  },
  dayButtonToday: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dayButtonInactive: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  dayTextSelected: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  dayTextToday: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  dayTextInactive: {
    color: Colors.gray[400],
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SimpleDatePicker;
