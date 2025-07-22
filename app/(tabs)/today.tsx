import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import DateBar from './today/DateBar';
import TaskItem from './today/TaskItem';
import { getWeekDates } from './today/TodayUtils.js';

type TaskType = {
  id: string;
  name: string;
  type: string;
  date: string;
  reminder?: { time: string };
  note?: string;
  completed?: boolean;
  failed?: boolean;
};

export default function TodayScreen() {
  const [taskList, setTaskList] = useState<TaskType[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  
  // Ensure selectedDate is always current when app opens
  React.useEffect(() => {
    const now = new Date();
    console.log('Setting selectedDate to current date:', now.toDateString());
    setSelectedDate(now);
  }, []);

  // Function to jump to today's date
  const jumpToToday = () => {
    const now = new Date();
    setSelectedDate(now);
    setWeekOffset(0); // Reset week offset to current week
  };
  const centerDate = new Date();
  centerDate.setDate(today.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(centerDate);

  // Load tasks from AsyncStorage and filter by selectedDate
  const loadTasks = React.useCallback(() => {
    AsyncStorage.getItem('TASKS_LIST').then(data => {
      if (data) {
        const allTasks = JSON.parse(data);
        console.log('Loaded tasks from storage:', allTasks); // DEBUG
        // Use local date string for selectedDate
        const d = selectedDate;
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const filtered = allTasks.filter((t: TaskType) => {
          if (!t || !t.date) return false;
          return t.date.trim() === dateStr.trim();
        });
        console.log('Filtered tasks for', dateStr, filtered); // DEBUG
        setTaskList(filtered);
      } else {
        setTaskList([]);
      }
    });
  }, [selectedDate, weekOffset]);

  // Load tasks when tab is focused (for sync with Tasks tab)
  useFocusEffect(loadTasks);

  // Also load tasks when selectedDate or weekOffset changes
  React.useEffect(() => {
    loadTasks();
  }, [selectedDate, weekOffset]);

  const toggleTask = (id: string, type: string) => {
    setTaskList((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: type === 'complete' ? !task.completed : false,
              failed: type === 'fail' ? !task.failed : false,
            }
          : task
      )
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <MaterialIcons name="menu" size={32} color="#F06292" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Today</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={jumpToToday} style={{ marginHorizontal: 8 }}>
          <MaterialIcons name="today" size={24} color="#F06292" />
        </TouchableOpacity>
        <Ionicons name="search" size={24} color="#fff" style={{ marginHorizontal: 8 }} />
        <MaterialIcons name="calendar-today" size={24} color="#fff" style={{ marginHorizontal: 8 }} />
        <MaterialIcons name="help-outline" size={24} color="#fff" style={{ marginHorizontal: 8 }} />
      </View>
      
      {/* Date Bar */}
      <DateBar
        weekDates={weekDates}
        selectedDate={selectedDate}
        today={today}
        onDateSelect={setSelectedDate}
        onPreviousWeek={() => setWeekOffset(weekOffset - 1)}
        onNextWeek={() => setWeekOffset(weekOffset + 1)}
      />
      
      {/* Filters */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterBtnActive}>
          <Text style={styles.filterBtnTextActive}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}><Text style={styles.filterBtnText}>New list</Text></TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}><MaterialIcons name="filter-list" size={20} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}><MaterialIcons name="help-outline" size={20} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}><MaterialIcons name="close" size={20} color="#fff" /></TouchableOpacity>
      </View>
      
      {/* Task List */}
      <FlatList
        data={taskList}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 10 }}
        renderItem={({ item }) => (
          <TaskItem item={item} onToggle={toggleTask} />
        )}
      />
      
      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab}>
        <MaterialIcons name="add" size={36} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151718',
    paddingTop: 48,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  filterBtn: {
    backgroundColor: '#232325',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 4,
  },
  filterBtnActive: {
    backgroundColor: '#F06292',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 4,
  },
  filterBtnText: {
    color: '#fff',
    fontSize: 14,
  },
  filterBtnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#F06292',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
}); 