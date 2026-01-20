import { ProgressProps, StatProps } from '@/types';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

const mockUser = {
  name: "Noorullah",
  totalApplications: 42,
  totalInterviews: 18,
  offers: 3,
  rejections: 15,
  streakDays: 4,
  successRate: 17,
  achievements: ['first_interview', '10_interviews', '7day_streak']
};

const badges = [
  { id: 'first_interview', title: 'First Interview', emoji: '✅' },
  { id: '10_interviews',   title: '10 Interviews',  emoji: '🔥' },
  { id: 'first_offer',      title: 'First Offer',   emoji: '🎉' },
  { id: '10_rejections',    title: 'Rejection Proof', emoji: '🛡️' },
  { id: '7day_streak',      title: '7-Day Streak',  emoji: '📅' },
];

const ProfileScreen =()=> {
  const { name, totalApplications, totalInterviews, offers, rejections, streakDays, successRate, achievements } = mockUser;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{name}'s Journey</Text>
        <Text style={styles.subtitle}>
          Interviews: {totalInterviews} • Success: {successRate}%
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Stat label="Applications" value={totalApplications} />
        <Stat label="Interviews"   value={totalInterviews} />
        <Stat label="Offers"       value={offers} color="#4CAF50" />
        <Stat label="Rejections"   value={rejections} color="#F44336" />
      </View>

      <View style={styles.streak}>
        <Text style={styles.streakText}>Current Streak: {streakDays} days 🔥</Text>
      </View>

      {/* Achievements */}
      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.badgeGrid}>
        {badges.map(badge => {
          const unlocked = achievements.includes(badge.id);
          return (
            <View key={badge.id} style={[styles.badge, unlocked ? styles.badgeUnlocked : styles.badgeLocked]}>
              <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
              <Text style={[styles.badgeText, !unlocked && { color: '#888' }]}>
                {badge.title}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.sectionTitle}>Next Milestones</Text>
      <Progress label="20 Interviews" progress={totalInterviews / 20} />
      <Progress label="5 Offers"     progress={offers / 5} />
    </ScrollView>
  );
}
export default ProfileScreen

function Stat({ label, value, color = '#333' }:StatProps) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Progress({ label, progress }: ProgressProps) {
  const percent = Math.min(Math.max(progress, 0), 1);
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressLabel}>{label}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percent * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>{Math.round(percent * 100)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa', padding: 16 },
  header: { alignItems: 'center', marginVertical: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 6 },

  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: { width: (width - 50) / 2, backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  statValue: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 13, color: '#666', marginTop: 4 },

  streak: { alignItems: 'center', marginVertical: 16 },
  streakText: { fontSize: 18, fontWeight: '600', color: '#FF5722' },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 16, color: '#111' },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  badge: { width: (width - 60) / 3, aspectRatio: 1, backgroundColor: '#eee', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12, padding: 8 },
  badgeUnlocked: { backgroundColor: '#FFF9C4', borderWidth: 2, borderColor: '#FBC02D' },
  badgeLocked: { opacity: 0.5 },
  badgeEmoji: { fontSize: 32 },
  badgeText: { fontSize: 12, textAlign: 'center', marginTop: 6, fontWeight: '500' },

  progressContainer: { marginBottom: 16 },
  progressLabel: { fontSize: 16, fontWeight: '500', marginBottom: 6 },
  progressBar: { height: 12, backgroundColor: '#e0e0e0', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2196F3' },
  progressText: { fontSize: 13, color: '#555', textAlign: 'right', marginTop: 4 },
});