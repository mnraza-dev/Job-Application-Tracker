import React from 'react';
import { View, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

export const ConfettiTrigger: React.FC<{ onDone: () => void }> = ({ onDone }) => (
  <View style={styles.container}>
    <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} explosionSpeed={400} fallSpeed={3000} fadeOut onAnimationEnd={onDone} />
  </View>
);

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' },
});