import React from 'react';
import { FlatList, Text } from 'react-native';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: any[];
  onLongPress: (task: any) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onLongPress }) => {
  return (
    <FlatList
      data={tasks}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TaskItem item={item} onLongPress={() => onLongPress(item)} />
      )}
      ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>No tasks yet.</Text>}
      contentContainerStyle={{ flexGrow: 1 }}
    />
  );
};

export default TaskList; 