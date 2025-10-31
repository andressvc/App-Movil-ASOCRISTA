import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';

const { width: screenWidth } = Dimensions.get('window');

const CustomDateTimePicker = ({ 
  value, 
  onChange, 
  mode = 'datetime', 
  placeholder = 'Seleccionar fecha y hora',
  label,
  error,
  style,
  showTime = true
}) => {
  const [show, setShow] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || new Date());
  const [selectedTime, setSelectedTime] = useState(value || new Date());
  const [isAM, setIsAM] = useState((value || new Date()).getHours() < 12);
  
  const styles = getStyles();

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const currentDay = selectedDate.getDate();

  // Generar días del mes
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Días del mes anterior
    const prevMonth = new Date(currentYear, currentMonth - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === new Date().getDate() && 
                     currentMonth === new Date().getMonth() && 
                     currentYear === new Date().getFullYear();
      const isSelected = day === currentDay;
      
      days.push({
        day,
        isCurrentMonth: true,
        isToday,
        isSelected
      });
    }
    
    // Días del mes siguiente
    const remainingDays = 42 - days.length; // 6 semanas x 7 días
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }
    
    return days;
  }, [currentMonth, currentYear, currentDay]);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  const handleDateSelect = (day, isCurrentMonth) => {
    if (!isCurrentMonth) return;
    
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
  };

  const handleTimeSelect = (hour, minute) => {
    const newTime = new Date(selectedDate);
    newTime.setHours(isAM ? hour : hour + 12, minute, 0, 0);
    setSelectedTime(newTime);
  };

  const handleConfirm = () => {
    if (showTime) {
      const finalDate = new Date(selectedDate);
      finalDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      onChange(finalDate);
    } else {
      // Solo fecha: normalizar a medianoche y enviar solo la fecha
      const onlyDate = new Date(selectedDate);
      onlyDate.setHours(0, 0, 0, 0);
      onChange(onlyDate);
    }
    setShow(false);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(currentMonth + direction);
    setSelectedDate(newDate);
  };

  const formatDisplayValue = (date) => {
    if (!date) return '';
    
    try {
      if (showTime) {
        return date.toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
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

  const renderClock = () => {
    const hours = selectedTime.getHours() % 12 || 12;
    const minutes = selectedTime.getMinutes();
    
    return (
      <View style={styles.clockContainer}>
        <View style={styles.clockFace}>
          {Array.from({ length: 12 }, (_, i) => {
            const hour = i + 1;
            const angle = (i * 30) - 90; // 30 grados por hora
            const x = 60 + 50 * Math.cos(angle * Math.PI / 180);
            const y = 60 + 50 * Math.sin(angle * Math.PI / 180);
            
            return (
              <View
                key={hour}
                style={[
                  styles.clockNumber,
                  {
                    left: x - 10,
                    top: y - 10,
                    backgroundColor: hours === hour ? Colors.primary : 'transparent'
                  }
                ]}
              >
                <Text style={[
                  styles.clockNumberText,
                  { color: hours === hour ? Colors.white : Colors.text.primary }
                ]}>
                  {hour}
                </Text>
              </View>
            );
          })}
          
          {/* Manecillas */}
          <View style={[
            styles.hourHand,
            {
              transform: [{ rotate: `${(hours * 30) + (minutes * 0.5) - 90}deg` }]
            }
          ]} />
          <View style={[
            styles.minuteHand,
            {
              transform: [{ rotate: `${minutes * 6 - 90}deg` }]
            }
          ]} />
        </View>
        
        {/* Selector AM/PM */}
        <View style={styles.ampmContainer}>
          <TouchableOpacity
            style={[styles.ampmButton, isAM && styles.ampmButtonSelected]}
            onPress={() => setIsAM(true)}
          >
            <Text style={[styles.ampmText, isAM && styles.ampmTextSelected]}>AM</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ampmButton, !isAM && styles.ampmButtonSelected]}
            onPress={() => setIsAM(false)}
          >
            <Text style={[styles.ampmText, !isAM && styles.ampmTextSelected]}>PM</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity 
        style={[styles.input, error && styles.inputError]}
        onPress={() => setShow(true)}
      >
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value ? formatDisplayValue(value) : (showTime ? placeholder : 'Seleccionar fecha')}
        </Text>
        <Ionicons 
          name={showTime ? "time-outline" : "calendar-outline"} 
          size={20} 
          color={Colors.gray[500]} 
        />
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
                <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {monthNames[currentMonth]} {currentYear}
              </Text>
              <View style={styles.headerRight}>
                <TouchableOpacity onPress={() => navigateMonth(-1)}>
                  <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigateMonth(1)}>
                  <Ionicons name="chevron-forward" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                {showTime && (
                  <Text style={styles.timeDisplay}>
                    {selectedTime.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </Text>
                )}
              </View>
            </View>

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

            {/* Clock */}
            {showTime && renderClock()}

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
    width: screenWidth * 0.9,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeDisplay: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 10,
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
  clockContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  clockFace: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
    marginBottom: 20,
  },
  clockNumber: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  hourHand: {
    position: 'absolute',
    width: 3,
    height: 35,
    backgroundColor: Colors.primary,
    top: 25,
    left: 58.5,
    borderRadius: 1.5,
    transformOrigin: 'bottom',
  },
  minuteHand: {
    position: 'absolute',
    width: 2,
    height: 45,
    backgroundColor: Colors.primary,
    top: 15,
    left: 59,
    borderRadius: 1,
    transformOrigin: 'bottom',
  },
  ampmContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  ampmButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ampmButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ampmText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  ampmTextSelected: {
    color: Colors.white,
    fontWeight: 'bold',
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

export default CustomDateTimePicker;
