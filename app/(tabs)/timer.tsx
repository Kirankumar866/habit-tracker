import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// Responsive font and button sizes
const getResponsiveFontSize = () => (windowWidth < 400 ? 36 : windowWidth < 600 ? 48 : 64);
const getResponsiveBtnPadding = () => (windowWidth < 400 ? 8 : 12);
const getResponsiveBtnFont = () => (windowWidth < 400 ? 14 : 18);

const WORK_DURATION = 25 * 60; // 25 min
const BREAK_DURATION = 5 * 60; // 5 min
const LONG_BREAK_DURATION = 30 * 60; // 30 min
const CYCLES_BEFORE_LONG_BREAK = 4;

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function TimerScreen() {
  useKeepAwake();
  const [tab, setTab] = useState<'pomodoro' | 'stopwatch' | 'intervals'>('pomodoro');
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>('PORTRAIT');

  // Pomodoro state
  const [isRunning, setIsRunning] = useState(false);
  const [isWork, setIsWork] = useState(true);
  const [seconds, setSeconds] = useState(WORK_DURATION);
  const [cycle, setCycle] = useState(1);
  const intervalRef = useRef<number | null>(null);

  // Stopwatch state
  const [swRunning, setSwRunning] = useState(false);
  const [swSeconds, setSwSeconds] = useState(0);
  const swIntervalRef = useRef<number | null>(null);

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
              setSeconds(WORK_DURATION);
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
  }, [isRunning, isWork, cycle, tab]);

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

  // Reset timer when switching tabs
  useEffect(() => {
    if (tab === 'pomodoro') {
      setIsRunning(false);
      setIsWork(true);
      setSeconds(WORK_DURATION);
      setCycle(1);
    } else if (tab === 'stopwatch') {
      setSwRunning(false);
      setSwSeconds(0);
    }
  }, [tab]);

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

  // Landscape support: use flex layout
  const isLandscape = windowWidth > windowHeight;

  // UI for Pomodoro
  const PomodoroUI = (
    <View style={styles.timerContainer}>
      <Text style={styles.cycleText} numberOfLines={1} adjustsFontSizeToFit>
        {isWork ? `Work Session ${cycle}/${CYCLES_BEFORE_LONG_BREAK}` : cycle === 1 ? 'Long Break' : 'Break'}
      </Text>
      <Text style={[styles.timerText, { fontSize: getResponsiveFontSize() }]} numberOfLines={1} adjustsFontSizeToFit>{formatTime(seconds)}</Text>
      <View style={styles.timerBtnRow}>
        <TouchableOpacity
          style={[styles.timerBtn, { backgroundColor: isRunning ? '#E57373' : '#F06292', paddingVertical: getResponsiveBtnPadding(), paddingHorizontal: getResponsiveBtnPadding() * 2 }]}
          onPress={() => setIsRunning((r) => !r)}
        >
          <MaterialIcons name={isRunning ? 'pause' : 'play-arrow'} size={28} color="#fff" />
          <Text style={[styles.timerBtnLabel, { fontSize: getResponsiveBtnFont() }]}>{isRunning ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timerBtn, { backgroundColor: '#232325', paddingVertical: getResponsiveBtnPadding(), paddingHorizontal: getResponsiveBtnPadding() * 2 }]}
          onPress={() => {
            setIsRunning(false);
            setIsWork(true);
            setSeconds(WORK_DURATION);
            setCycle(1);
          }}
        >
          <MaterialIcons name="replay" size={28} color="#fff" />
          <Text style={[styles.timerBtnLabel, { fontSize: getResponsiveBtnFont() }]}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // UI for Stopwatch
  const StopwatchUI = (
    <View style={styles.timerContainer}>
      <Text style={styles.cycleText} numberOfLines={1} adjustsFontSizeToFit>Stopwatch</Text>
      <Text style={[styles.timerText, { fontSize: getResponsiveFontSize() }]} numberOfLines={1} adjustsFontSizeToFit>{formatTime(swSeconds)}</Text>
      <View style={styles.timerBtnRow}>
        <TouchableOpacity
          style={[styles.timerBtn, { backgroundColor: swRunning ? '#E57373' : '#F06292', paddingVertical: getResponsiveBtnPadding(), paddingHorizontal: getResponsiveBtnPadding() * 2 }]}
          onPress={() => setSwRunning((r) => !r)}
        >
          <MaterialIcons name={swRunning ? 'pause' : 'play-arrow'} size={28} color="#fff" />
          <Text style={[styles.timerBtnLabel, { fontSize: getResponsiveBtnFont() }]}>{swRunning ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timerBtn, { backgroundColor: '#232325', paddingVertical: getResponsiveBtnPadding(), paddingHorizontal: getResponsiveBtnPadding() * 2 }]}
          onPress={() => {
            setSwRunning(false);
            setSwSeconds(0);
          }}
        >
          <MaterialIcons name="replay" size={28} color="#fff" />
          <Text style={[styles.timerBtnLabel, { fontSize: getResponsiveBtnFont() }]}>Reset</Text>
        </TouchableOpacity>
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
              <Text style={[styles.tabLabel, tab === 'stopwatch' && styles.tabLabelActive, { fontSize: 12 }]}>
                Stopwatch
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'pomodoro' && styles.tabBtnActive]} onPress={() => setTab('pomodoro')}>
            <View style={{ alignItems: 'center' }}>
              <MaterialIcons name="timer" size={22} color={tab === 'pomodoro' ? '#F06292' : '#fff'} />
              <Text style={[styles.tabLabel, tab === 'pomodoro' && styles.tabLabelActive, { fontSize: 12 }]}>
                Pomodoro
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'intervals' && styles.tabBtnActive]} onPress={() => setTab('intervals')}>
            <View style={{ alignItems: 'center' }}>
              <MaterialIcons name="timer" size={22} color={tab === 'intervals' ? '#F06292' : '#fff'} />
              <Text style={[styles.tabLabel, tab === 'intervals' && styles.tabLabelActive, { fontSize: 12 }]}>
                Intervals
              </Text>
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
}); 