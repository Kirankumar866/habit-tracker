import React from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const PRIMARY = '#F06292';
const CARD = '#232325';
const TEXT = '#fff';
const INACTIVE = '#888';

const styles = StyleSheet.create({
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
});

const AddTypeModal = ({ 
  visible, 
  onClose, 
  onSelectType 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onSelectType: (type: string) => void;
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.addTypeSheet}>
        <TouchableOpacity style={styles.addTypeBtn} onPress={() => onSelectType('Habit')}>
          <FontAwesome5 name="trophy" size={24} color={PRIMARY} style={{ marginRight: 16 }} />
          <View>
            <Text style={styles.addTypeTitle}>Habit</Text>
            <Text style={styles.addTypeDesc}>Activity that repeats over time. It has detailed tracking and statistics.</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addTypeBtn} onPress={() => onSelectType('Recurring Task')}>
          <MaterialIcons name="repeat" size={24} color={PRIMARY} style={{ marginRight: 16 }} />
          <View>
            <Text style={styles.addTypeTitle}>Recurring Task</Text>
            <Text style={styles.addTypeDesc}>Activity that repeats over time without tracking or statistics.</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addTypeBtn} onPress={() => onSelectType('Task')}>
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

export default AddTypeModal; 