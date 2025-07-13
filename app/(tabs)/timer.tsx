import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, TextInput } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const DEFAULT_WORK_DURATION = 25 * 60; // 25 min
const BREAK_DURATION = 5 * 60; // 5 min
const LONG_BREAK_DURATION = 30 * 60; // 30 min
const CYCLES_BEFORE_LONG_BREAK = 4;

const getResponsiveFontSize = () => (windowWidth < 400 ? 36 : windowWidth < 600 ? 48 : 64);
const getResponsiveBtnPadding = () => (windowWidth < 400 ? 8 : 12);
const getResponsiveBtnFont = () => (windowWidth < 400 ? 14 : 18);

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

type TimerButtonProps = {
  onPress: () => void;
  icon: React.ReactNode;
  label: string;
  color: string;
  fontSize: number;
};

function TimerButton({ onPress, icon, label, color, fontSize }: TimerButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.timerBtn,
        { backgroundColor: color, paddingVertical: getResponsiveBtnPadding(), paddingHorizontal: getResponsiveBtnPadding() * 2 },
      ]}
      onPress={onPress}
    >
      {icon}
      <Text style={[styles.timerBtnLabel, { fontSize }]}>{label}</Text>
    </TouchableOpacity>
  );
}

type TimerDisplayProps = {
  label: string;
  time: string;
  onEdit?: () => void;
};

function TimerDisplay({ label, time, onEdit }: TimerDisplayProps) {
  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <Text style={styles.cycleText} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={{ marginLeft: 8 }}>
            <MaterialIcons name="edit" size={20} color="#F06292" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.timerText, { fontSize: getResponsiveFontSize() }]} numberOfLines={1} adjustsFontSizeToFit>{time}</Text>
    </View>
  );
}

export default function TimerScreen() {
  useKeepAwake();
  const [tab, setTab] = useState<'pomodoro' | 'stopwatch' | 'intervals'>('pomodoro');
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>('PORTRAIT');

  // Editable work session
  const [workDuration, setWorkDuration] = useState(DEFAULT_WORK_DURATION);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editValue, setEditValue] = useState('25');

  // Pomodoro state
  const [isRunning, setIsRunning] = useState(false);
  const [isWork, setIsWork] = useState(true);
  const [seconds, setSeconds] = useState(workDuration);
  const [cycle, setCycle] = useState(1);
  const intervalRef = useRef<number | null>(null);

  // Stopwatch state
  const [swRunning, setSwRunning] = useState(false);
  const [swSeconds, setSwSeconds] = useState(0);
  const swIntervalRef = useRef<number | null>(null);

  // Orientation toggle handler
  const toggleOrientation = async () => {
    if (orientation === 'PORTRAIT') {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setOrientation('LANDSCAPE');
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      setOrientation('PORTRAIT');
    }
  };

  // Handle background timer
  useEffect(() => {
    if (tab === 'pomodoro' && isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 1) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (isWork) {
              // End of work session
              if (cycle === CYCLES_BEFORE_LONG_BREAK) {
                setCycle(1);
                setIsWork(false);
                setSeconds(LONG_BREAK_DURATION);
              } else {
                setIsWork(false);
                setSeconds(BREAK_DURATION);
              }
            } else {
              // End of break
              setIsWork(true);
              setSeconds(workDuration);
              setCycle((c) => (cycle === CYCLES_BEFORE_LONG_BREAK ? 1 : c + 1));
            }
            return prev - 1;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isWork, cycle, tab, workDuration]);

  // Stopwatch logic
  useEffect(() => {
    if (tab === 'stopwatch' && swRunning) {
      swIntervalRef.current = setInterval(() => {
        setSwSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (swIntervalRef.current !== null) {
        clearInterval(swIntervalRef.current);
      }
    };
  }, [swRunning, tab]);

  // Reset timer when switching tabs or work duration changes
  useEffect(() => {
    if (tab === 'pomodoro') {
      setIsRunning(false);
      setIsWork(true);
      setSeconds(workDuration);
      setCycle(1);
    } else if (tab === 'stopwatch') {
      setSwRunning(false);
      setSwSeconds(0);
    }
  }, [tab, workDuration]);

  // Landscape support: use flex layout
  const isLandscape = windowWidth > windowHeight;

  // UI for Pomodoro
  const PomodoroUI = (
    <View style={styles.timerContainer}>
      <TimerDisplay
        label={isWork ? `Work Session ${cycle}/${CYCLES_BEFORE_LONG_BREAK}` : cycle === 1 ? 'Long Break' : 'Break'}
        time={formatTime(seconds)}
        onEdit={isWork ? () => setEditModalVisible(true) : undefined}
      />
      <View style={styles.timerBtnRow}>
        <TimerButton
          onPress={() => setIsRunning((r) => !r)}
          icon={<MaterialIcons name={isRunning ? 'pause' : 'play-arrow'} size={28} color="#fff" />}
          label={isRunning ? 'Pause' : 'Start'}
          color={isRunning ? '#E57373' : '#F06292'}
          fontSize={getResponsiveBtnFont()}
        />
        <TimerButton
          onPress={() => {
            setIsRunning(false);
            setIsWork(true);
            setSeconds(workDuration);
            setCycle(1);
          }}
          icon={<MaterialIcons name="replay" size={28} color="#fff" />}
          label="Reset"
          color="#232325"
          fontSize={getResponsiveBtnFont()}
        />
      </View>
      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ color: '#fff', fontSize: 18, marginBottom: 12 }}>Edit Work Session (minutes)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={editValue}
              onChangeText={setEditValue}
              maxLength={3}
            />
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#F06292' }]}
                onPress={() => {
                  const min = Math.max(1, Math.min(180, parseInt(editValue) || 25));
                  setWorkDuration(min * 60);
                  setSeconds(min * 60);
                  setEditModalVisible(false);
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#232325', marginLeft: 12 }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  // UI for Stopwatch
  const StopwatchUI = (
    <View style={styles.timerContainer}>
      <TimerDisplay label="Stopwatch" time={formatTime(swSeconds)} onEdit={undefined} />
      <View style={styles.timerBtnRow}>
        <TimerButton
          onPress={() => setSwRunning((r) => !r)}
          icon={<MaterialIcons name={swRunning ? 'pause' : 'play-arrow'} size={28} color="#fff" />}
          label={swRunning ? 'Pause' : 'Start'}
          color={swRunning ? '#E57373' : '#F06292'}
          fontSize={getResponsiveBtnFont()}
        />
        <TimerButton
          onPress={() => {
            setSwRunning(false);
            setSwSeconds(0);
          }}
          icon={<MaterialIcons name="replay" size={28} color="#fff" />}
          label="Reset"
          color="#232325"
          fontSize={getResponsiveBtnFont()}
        />
      </View>
    </View>
  );

  // UI for Intervals (Pomodoro only)
  const IntervalsUI = PomodoroUI;

  return (
    <View style={[styles.container, isLandscape && { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}> 
      <View style={{ flex: 1 }}>
        {/* Orientation Toggle Button */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16 }}>
          <TouchableOpacity onPress={toggleOrientation} style={{ padding: 8 }}>
            <MaterialIcons name="screen-rotation" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity style={[styles.tabBtn, tab === 'stopwatch' && styles.tabBtnActive]} onPress={() => setTab('stopwatch')}>
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="timer-outline" size={22} color={tab === 'stopwatch' ? '#F06292' : '#fff'} />
              <Text style={[styles.tabLabel, tab === 'stopwatch' && styles.tabLabelActive, { fontSize: 12 }]}>Stopwatch</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'pomodoro' && styles.tabBtnActive]} onPress={() => setTab('pomodoro')}>
            <View style={{ alignItems: 'center' }}>
              <MaterialIcons name="timer" size={22} color={tab === 'pomodoro' ? '#F06292' : '#fff'} />
              <Text style={[styles.tabLabel, tab === 'pomodoro' && styles.tabLabelActive, { fontSize: 12 }]}>Pomodoro</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'intervals' && styles.tabBtnActive]} onPress={() => setTab('intervals')}>
            <View style={{ alignItems: 'center' }}>
              <MaterialIcons name="timer" size={22} color={tab === 'intervals' ? '#F06292' : '#fff'} />
              <Text style={[styles.tabLabel, tab === 'intervals' && styles.tabLabelActive, { fontSize: 12 }]}>Intervals</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* Timer UI */}
        {tab === 'pomodoro' && PomodoroUI}
        {tab === 'stopwatch' && StopwatchUI}
        {tab === 'intervals' && IntervalsUI}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151718',
    paddingTop: 32,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    minWidth: 0,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
    width: '100%',
    minWidth: 0,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'transparent',
    minWidth: 0,
    flexShrink: 1,
  },
  tabBtnActive: {
    backgroundColor: '#232325',
  },
  tabLabel: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    flexShrink: 1,
    minWidth: 0,
  },
  tabLabelActive: {
    color: '#F06292',
    fontWeight: 'bold',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    width: '100%',
    minWidth: 0,
  },
  cycleText: {
    color: '#F06292',
    fontSize: 18,
    marginBottom: 8,
    fontWeight: 'bold',
    width: '90%',
    textAlign: 'center',
    minWidth: 0,
  },
  timerText: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 24,
    width: '90%',
    textAlign: 'center',
    minWidth: 0,
  },
  timerBtnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    width: '100%',
    minWidth: 0,
  },
  timerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 8,
    minWidth: 0,
    flexShrink: 1,
  },
  timerBtnLabel: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
    flexShrink: 1,
    minWidth: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#232325',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: 280,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    width: 80,
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 8,
  },
  modalBtn: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
}); 