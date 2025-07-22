import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const PRIMARY = '#F06292';
const INACTIVE = '#888';

const styles = StyleSheet.create({
  taskItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232325',
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
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskType: {
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  taskTime: {
    color: INACTIVE,
    fontSize: 14,
    marginLeft: 2,
  },
});

const TaskItem = ({ item, onLongPress }: { item: any; onLongPress: () => void }) => (
  <TouchableOpacity onLongPress={onLongPress} activeOpacity={0.85}>
    <View style={styles.taskItemRow}>
      <View style={styles.taskIconBox}><MaterialIcons name="access-time" size={28} color={PRIMARY} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.taskTitle}>{item.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <Text style={styles.taskType}>{item.type || 'Task'}</Text>
          {item.reminder && item.reminder.time && (
            <MaterialIcons name="notifications-none" size={16} color="#fff" style={{ marginRight: 8 }} />
          )}
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

export default TaskItem; 