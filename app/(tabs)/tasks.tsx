import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Switch, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { Modal as RNModal } from 'react-native';

const PRIMARY = '#F06292';
const BG = '#151718';
const CARD = '#232325';
const TEXT = '#fff';
const INACTIVE = '#888';

const TASKS_KEY = 'TASKS_LIST';

function getTodayStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function AddTypeModal({ visible, onClose, onSelectTask }: { visible: boolean; onClose: () => void; onSelectTask: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.addTypeSheet}>
          <TouchableOpacity style={styles.addTypeBtn}>
            <FontAwesome5 name="trophy" size={24} color={PRIMARY} style={{ marginRight: 16 }} />
            <View>
              <Text style={styles.addTypeTitle}>Habit</Text>
              <Text style={styles.addTypeDesc}>Activity that repeats over time. It has detailed tracking and statistics.</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addTypeBtn}>
            <MaterialIcons name="repeat" size={24} color={PRIMARY} style={{ marginRight: 16 }} />
            <View>
              <Text style={styles.addTypeTitle}>Recurring Task</Text>
              <Text style={styles.addTypeDesc}>Activity that repeats over time without tracking or statistics.</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addTypeBtn} onPress={onSelectTask}>
            <MaterialIcons name="check-circle" size={24} color={PRIMARY} style={{ marginRight: 16 }} />
            <View>
              <Text style={styles.addTypeTitle}>Task</Text>
              <Text style={styles.addTypeDesc}>Single instance activity without tracking over time.</Text>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function AddTaskModal({
  visible,
  onClose,
  newTask,
  setNewTask,
  checklist,
  setChecklist,
  checkInput,
  setCheckInput,
  onConfirm,
  editMode
}: {
  visible: boolean;
  onClose: () => void;
  newTask: any;
  setNewTask: (t: any) => void;
  checklist: string[];
  setChecklist: (c: string[]) => void;
  checkInput: string;
  setCheckInput: (s: string) => void;
  onConfirm: () => void;
  editMode: boolean;
}) {
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showReminderModal, setShowReminderModal] = React.useState(false);
  const [showNewReminderModal, setShowNewReminderModal] = React.useState(false);
  const [reminderTime, setReminderTime] = React.useState(new Date());
  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const [reminderType, setReminderType] = React.useState<'none' | 'notification' | 'alarm'>('notification');
  const [reminderSchedule, setReminderSchedule] = React.useState<'always' | 'days' | 'before'>('always');
  const today = new Date();
  const selectedDate = newTask.date ? new Date(newTask.date) : today;
  const isToday = selectedDate.toDateString() === today.toDateString();
  function formatDate(date: Date) {
    if (date.toDateString() === today.toDateString()) return 'Today';
    return date.toISOString().split('T')[0];
  }
  function formatTime(date: Date) {
    let h = date.getHours();
    let m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  }
  // Save reminder to newTask and schedule notification
  const handleConfirmReminder = async () => {
    let notificationId = null;
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please enable notifications in your settings.');
        return;
      }
      // Schedule notification
      const now = new Date();
      let triggerDate = new Date(selectedDate);
      triggerDate.setHours(reminderTime.getHours());
      triggerDate.setMinutes(reminderTime.getMinutes());
      triggerDate.setSeconds(0);
      if (triggerDate < now) {
        // If the time is in the past for today, schedule for tomorrow
        triggerDate.setDate(triggerDate.getDate() + 1);
      }
      notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder',
          body: newTask.name ? `It's time for: ${newTask.name}` : 'You have a scheduled task!',
          sound: true,
        },
        trigger: triggerDate,
      });
    } else {
      Alert.alert('Not supported', 'Reminders are only available on iOS and Android.');
    }
    setNewTask({
      ...newTask,
      reminder: {
        time: reminderTime.toTimeString().slice(0, 5),
        type: reminderType,
        schedule: reminderSchedule,
        notificationId,
      },
    });
    setShowNewReminderModal(false);
    setShowReminderModal(false);
  };
  // Add a ref for the web time input
  const webTimeInputRef = React.useRef<HTMLInputElement>(null);
  return (
    <Modal visible={visible} animationType="slide">
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: BG }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.taskModalHeader}>
            <Text style={styles.taskModalTitle}>{editMode ? 'Edit Task' : 'New Task'}</Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Task"
              placeholderTextColor={INACTIVE}
              value={newTask.name}
              onChangeText={v => setNewTask({ ...newTask, name: v })}
            />
          </View>
          <View style={styles.rowBetween}>
            <View style={styles.inputGroupRow}>
              <MaterialIcons name="category" size={24} color={PRIMARY} style={{ marginRight: 12 }} />
              <Text style={styles.inputLabel}>Category</Text>
            </View>
            <TouchableOpacity style={styles.categoryBtn}>
              <Text style={styles.categoryBtnText}>Task</Text>
              <MaterialIcons name="access-time" size={20} color={PRIMARY} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
          <View style={styles.rowBetween}>
            <View style={styles.inputGroupRow}>
              <MaterialIcons name="date-range" size={24} color={PRIMARY} style={{ marginRight: 12 }} />
              <Text style={styles.inputLabel}>Date</Text>
            </View>
            <TouchableOpacity style={styles.categoryBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.categoryBtnText}>{formatDate(selectedDate)}</Text>
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={today}
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  setNewTask({ ...newTask, date: date.toISOString().split('T')[0] });
                }
              }}
            />
          )}
          <View style={styles.rowBetween}>
            <View style={styles.inputGroupRow}>
              <MaterialIcons name="notifications" size={24} color={PRIMARY} style={{ marginRight: 12 }} />
              <Text style={styles.inputLabel}>Time and reminders</Text>
            </View>
            <TouchableOpacity style={styles.categoryBtn} onPress={() => setShowReminderModal(true)}>
              <Text style={styles.categoryBtnText}>{newTask.reminder ? formatTime(new Date(today.toDateString() + 'T' + newTask.reminder.time + ':00')) : '0'}</Text>
            </TouchableOpacity>
          </View>
          {/* Reminder Modal */}
          <Modal visible={showReminderModal} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: CARD, borderRadius: 24, padding: 32, width: 320, alignItems: 'center' }}>
                <Text style={{ color: TEXT, fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>Time and reminders</Text>
                <MaterialIcons name="notifications" size={64} color={PRIMARY} style={{ marginBottom: 16 }} />
                <Text style={{ color: INACTIVE, fontSize: 16, marginBottom: 16 }}>No reminders for this activity</Text>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }} onPress={() => { setShowReminderModal(false); setShowNewReminderModal(true); }}>
                  <MaterialIcons name="add-circle-outline" size={24} color={PRIMARY} style={{ marginRight: 8 }} />
                  <Text style={{ color: PRIMARY, fontWeight: 'bold', fontSize: 16 }}>NEW REMINDER</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 8 }} onPress={() => setShowReminderModal(false)}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>CLOSE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          {/* New Reminder Modal */}
          <Modal visible={showNewReminderModal} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: CARD, borderRadius: 24, padding: 32, width: 340, alignItems: 'center' }}>
                <Text style={{ color: TEXT, fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>New reminder</Text>
                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS === 'web') {
                      webTimeInputRef.current?.focus();
                    } else {
                      setShowTimePicker(true);
                    }
                  }}
                  style={{ marginBottom: 16 }}
                >
                  <Text style={{ color: PRIMARY, fontWeight: 'bold', fontSize: 36 }}>{formatTime(reminderTime)}</Text>
                  <Text style={{ color: PRIMARY, fontSize: 16, textAlign: 'center' }}>Reminder time</Text>
                </TouchableOpacity>
                {/* Native time picker for iOS/Android */}
                {showTimePicker && Platform.OS !== 'web' && (
                  <DateTimePicker
                    value={reminderTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                      setShowTimePicker(false);
                      if (date) setReminderTime(date);
                    }}
                  />
                )}
                {/* Web time picker */}
                {Platform.OS === 'web' && (
                  <input
                    ref={webTimeInputRef}
                    type="time"
                    style={{ fontSize: 24, marginBottom: 16, background: 'transparent', color: PRIMARY, border: 'none', outline: 'none', textAlign: 'center' }}
                    value={reminderTime.toTimeString().slice(0,5)}
                    onChange={e => {
                      const [h, m] = e.target.value.split(':');
                      const newDate = new Date(reminderTime);
                      newDate.setHours(Number(h));
                      newDate.setMinutes(Number(m));
                      setReminderTime(newDate);
                    }}
                  />
                )}
                <Text style={{ color: PRIMARY, fontWeight: 'bold', fontSize: 16, marginTop: 8, marginBottom: 8 }}>Reminder type</Text>
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  <TouchableOpacity onPress={() => setReminderType('none')} style={{ flex: 1, alignItems: 'center', padding: 8, backgroundColor: reminderType === 'none' ? CARD : 'transparent', borderRadius: 8 }}>
                    <MaterialIcons name="notifications-off" size={28} color={reminderType === 'none' ? PRIMARY : INACTIVE} />
                    <Text style={{ color: reminderType === 'none' ? PRIMARY : INACTIVE, fontSize: 13 }}>Don't remind</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setReminderType('notification')} style={{ flex: 1, alignItems: 'center', padding: 8, backgroundColor: reminderType === 'notification' ? CARD : 'transparent', borderRadius: 8 }}>
                    <MaterialIcons name="notifications" size={28} color={reminderType === 'notification' ? PRIMARY : INACTIVE} />
                    <Text style={{ color: reminderType === 'notification' ? PRIMARY : INACTIVE, fontSize: 13 }}>Notification</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setReminderType('alarm')} style={{ flex: 1, alignItems: 'center', padding: 8, backgroundColor: reminderType === 'alarm' ? CARD : 'transparent', borderRadius: 8 }}>
                    <MaterialIcons name="alarm" size={28} color={reminderType === 'alarm' ? PRIMARY : INACTIVE} />
                    <Text style={{ color: reminderType === 'alarm' ? PRIMARY : INACTIVE, fontSize: 13 }}>Alarm</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ color: PRIMARY, fontWeight: 'bold', fontSize: 16, marginTop: 8, marginBottom: 8 }}>Reminder schedule</Text>
                <View style={{ width: '100%', marginBottom: 16 }}>
                  <TouchableOpacity onPress={() => setReminderSchedule('always')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <MaterialIcons name={reminderSchedule === 'always' ? 'radio-button-checked' : 'radio-button-unchecked'} size={22} color={reminderSchedule === 'always' ? PRIMARY : INACTIVE} style={{ marginRight: 8 }} />
                    <Text style={{ color: reminderSchedule === 'always' ? PRIMARY : TEXT, fontSize: 15 }}>Always enabled</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setReminderSchedule('days')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <MaterialIcons name={reminderSchedule === 'days' ? 'radio-button-checked' : 'radio-button-unchecked'} size={22} color={reminderSchedule === 'days' ? PRIMARY : INACTIVE} style={{ marginRight: 8 }} />
                    <Text style={{ color: reminderSchedule === 'days' ? PRIMARY : TEXT, fontSize: 15 }}>Specific days of the week</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setReminderSchedule('before')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name={reminderSchedule === 'before' ? 'radio-button-checked' : 'radio-button-unchecked'} size={22} color={reminderSchedule === 'before' ? PRIMARY : INACTIVE} style={{ marginRight: 8 }} />
                    <Text style={{ color: reminderSchedule === 'before' ? PRIMARY : TEXT, fontSize: 15 }}>Days before</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', width: '100%', marginTop: 16 }}>
                  <TouchableOpacity style={{ flex: 1, backgroundColor: CARD, borderRadius: 12, paddingVertical: 14, marginRight: 8, alignItems: 'center' }} onPress={onClose}>
                    <Text style={{ color: INACTIVE, fontWeight: 'bold', fontSize: 16 }}>CANCEL</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 14, marginLeft: 8, alignItems: 'center' }} onPress={handleConfirmReminder}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>CONFIRM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          <View style={styles.rowBetween}>
            <View style={styles.inputGroupRow}>
              <MaterialIcons name="flag" size={24} color={PRIMARY} style={{ marginRight: 12 }} />
              <Text style={styles.inputLabel}>Priority</Text>
            </View>
            <TouchableOpacity style={styles.categoryBtn}>
              <Text style={styles.categoryBtnText}>Default</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Note</Text>
            <TextInput
              style={styles.input}
              placeholder="Note"
              placeholderTextColor={INACTIVE}
              value={newTask.note}
              onChangeText={v => setNewTask({ ...newTask, note: v })}
              multiline
            />
          </View>
          <View style={styles.rowBetween}>
            <View style={styles.inputGroupRow}>
              <MaterialIcons name="event-note" size={24} color={PRIMARY} style={{ marginRight: 12 }} />
              <Text style={styles.inputLabel}>Pending task</Text>
            </View>
            <TouchableOpacity onPress={() => setNewTask({ ...newTask, pending: !newTask.pending })}>
              {newTask.pending ? (
                <MaterialIcons name="check-circle" size={32} color="#F06292" />
              ) : (
                <MaterialIcons name="access-time" size={32} color="#757575" />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.modalBtnRow}>
            <TouchableOpacity style={styles.modalBtnCancel} onPress={onClose}>
              <Text style={styles.modalBtnCancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnConfirm} onPress={onConfirm}>
              <Text style={styles.modalBtnConfirmText}>CONFIRM</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function TasksScreen() {
  const [tab, setTab] = useState<'single' | 'recurring'>('single');
  const [tasks, setTasks] = useState<any[]>([]);
  const [showAddType, setShowAddType] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    category: '',
    date: getTodayStr(),
    time: '',
    checklist: [],
    priority: 'Default',
    note: '',
    pending: true,
  });
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
      setTasks(tasks.filter(t => t.id !== selectedTask.id));
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
      setTasks(tasks.map(t => t.id === newTask.id ? { ...newTask } : t));
      setEditMode(false);
    } else {
      const task = { ...newTask, checklist };
      setTasks([{ ...task, id: Date.now().toString() }, ...tasks]);
    }
    setShowTaskModal(false);
    setShowAddType(false);
    setNewTask({ name: '', category: '', date: getTodayStr(), time: '', checklist: [], priority: 'Default', note: '', pending: true });
    setChecklist([]);
    setCheckInput('');
  };

  // Handler for confirming new time
  const handleRescheduleTime = (event, date) => {
    setShowRescheduleTimePicker(false);
    if (date && rescheduleTask) {
      // Update the reminder time in the tasks list and AsyncStorage
      const newTime = date.toTimeString().slice(0, 5);
      const updatedTasks = tasks.map(t =>
        t.id === rescheduleTask.id
          ? { ...t, reminder: { ...t.reminder, time: newTime } }
          : t
      );
      setTasks(updatedTasks);
      AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
      setRescheduleTask(null);
    }
  };

  // Render task item
  const renderTask = ({ item }: { item: any }) => (
    <TouchableOpacity
      onLongPress={() => {
        setSelectedTask(item);
        setShowTaskDetail(true);
      }}
      activeOpacity={0.85}
    >
      <View style={styles.taskItemRow}>
        <View style={styles.taskIconBox}><MaterialIcons name="access-time" size={28} color={PRIMARY} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.taskTitle}>{item.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <MaterialIcons name="access-time" size={16} color={INACTIVE} style={{ marginRight: 4 }} />
            <Text style={styles.taskTime}>
              {item.reminder && item.reminder.time
                ? (() => {
                    const [h, m] = item.reminder.time.split(":");
                    let hour = parseInt(h, 10);
                    const min = m.padStart(2, "0");
                    const ampm = hour >= 12 ? "PM" : "AM";
                    hour = hour % 12;
                    hour = hour ? hour : 12;
                    return `${hour.toString().padStart(2, "0")}:${min} ${ampm}`;
                  })()
                : "--:--"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          <FlatList
            data={tasks}
            keyExtractor={item => item.id}
            renderItem={renderTask}
            ListEmptyComponent={<Text style={styles.emptyText}>No tasks yet.</Text>}
            contentContainerStyle={{ flexGrow: 1 }}
          />
        </>
      ) : (
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>Recurring tasks coming soon...</Text>
        </View>
      )}
      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddType(true)}>
        <MaterialIcons name="add" size={36} color={TEXT} />
      </TouchableOpacity>
      {/* Modals */}
      <AddTypeModal visible={showAddType} onClose={() => setShowAddType(false)} onSelectTask={() => { setShowAddType(false); setShowTaskModal(true); }} />
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
      {/* Task Detail Bottom Sheet */}
      <RNModal
        visible={showTaskDetail}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTaskDetail(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 320 }}>
            {selectedTask && (
              <>
                <Text style={{ color: TEXT, fontWeight: 'bold', fontSize: 22, marginBottom: 8 }}>{selectedTask.name}</Text>
                <Text style={{ color: PRIMARY, fontWeight: 'bold', fontSize: 16, marginBottom: 16 }}>{selectedTask.date}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                  <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="access-time" size={28} color={PRIMARY} />
                    <Text style={{ color: INACTIVE, fontSize: 13 }}>Reminders</Text>
                    <Text style={{ color: TEXT, fontWeight: 'bold', fontSize: 16 }}>
                      {selectedTask.reminder && selectedTask.reminder.time
                        ? (() => {
                            const [h, m] = selectedTask.reminder.time.split(":");
                            let hour = parseInt(h, 10);
                            const min = m.padStart(2, "0");
                            const ampm = hour >= 12 ? "PM" : "AM";
                            hour = hour % 12;
                            hour = hour ? hour : 12;
                            return `${hour.toString().padStart(2, "0")}:${min} ${ampm}`;
                          })()
                        : "--:--"}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="notes" size={28} color={PRIMARY} />
                    <Text style={{ color: INACTIVE, fontSize: 13 }}>Note</Text>
                    <Text style={{ color: TEXT, fontWeight: 'bold', fontSize: 16 }}>{selectedTask.note || '-'}</Text>
                  </View>
                </View>
                <TouchableOpacity style={{ marginVertical: 8 }} onPress={handleRescheduleTask}>
                  <Text style={{ color: PRIMARY, fontWeight: 'bold', fontSize: 16 }}>Reschedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginVertical: 8 }} onPress={handleDeleteTask}>
                  <Text style={{ color: INACTIVE, fontWeight: 'bold', fontSize: 16 }}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginVertical: 8 }} onPress={handleEditTask}>
                  <Text style={{ color: TEXT, fontWeight: 'bold', fontSize: 16 }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 16, alignSelf: 'center' }} onPress={() => setShowTaskDetail(false)}>
                  <Text style={{ color: PRIMARY, fontWeight: 'bold', fontSize: 16 }}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </RNModal>
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
}); 