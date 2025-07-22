import React from 'react';
import { View, Text, TouchableOpacity, Modal as RNModal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const PRIMARY = '#F06292';
const CARD = '#232325';
const TEXT = '#fff';
const INACTIVE = '#888';

interface TaskDetailsModalProps {
  visible: boolean;
  selectedTask: any;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReschedule: () => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ visible, selectedTask, onClose, onEdit, onDelete, onReschedule }) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
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
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }} onPress={onReschedule}>
                <MaterialIcons name="schedule" size={22} color={PRIMARY} style={{ marginRight: 12 }} />
                <Text style={{ color: PRIMARY, fontWeight: 'bold', fontSize: 16 }}>Reschedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }} onPress={onDelete}>
                <MaterialIcons name="delete" size={22} color={INACTIVE} style={{ marginRight: 12 }} />
                <Text style={{ color: INACTIVE, fontWeight: 'bold', fontSize: 16 }}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }} onPress={onEdit}>
                <MaterialIcons name="edit" size={22} color={TEXT} style={{ marginRight: 12 }} />
                <Text style={{ color: TEXT, fontWeight: 'bold', fontSize: 16 }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, alignSelf: 'center' }} onPress={onClose}>
                <MaterialIcons name="close" size={22} color={PRIMARY} style={{ marginRight: 12 }} />
                <Text style={{ color: PRIMARY, fontWeight: 'bold', fontSize: 16 }}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </RNModal>
  );
};

export default TaskDetailsModal; 