import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;

const days = [
  { day: 'Wed', date: 2 },
  { day: 'Thu', date: 3 },
  { day: 'Fri', date: 4 },
  { day: 'Sat', date: 5, selected: true },
  { day: 'Sun', date: 6 },
  { day: 'Mon', date: 7 },
  { day: 'Tue', date: 8 },
];

const tasks = [
  {
    id: '1',
    title: 'Meditation',
    type: 'Task',
    time: '06:00 AM',
    icon: 'access-time',
    completed: false,
    failed: false,
  },
  {
    id: '2',
    title: 'Smoking',
    type: 'Habit',
    time: '12:00 PM',
    icon: 'block',
    completed: false,
    failed: true,
  },
  {
    id: '3',
    title: 'Drink water',
    type: 'Task',
    time: '06:00 PM',
    icon: 'access-time',
    completed: true,
    failed: false,
  },
];

export default function TodayScreen() {
  const [taskList, setTaskList] = useState(tasks);

  const toggleTask = (id, type) => {
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
        <Ionicons name="search" size={24} color="#fff" style={{ marginHorizontal: 8 }} />
        <MaterialIcons name="calendar-today" size={24} color="#fff" style={{ marginHorizontal: 8 }} />
        <MaterialIcons name="help-outline" size={24} color="#fff" style={{ marginHorizontal: 8 }} />
      </View>
      {/* Date Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateBar}>
        {days.map((d, idx) => (
          <View
            key={d.date}
            style={[styles.dateItem, d.selected && styles.selectedDateItem]}
          >
            <Text style={[styles.dateDay, d.selected && styles.selectedDateDay]}>{d.day}</Text>
            <Text style={[styles.dateNum, d.selected && styles.selectedDateNum]}>{d.date}</Text>
          </View>
        ))}
      </ScrollView>
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
          <View style={styles.taskItem}>
            <View style={styles.taskIconBox}>
              <MaterialIcons name={item.icon} size={28} color="#F06292" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Text style={[styles.taskType, item.type === 'Habit' ? styles.habitType : styles.taskType]}>{item.type}</Text>
                <MaterialIcons name="notifications-none" size={16} color="#fff" style={{ marginLeft: 8 }} />
                <Text style={styles.taskTime}>{item.time}</Text>
              </View>
            </View>
            {item.completed ? (
              <TouchableOpacity onPress={() => toggleTask(item.id, 'complete')}>
                <MaterialIcons name="check-circle" size={32} color="#43A047" />
              </TouchableOpacity>
            ) : item.failed ? (
              <TouchableOpacity onPress={() => toggleTask(item.id, 'fail')}>
                <MaterialIcons name="cancel" size={32} color="#E53935" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => toggleTask(item.id, 'complete')}>
                <MaterialIcons name="access-time" size={32} color="#757575" />
              </TouchableOpacity>
            )}
          </View>
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
  dateBar: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
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
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232325',
    borderRadius: 16,
    marginHorizontal: 8,
    marginVertical: 6,
    padding: 16,
  },
  taskIconBox: {
    backgroundColor: '#232325',
    borderRadius: 12,
    marginRight: 16,
    padding: 6,
  },
  taskTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskType: {
    color: '#F06292',
    fontSize: 14,
    marginRight: 8,
  },
  habitType: {
    color: '#E57373',
  },
  taskTime: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
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