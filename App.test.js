import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  console.log('App component rendering!');
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello BusFlow!</Text>
      <Text style={styles.subtext}>If you see this, React Native Web is working!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
});
