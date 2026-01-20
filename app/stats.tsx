import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Application } from '../types';
import { ThemeContext } from './_layout';

const STORAGE_KEY = '@job_applications';

export default function StatsScreen() {
  const { isDark } = useContext(ThemeContext);
  const [applications, setApplications] = useState<Application[]>([]);

  const backgroundColor = isDark ? '#000000' : '#ffffff';
  const surfaceColor = isDark ? '#1c1c1c' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const subtitleColor = isDark ? '#bbbbbb' : '#666666';
  const primaryColor = '#2196F3';

  useEffect(() => {
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue) {
          const apps: Application[] = JSON.parse(jsonValue);
          setApplications(apps);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  // Calculations
  const total = applications.length;
  const selected = applications.filter(a => a.status === 'Selected').length;
  const successRate = total > 0 ? Math.round((selected / total) * 100) : 0;

  const statusCounts = {
    Applied: applications.filter(a => a.status === 'Applied').length,
    Interviewing: applications.filter(a => a.status === 'Interviewing').length,
    Rejected: applications.filter(a => a.status === 'Rejected').length,
    'Not Selected': applications.filter(a => a.status === 'Not Selected').length,
    Selected: selected,
  };

  // Applications per month
  const monthlyData: { [key: string]: number } = {};
  applications.forEach(app => {
    const date = new Date(app.dateApplied);
    const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
  });

  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    const dateA = new Date(a + ' 1');
    const dateB = new Date(b + ' 1');
    return dateA.getTime() - dateB.getTime();
  });

  const maxMonthly = Math.max(...Object.values(monthlyData), 1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selected': return '#4caf50';
      case 'Interviewing': return '#2196f3';
      case 'Rejected': return '#f44336';
      case 'Not Selected': return '#ff9800';
      default: return '#999999';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} contentContainerStyle={{ padding: 16 }}>
      <Text style={[styles.title, { color: textColor }]}>Application Statistics</Text>

      {/* Success Rate Card */}
      <View style={[styles.card, { backgroundColor: surfaceColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Overall Success Rate</Text>
        <View style={styles.successRow}>
          <Text style={styles.successNumber}>{successRate}%</Text>
          <Text style={[styles.successDetail, { color: subtitleColor }]}>
            {selected} Selected out of {total} applications
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${successRate}%`, backgroundColor: '#4caf50' }]} />
        </View>
      </View>

      {/* Status Breakdown */}
      <Text style={[styles.sectionTitle, { color: textColor }]}>Applications by Status</Text>
      {Object.entries(statusCounts).map(([status, count]) => (
        <View key={status} style={[styles.statusCard, { backgroundColor: surfaceColor }]}>
          <Text style={[styles.statusLabel, { color: textColor }]}>{status}</Text>
          <Text style={[styles.statusCount, { color: getStatusColor(status) }]}>{count}</Text>
        </View>
      ))}

      {/* Applications per Month */}
      <Text style={[styles.sectionTitle, { color: textColor }]}>Applications per Month</Text>
      {sortedMonths.length === 0 ? (
        <Text style={[styles.emptyText, { color: subtitleColor }]}>No data yet – start tracking applications!</Text>
      ) : (
        <View style={styles.chartContainer}>
          {sortedMonths.map(month => (
            <View key={month} style={styles.barRow}>
              <Text style={[styles.barLabel, { color: subtitleColor }]}>{month}</Text>
              <View style={styles.barBackground}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${(monthlyData[month] / maxMonthly) * 100}%`,
                      backgroundColor: primaryColor,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barValue, { color: textColor }]}>{monthlyData[month]}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  successRow: { alignItems: 'center', marginBottom: 16 },
  successNumber: { fontSize: 48, fontWeight: 'bold', color: '#4caf50' },
  successDetail: { fontSize: 16, marginTop: 8 },
  progressBar: { height: 20, backgroundColor: '#e0e0e0', borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 10 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, marginTop: 24 },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  statusLabel: { fontSize: 18 },
  statusCount: { fontSize: 24, fontWeight: 'bold' },
  chartContainer: { marginTop: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  barLabel: { width: 100, fontSize: 16 },
  barBackground: { flex: 1, height: 30, backgroundColor: '#e0e0e0', borderRadius: 15, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 15 },
  barValue: { width: 40, textAlign: 'right', fontSize: 18, fontWeight: '600' },
  emptyText: { fontSize: 18, textAlign: 'center', marginTop: 40 },
});