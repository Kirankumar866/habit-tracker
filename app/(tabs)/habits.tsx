import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HabitsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Habits Screen (Coming Soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151718',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 20,
  },
}); 