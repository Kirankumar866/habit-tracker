import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SPACING = 16;
const BUTTON_RADIUS = 16;

interface TimerDisplayProps {
  mode: string;
  seconds: number;
  swSeconds: number;
  isRunning: boolean;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  timerFontSize: number;
  onStartStop: () => void;
  onReset: () => void;
  onRotate: () => void;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  mode,
  seconds,
  swSeconds,
  isRunning,
  orientation,
  timerFontSize,
  onStartStop,
  onReset,
  onRotate,
}) => {
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <>
      {/* Centered Timer and Button */}
      <View style={styles.centerBox}>
        <Text style={[styles.timerText, { fontSize: timerFontSize }]}> 
          {mode === 'stopwatch' ? formatTime(swSeconds) : formatTime(seconds)}
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={onStartStop}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>{isRunning ? 'STOP' : 'START'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={onReset}
            activeOpacity={0.85}
          >
            <Text style={styles.resetBtnText}>RESET</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Floating Rotate Button */}
      <TouchableOpacity style={styles.fabRotateBtn} onPress={onRotate} activeOpacity={0.85}>
        <Ionicons 
          name="phone-portrait" 
          size={28} 
          color="#fff" 
          style={{ transform: [{ rotate: orientation === 'PORTRAIT' ? '0deg' : '90deg' }] }} 
        />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  timerText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: SPACING * 2,
  },
  startBtn: {
    backgroundColor: '#fff',
    borderRadius: BUTTON_RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: SPACING * 2,
    alignSelf: 'center',
    elevation: 2,
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
  },
  startBtnText: {
    color: '#C94F4F',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
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
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
  },
  resetBtnText: {
    color: '#C94F4F',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
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
});

export default TimerDisplay; 