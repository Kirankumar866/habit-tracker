import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Switch, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { Modal as RNModal } from 'react-native';
import TaskList from './tasks/TaskList';
import TaskDetailsModal from './tasks/TaskDetailsModal';
import AddTaskModal from './tasks/AddTaskModal';
import AddTypeModal from './tasks/AddTypeModal';

const PRIMARY = '#F06292';
const BG = '#151718';
const CARD = '#232325';
const TEXT = '#fff';
const INACTIVE = '#888';

const TASKS_KEY = 'TASKS_LIST';

function getTodayStr() {
  const d = new Date();
  // Use local date string in YYYY-MM-DD format
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Utility to parse a local date string (YYYY-MM-DD) to a Date object in local time
function parseLocalDateString(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export default function TasksScreen() {
  const [tab, setTab] = useState<'single' | 'recurring'>('single');
  const [tasks, setTasks] = useState<any[]>([]);
  const [showAddType, setShowAddType] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  // Default newTask object should always include 'reminder' and 'id'
  const defaultNewTask: {
    id?: string;
    name: string;
    category: string;
    type: string;
    date: string;
    time: string;
    checklist: string[];
    priority: string;
    note: string;
    pending: boolean;
    reminder?: any;
  } = {
    id: undefined,
    name: '',
    category: '',
    type: 'Task',
    date: getTodayStr(),
    time: '',
    checklist: [],
    priority: 'Default',
    note: '',
    pending: true,
    reminder: undefined,
  };
  const [newTask, setNewTask] = useState(defaultNewTask);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [checkInput, setCheckInput] = useState('');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // Add a state to track if reschedule mode is active
  const [rescheduleMode, setRescheduleMode] = useState(false);
  // Add a state for showing the reschedule time picker and the task being rescheduled
  const [showRescheduleTimePicker, setShowRescheduleTimePicker] = useState(false);
  const [rescheduleTask, setRescheduleTask] = useState<any | null>(null);

  // Load tasks from storage
  useEffect(() => {
    AsyncStorage.getItem(TASKS_KEY).then(data => {
      if (data) setTasks(JSON.parse(data));
    });
  }, []);

  // Save tasks to storage
  const saveTasks = (newTasks: any[]) => {
    setTasks(newTasks);
    AsyncStorage.setItem(TASKS_KEY, JSON.stringify(newTasks));
  };

  // Delete task handler
  const handleDeleteTask = () => {
    if (selectedTask) {
      const updatedTasks = tasks.filter(t => t.id !== selectedTask.id);
      saveTasks(updatedTasks);
      setShowTaskDetail(false);
      setSelectedTask(null);
    }
  };
  // Edit task handler
  const handleEditTask = () => {
    if (selectedTask) {
      setNewTask(selectedTask);
      setShowTaskModal(true);
      setEditMode(true);
      setShowTaskDetail(false);
    }
  };
  // Reschedule handler
  const handleRescheduleTask = () => {
    if (selectedTask) {
      setRescheduleTask(selectedTask);
      setShowRescheduleTimePicker(true);
      setShowTaskDetail(false);
    }
  };
  // Update task on confirm (edit mode)
  const handleConfirm = () => {
    if (editMode) {
      const updatedTasks = tasks.map(t => t.id === newTask.id ? { ...newTask } : t);
      saveTasks(updatedTasks);
      setEditMode(false);
    } else {
      const task = { ...newTask, id: Date.now().toString(), checklist };
      const updatedTasks = [{ ...task }, ...tasks];
      saveTasks(updatedTasks);
    }
    setShowTaskModal(false);
    setShowAddType(false);
    setNewTask(defaultNewTask);
    setChecklist([]);
    setCheckInput('');
  };

  // Handler for confirming new time
  const handleRescheduleTime = (event: any, date: Date | undefined) => {
    setShowRescheduleTimePicker(false);
    if (date && rescheduleTask) {
      // Update the reminder time in the tasks list and AsyncStorage
      const newTime = date.toTimeString().slice(0, 5);
      const updatedTasks = tasks.map(t =>
        t.id === rescheduleTask.id
          ? { ...t, reminder: { ...t.reminder, time: newTime } }
          : t
      );
      saveTasks(updatedTasks);
      setRescheduleTask(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <MaterialIcons name="menu" size={32} color={PRIMARY} style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Tasks</Text>
        <View style={{ flex: 1 }} />
        <Ionicons name="search" size={24} color={TEXT} style={{ marginHorizontal: 8 }} />
        <MaterialIcons name="filter-list" size={24} color={TEXT} style={{ marginHorizontal: 8 }} />
        <MaterialIcons name="download" size={24} color={TEXT} style={{ marginHorizontal: 8 }} />
      </View>
      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'single' && styles.tabBtnActive]} onPress={() => setTab('single')}>
          <Text style={[styles.tabLabel, tab === 'single' && styles.tabLabelActive]}>Single tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'recurring' && styles.tabBtnActive]} onPress={() => setTab('recurring')}>
          <Text style={[styles.tabLabel, tab === 'recurring' && styles.tabLabelActive]}>Recurring tasks</Text>
        </TouchableOpacity>
      </View>
      {/* Task List */}
      {tab === 'single' ? (
        <>
          <Text style={styles.todayLabel}>Today</Text>
          <TaskList
            tasks={tasks}
            onLongPress={item => {
              setSelectedTask(item);
              setShowTaskDetail(true);
            }}
          />
        </>
      ) : (
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>Recurring tasks coming soon...</Text>
        </View>
      )}
      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => {
        setNewTask({ ...defaultNewTask, id: Date.now().toString(), date: getTodayStr() });
        setEditMode(false);
        setShowAddType(true);
      }}>
        <MaterialIcons name="add" size={36} color={TEXT} />
      </TouchableOpacity>
      {/* Modals */}
      <AddTypeModal
        visible={showAddType}
        onClose={() => setShowAddType(false)}
        onSelectType={(type) => {
          setShowAddType(false);
          setNewTask({ ...defaultNewTask, id: Date.now().toString(), date: getTodayStr(), type });
          setEditMode(false);
          setShowTaskModal(true);
        }}
      />
      <AddTaskModal
        visible={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        newTask={newTask}
        setNewTask={setNewTask}
        checklist={checklist}
        setChecklist={setChecklist}
        checkInput={checkInput}
        setCheckInput={setCheckInput}
        onConfirm={handleConfirm}
        editMode={editMode}
      />
      <TaskDetailsModal
        visible={showTaskDetail}
        selectedTask={selectedTask}
        onClose={() => setShowTaskDetail(false)}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onReschedule={handleRescheduleTask}
      />
      {/* Reschedule Time Picker */}
      {showRescheduleTimePicker && (
        <DateTimePicker
          value={rescheduleTask && rescheduleTask.reminder && rescheduleTask.reminder.time ? (() => {
            const [h, m] = rescheduleTask.reminder.time.split(":");
            const d = new Date();
            d.setHours(Number(h));
            d.setMinutes(Number(m));
            d.setSeconds(0);
            return d;
          })() : new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleRescheduleTime}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingTop: 48,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerTitle: {
    color: TEXT,
    fontSize: 32,
    fontWeight: 'bold',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: CARD,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: PRIMARY,
  },
  tabLabel: {
    color: TEXT,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabLabelActive: {
    color: '#fff',
  },
  todayLabel: {
    color: INACTIVE,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  taskItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 16,
    marginHorizontal: 8,
    marginVertical: 6,
    padding: 16,
  },
  taskIconBox: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    marginRight: 16,
    padding: 6,
  },
  taskTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskTime: {
    color: INACTIVE,
    fontSize: 14,
    marginLeft: 2,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: PRIMARY,
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  addTypeSheet: {
    backgroundColor: CARD,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
  },
  addTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  addTypeTitle: {
    color: TEXT,
    fontWeight: 'bold',
    fontSize: 18,
  },
  addTypeDesc: {
    color: INACTIVE,
    fontSize: 13,
    marginTop: 2,
    maxWidth: 260,
  },
  taskModalHeader: {
    padding: 24,
    paddingBottom: 0,
  },
  taskModalTitle: {
    color: TEXT,
    fontWeight: 'bold',
    fontSize: 22,
  },
  inputGroup: {
    marginHorizontal: 24,
    marginTop: 18,
  },
  inputLabel: {
    color: PRIMARY,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: CARD,
    color: TEXT,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginTop: 18,
  },
  inputGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBtn: {
    backgroundColor: CARD,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBtnText: {
    color: PRIMARY,
    fontWeight: 'bold',
    fontSize: 16,
  },
  checklistBox: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 0,
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 12,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  checkItemText: {
    color: TEXT,
    fontSize: 16,
  },
  checkAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkInput: {
    flex: 1,
    backgroundColor: BG,
    color: TEXT,
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    marginRight: 8,
  },
  checkAddBtn: {
    backgroundColor: BG,
    borderRadius: 8,
    padding: 8,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginTop: 32,
    marginBottom: 32,
  },
  modalBtnCancel: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 12,
    paddingVertical: 14,
    marginRight: 8,
    alignItems: 'center',
  },
  modalBtnCancelText: {
    color: INACTIVE,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalBtnConfirm: {
    flex: 1,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalBtnConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    color: INACTIVE,
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
  placeholderBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: INACTIVE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskType: {
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 