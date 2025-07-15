import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Switch, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  onConfirm
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
}) {
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const today = new Date();
  const selectedDate = newTask.date ? new Date(newTask.date) : today;
  const isToday = selectedDate.toDateString() === today.toDateString();
  function formatDate(date: Date) {
    if (date.toDateString() === today.toDateString()) return 'Today';
    return date.toISOString().split('T')[0];
  }
  return (
    <Modal visible={visible} animationType="slide">
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: BG }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.taskModalHeader}>
            <Text style={styles.taskModalTitle}>New Task</Text>
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
            <TouchableOpacity style={styles.categoryBtn}>
              <Text style={styles.categoryBtnText}>0</Text>
            </TouchableOpacity>
          </View>
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

  // Add new task
  const handleConfirm = () => {
    const task = { ...newTask, checklist };
    saveTasks([{ ...task, id: Date.now().toString() }, ...tasks]);
    setShowTaskModal(false);
    setShowAddType(false);
    setNewTask({ name: '', category: '', date: getTodayStr(), time: '', checklist: [], priority: 'Default', note: '', pending: true });
    setChecklist([]);
    setCheckInput('');
  };

  // Render task item
  const renderTask = ({ item }: { item: any }) => (
    <View style={styles.taskItemRow}>
      <View style={styles.taskIconBox}><MaterialIcons name="access-time" size={28} color={PRIMARY} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.taskTitle}>{item.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <MaterialIcons name="access-time" size={16} color={INACTIVE} style={{ marginRight: 4 }} />
          <Text style={styles.taskTime}>{item.time || '12:00 PM'}</Text>
        </View>
      </View>
    </View>
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
      />
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