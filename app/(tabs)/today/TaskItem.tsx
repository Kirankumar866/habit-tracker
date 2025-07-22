import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface TaskItemProps {
  item: {
    id: string;
    name: string;
    type: string;
    reminder?: { time: string };
    completed?: boolean;
    failed?: boolean;
  };
  onToggle: (id: string, type: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ item, onToggle }) => {
  return (
    <View style={styles.taskItem}>
      <View style={styles.taskIconBox}>
        <MaterialIcons 
          name={item.type === 'Habit' ? 'block' : 'access-time'} 
          size={28} 
          color="#F06292" 
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.taskTitle}>{item.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <Text style={[
            styles.taskType, 
            item.type === 'Habit' ? styles.habitType : styles.taskType
          ]}>
            {item.type}
          </Text>
          {item.reminder && item.reminder.time && (
            <MaterialIcons name="notifications-none" size={16} color="#fff" style={{ marginLeft: 8 }} />
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
      {item.completed ? (
        <TouchableOpacity onPress={() => onToggle(item.id, 'complete')}>
          <MaterialIcons name="check-circle" size={32} color="#43A047" />
        </TouchableOpacity>
      ) : item.failed ? (
        <TouchableOpacity onPress={() => onToggle(item.id, 'fail')}>
          <MaterialIcons name="cancel" size={32} color="#E53935" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => onToggle(item.id, 'complete')}>
          <MaterialIcons name="access-time" size={32} color="#757575" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232325',
    borderRadius: 16,
    marginHorizontal: 8,
    marginVertical: 6,
    padding: 16,
  },
  taskIconBox: {
    backgroundColor: '#232325',
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
    color: '#F06292',
    fontSize: 14,
    marginRight: 8,
  },
  habitType: {
    color: '#E57373',
  },
  taskTime: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default TaskItem; 