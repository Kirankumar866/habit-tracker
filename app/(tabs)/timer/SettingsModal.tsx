import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

const COLORS = {
  pomodoro: '#C94F4F',
  white: '#fff',
  text: '#232325',
};

type Durations = { pomodoro: number; short: number; long: number };

interface SettingsModalProps {
  visible: boolean;
  editDurations: Durations;
  setEditDurations: (durations: Durations) => void;
  onClose: () => void;
  onSave: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  editDurations,
  setEditDurations,
  onClose,
  onSave,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Session Durations (minutes)</Text>
          {(['pomodoro', 'short', 'long'] as (keyof Durations)[]).map((key) => (
            <View key={key} style={styles.inputRow}>
              <Text style={styles.inputLabel}>
                {key === 'pomodoro' ? 'Pomodoro' : key === 'short' ? 'Short Break' : 'Long Break'}
              </Text>
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
            <TouchableOpacity style={styles.modalBtn} onPress={onClose}>
              <Text style={styles.modalBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn} onPress={onSave}>
              <Text style={styles.modalBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    width: 320,
    maxWidth: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    width: '100%',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.text,
    width: 100,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 6,
    width: 48,
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.text,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    backgroundColor: COLORS.pomodoro,
    borderRadius: 8,
    paddingVertical: 8,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  modalBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default SettingsModal; 