import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import TabButton from './timer/TabButton';
import TimerDisplay from './timer/TimerDisplay';
import SettingsModal from './timer/SettingsModal';
import { COLORS, DEFAULT_DURATIONS, MODES } from './timer/TimerUtils.js';

type Mode = 'pomodoro' | 'short' | 'long' | 'stopwatch';
type Durations = { pomodoro: number; short: number; long: number };

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
      
      <TimerDisplay
        mode={mode}
        seconds={seconds}
        swSeconds={swSeconds}
        isRunning={isRunning}
        orientation={orientation}
        timerFontSize={timerFontSize}
        onStartStop={handleStartStop}
        onReset={handleReset}
        onRotate={handleRotate}
      />

      <SettingsModal
        visible={showSettings}
        editDurations={editDurations}
        setEditDurations={setEditDurations}
        onClose={() => setShowSettings(false)}
        onSave={saveSettings}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
    backgroundColor: COLORS.pomodoro,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    minHeight: 48,
  },
  settingsBtn: {
    marginLeft: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    padding: 4,
    alignSelf: 'center',
  },
}); 