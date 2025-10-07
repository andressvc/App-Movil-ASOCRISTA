// components/TimeSelector.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';

const TimeSelector = ({ 
  label, 
  value, 
  onChange, 
  error, 
  required = false 
}) => {
  const [time, setTime] = useState(value || '09:00');

  const formatTime = (timeStr) => {
    if (!timeStr) return '09:00';
    const [hours, minutes] = timeStr.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  const updateTime = (newTime) => {
    setTime(newTime);
    onChange(newTime);
  };

  const incrementHours = () => {
    const [hours, minutes] = time.split(':');
    let newHours = parseInt(hours) + 1;
    if (newHours > 23) newHours = 0;
    updateTime(`${newHours.toString().padStart(2, '0')}:${minutes}`);
  };

  const decrementHours = () => {
    const [hours, minutes] = time.split(':');
    let newHours = parseInt(hours) - 1;
    if (newHours < 0) newHours = 23;
    updateTime(`${newHours.toString().padStart(2, '0')}:${minutes}`);
  };

  const incrementMinutes = () => {
    const [hours, minutes] = time.split(':');
    let newMinutes = parseInt(minutes) + 15;
    if (newMinutes >= 60) {
      newMinutes = 0;
      incrementHours();
      return;
    }
    updateTime(`${hours}:${newMinutes.toString().padStart(2, '0')}`);
  };

  const decrementMinutes = () => {
    const [hours, minutes] = time.split(':');
    let newMinutes = parseInt(minutes) - 15;
    if (newMinutes < 0) {
      newMinutes = 45;
      decrementHours();
      return;
    }
    updateTime(`${hours}:${newMinutes.toString().padStart(2, '0')}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      
      <View style={styles.timeContainer}>
        {/* Hours */}
        <View style={styles.timeSection}>
          <TouchableOpacity 
            style={styles.arrowButton} 
            onPress={incrementHours}
          >
            <Ionicons name="chevron-up" size={20} color={Colors.primary} />
          </TouchableOpacity>
          
          <View style={styles.timeDisplay}>
            <Text style={styles.timeText}>
              {time.split(':')[0].padStart(2, '0')}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.arrowButton} 
            onPress={decrementHours}
          >
            <Ionicons name="chevron-down" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Separator */}
        <Text style={styles.separator}>:</Text>

        {/* Minutes */}
        <View style={styles.timeSection}>
          <TouchableOpacity 
            style={styles.arrowButton} 
            onPress={incrementMinutes}
          >
            <Ionicons name="chevron-up" size={20} color={Colors.primary} />
          </TouchableOpacity>
          
          <View style={styles.timeDisplay}>
            <Text style={styles.timeText}>
              {time.split(':')[1].padStart(2, '0')}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.arrowButton} 
            onPress={decrementMinutes}
          >
            <Ionicons name="chevron-down" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  required: {
    color: Colors.error,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeSection: {
    alignItems: 'center',
  },
  arrowButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    marginVertical: 4,
  },
  timeDisplay: {
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  separator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginHorizontal: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 4,
  },
});

export default TimeSelector;
