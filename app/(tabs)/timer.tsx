import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, TextInput, Platform, KeyboardAvoidingView, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';

const SPACING = 16;
const TAB_HEIGHT = 48;
const BUTTON_RADIUS = 16;
const COLORS = {
  pomodoro: '#C94F4F',
  short: '#3A86FF',
  long: '#FFD166',
  stopwatch: '#232325',
  white: '#fff',
  text: '#232325',
  shadow: 'rgba(0,0,0,0.08)'
};
const DEFAULT_DURATIONS = {
  pomodoro: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};
const MODES = [
  { key: 'pomodoro', label: 'Pomodoro' },
  { key: 'short', label: 'Short Break' },
  { key: 'long', label: 'Long Break' },
  { key: 'stopwatch', label: 'Stopwatch' },
];
type Mode = 'pomodoro' | 'short' | 'long' | 'stopwatch';
type Durations = { pomodoro: number; short: number; long: number };

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.tabBtn, active && styles.tabBtnActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function TimerScreen() {
  useKeepAwake();
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(DEFAULT_DURATIONS.pomodoro);
  const [cycle, setCycle] = useState(1);
  const [swSeconds, setSwSeconds] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [durations, setDurations] = useState<Durations>({ ...DEFAULT_DURATIONS });
  const [editDurations, setEditDurations] = useState<Durations>({ ...DEFAULT_DURATIONS });
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>('PORTRAIT');
  const intervalRef = useRef<number | null>(null);
  const swIntervalRef = useRef<number | null>(null);

  // Listen for orientation changes
  useEffect(() => {
    const onChange = () => {
      const win = Dimensions.get('window');
      setDimensions(win);
      setOrientation(win.width > win.height ? 'LANDSCAPE' : 'PORTRAIT');
    };
    const sub = Dimensions.addEventListener('change', onChange);
    // Set initial orientation
    onChange();
    return () => sub.remove();
  }, []);

  // Enable full screen rotation for this screen
  useEffect(() => {
    const unlock = async () => {
      await ScreenOrientation.unlockAsync();
    };
    unlock();
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, []);

  // Rotate button handler
  const handleRotate = async () => {
    if (orientation === 'PORTRAIT') {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setOrientation('LANDSCAPE');
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      setOrientation('PORTRAIT');
    }
  };

  // Play bell sound using expo-av
  async function playBell() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/bell.mp3'),
        { shouldPlay: true }
      );
      await sound.playAsync();
      setTimeout(() => {
        sound.stopAsync();
        sound.unloadAsync();
      }, 2000);
    } catch (e) {}
  }

  // Timer logic
  useEffect(() => {
    if (mode === 'stopwatch' && isRunning) {
      swIntervalRef.current = setInterval(() => {
        setSwSeconds((prev) => prev + 1);
      }, 1000);
    } else if (mode !== 'stopwatch' && isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 1) {
            setIsRunning(false);
            playBell();
            if (mode === 'pomodoro') {
              setCycle((c) => (c === 4 ? 1 : c + 1));
              setMode(cycle === 4 ? 'long' : 'short');
              setSeconds(cycle === 4 ? durations.long : durations.short);
            } else if (mode === 'short') {
              setMode('pomodoro');
              setSeconds(durations.pomodoro);
            } else if (mode === 'long') {
              setMode('pomodoro');
              setSeconds(durations.pomodoro);
            }
            return prev - 1;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
      if (swIntervalRef.current !== null) clearInterval(swIntervalRef.current);
    };
  }, [isRunning, mode, cycle, durations]);

  // Reset timer when mode changes
  useEffect(() => {
    setIsRunning(false);
    if (mode === 'pomodoro') setSeconds(durations.pomodoro);
    else if (mode === 'short') setSeconds(durations.short);
    else if (mode === 'long') setSeconds(durations.long);
    else if (mode === 'stopwatch') setSwSeconds(0);
  }, [mode, durations]);

  // Settings modal handlers
  const openSettings = () => {
    setEditDurations({ ...durations });
    setShowSettings(true);
  };
  const saveSettings = () => {
    setDurations({ ...editDurations });
    setShowSettings(false);
    if (!isRunning && mode !== 'stopwatch') {
      setSeconds(editDurations[mode as keyof Durations]);
    }
  };

  // Responsive font size
  const timerFontSize = Math.min(dimensions.width, dimensions.height) * 0.18;

  // Start/Stop handler (no pickers)
  const handleStartStop = () => {
    setIsRunning((r) => !r);
  };

  // Reset handler
  const handleReset = () => {
    if (mode === 'pomodoro') setSeconds(durations.pomodoro);
    else if (mode === 'short') setSeconds(durations.short);
    else if (mode === 'long') setSeconds(durations.long);
    else if (mode === 'stopwatch') setSwSeconds(0);
    setIsRunning(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: COLORS[mode] }]}> 
      {/* Top Tabs */}
      <View style={styles.tabsRow}>
        {MODES.map((m) => (
          <TabButton
            key={m.key}
            label={m.label}
            active={mode === m.key}
            onPress={() => !isRunning && setMode(m.key as Mode)}
          />
        ))}
        <TouchableOpacity style={styles.settingsBtn} onPress={openSettings}>
          <MaterialIcons name="settings" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Centered Timer and Button */}
      <View style={styles.centerBox}>
        <Text style={[styles.timerText, { fontSize: timerFontSize }]}> 
          {mode === 'stopwatch' ? formatTime(swSeconds) : formatTime(seconds)}
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={handleStartStop}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>{isRunning ? 'STOP' : 'START'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleReset}
            activeOpacity={0.85}
          >
            <Text style={styles.resetBtnText}>RESET</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Floating Rotate Button */}
      <TouchableOpacity style={styles.fabRotateBtn} onPress={handleRotate} activeOpacity={0.85}>
        <Ionicons name="phone-portrait" size={28} color="#fff" style={{ transform: [{ rotate: orientation === 'PORTRAIT' ? '0deg' : '90deg' }] }} />
      </TouchableOpacity>
      {/* Settings Modal */}
      <Modal visible={showSettings} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Session Durations (minutes)</Text>
            {(['pomodoro', 'short', 'long'] as (keyof Durations)[]).map((key) => (
              <View key={key} style={styles.inputRow}>
                <Text style={styles.inputLabel}>{MODES.find(m => m.key === key)?.label}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(Math.floor(editDurations[key] / 60))}
                  onChangeText={v => {
                    const val = Math.max(1, parseInt(v) || 1);
                    setEditDurations(ed => ({ ...ed, [key]: val * 60 }));
                  }}
                  maxLength={2}
                />
              </View>
            ))}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setShowSettings(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={saveSettings}>
                <Text style={styles.modalBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: SPACING,
    paddingTop: 48,
    backgroundColor: COLORS.pomodoro,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING * 2,
    minHeight: TAB_HEIGHT,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: BUTTON_RADIUS,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    maxWidth: 120,
  },
  tabBtnActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  tabLabel: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: COLORS.pomodoro,
  },
  settingsBtn: {
    marginLeft: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    padding: 4,
    alignSelf: 'center',
  },
  rotateBtn: {
    marginRight: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    padding: 4,
    alignSelf: 'center',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  timerText: {
    color: COLORS.white,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: SPACING * 2,
  },
  startBtn: {
    backgroundColor: COLORS.white,
    borderRadius: BUTTON_RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: SPACING * 2,
    alignSelf: 'center',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
  },
  startBtnText: {
    color: COLORS.pomodoro,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12, // reduced from 24
    width: 320,
    maxWidth: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16, // reduced from 20
    fontWeight: 'bold',
    marginBottom: 10, // reduced from 16
    color: COLORS.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // reduced from 12
    width: '100%',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 14, // reduced from 16
    color: COLORS.text,
    width: 100, // reduced from 120
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 6, // reduced from 8
    width: 48, // reduced from 60
    textAlign: 'center',
    fontSize: 14, // reduced from 16
    color: COLORS.text,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10, // reduced from 16
  },
  modalBtn: {
    flex: 1,
    backgroundColor: COLORS.pomodoro,
    borderRadius: 8,
    paddingVertical: 8, // reduced from 10
    marginHorizontal: 6, // reduced from 8
    alignItems: 'center',
  },
  modalBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14, // reduced from 16
  },
  fabRotateBtn: {
    position: 'absolute',
    right: 24,
    bottom: 100,
    backgroundColor: '#3A86FF',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING * 2,
  },
  resetBtn: {
    backgroundColor: '#fff',
    borderRadius: BUTTON_RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginLeft: 16,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
  },
  resetBtnText: {
    color: COLORS.pomodoro,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
}); 