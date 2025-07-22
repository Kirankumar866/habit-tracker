import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DateBarProps {
  weekDates: Date[];
  selectedDate: Date;
  today: Date;
  onDateSelect: (date: Date) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

const DateBar: React.FC<DateBarProps> = ({
  weekDates,
  selectedDate,
  today,
  onDateSelect,
  onPreviousWeek,
  onNextWeek,
}) => {
  return (
    <View style={styles.dateBarRow}>
      <TouchableOpacity onPress={onPreviousWeek}>
        <MaterialIcons name="chevron-left" size={28} color="#fff" />
      </TouchableOpacity>
      <FlatList
        data={weekDates}
        keyExtractor={(item) => item.toISOString()}
        horizontal
        scrollEnabled={false}
        contentContainerStyle={{ width: windowWidth - 100 }}
        renderItem={({ item: d }) => {
          const isSelected = d.toDateString() === selectedDate.toDateString();
          const isToday = d.toDateString() === today.toDateString();
          return (
            <TouchableOpacity
              style={[
                styles.dateItem,
                { width: (windowWidth - 100) / 7 },
                isSelected && styles.selectedDateItem,
              ]}
              onPress={() => onDateSelect(new Date(d))}
            >
              <Text style={[
                styles.dateDay, 
                isSelected && styles.selectedDateDay, 
                isToday && { textDecorationLine: 'underline' }
              ]}>
                {dayNames[d.getDay()]}
              </Text>
              <Text style={[styles.dateNum, isSelected && styles.selectedDateNum]}>
                {d.getDate()}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
      <TouchableOpacity onPress={onNextWeek}>
        <MaterialIcons name="chevron-right" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  dateBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedDateItem: {
    backgroundColor: '#F06292',
  },
  dateDay: {
    color: '#fff',
    fontSize: 14,
  },
  selectedDateDay: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateNum: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedDateNum: {
    color: '#fff',
  },
});

export default DateBar; 