import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
    BarChart,
    PieChart,
} from 'react-native-chart-kit';
import { ThemeContext } from './_layout';

import { Application } from '../types';

const STORAGE_KEY = '@job_applications';
const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const { isDark } = useContext(ThemeContext);
  const [applications, setApplications] = useState<Application[]>([]);

  const backgroundColor = isDark ? '#000000' : '#ffffff';
  const surfaceColor = isDark ? '#1c1c1c' : '#f8f9fa';
  const textColor = isDark ? '#ffffff' : '#000000';
  const subtitleColor = isDark ? '#bbbbbb' : '#666666';
  const primaryColor = '#2196F3';
  const gridColor = isDark ? '#333333' : '#e0e0e0';

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

  const pending = statusCounts.Applied;
  const responseRate = total > 0 ? Math.round(((total - pending) / total) * 100) : 0;

  // Average response time (days from apply to today, only for responded apps)
  const respondedApps = applications.filter(a => a.status !== 'Applied');
  let avgResponseDays = 'N/A';
  if (respondedApps.length > 0) {
    const totalDays = respondedApps.reduce((sum, app) => {
      if (app.dateApplied) {
        const days = (Date.now() - new Date(app.dateApplied).getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }
      return sum;
    }, 0);
    avgResponseDays = `${Math.round(totalDays / respondedApps.length)} days`;
  }

  // This month
  const now = new Date();
  const currentMonthKey = `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;
  const monthlyData: { [key: string]: number } = {};
  applications.forEach(app => {
    if (app.dateApplied) {
      const date = new Date(app.dateApplied);
      const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    }
  });
  const thisMonthCount = monthlyData[currentMonthKey] || 0;

  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    const dateA = new Date(a + ' 1');
    const dateB = new Date(b + ' 1');
    return dateA.getTime() - dateB.getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selected': return '#4caf50';
      case 'Interviewing': return '#2196f3';
      case 'Applied': return primaryColor;
      case 'Rejected': return '#f44336';
      case 'Not Selected': return '#ff9800';
      default: return '#999999';
    }
  };

  const statusOrder = ['Applied', 'Interviewing', 'Selected', 'Not Selected', 'Rejected'];

  // Pie chart data
  const pieData = statusOrder
    .map(status => ({
      name: status,
      count: statusCounts[status as keyof typeof statusCounts],
      color: getStatusColor(status),
      legendFontColor: textColor,
      legendFontSize: 14,
    }))
    .filter(item => item.count > 0);

  // Bar chart data
  const barData = {
    labels: sortedMonths,
    datasets: [{
      data: sortedMonths.map(month => monthlyData[month]),
    }],
  };

  const chartConfig = {
    backgroundGradientFrom: surfaceColor,
    backgroundGradientTo: surfaceColor,
    color: (opacity = 1) => primaryColor + Math.round(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: () => textColor,
    strokeWidth: 2,
    barPercentage: 0.6,
    propsForLabels: { fontSize: 12 },
    propsForBackgroundLines: { stroke: gridColor },
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} contentContainerStyle={{ padding: 16 }}>
      <Text style={[styles.title, { color: textColor }]}>Application Statistics</Text>

      {total === 0 ? (
        <Text style={[styles.emptyText, { color: subtitleColor }]}>
          No applications yet – start tracking to see your stats!
        </Text>
      ) : (
        <>
          {/* Hero Success Rate */}
          <View style={[styles.heroCard, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Overall Success Rate</Text>
            <Text style={styles.successNumber}>{successRate}%</Text>
            <Text style={[styles.successDetail, { color: subtitleColor }]}>
              {selected} Selected out of {total} applications
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${successRate}%`, backgroundColor: '#4caf50' }]} />
            </View>
          </View>

          {/* Metric Cards - now wraps to 2 rows on mobile */}
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, { backgroundColor: surfaceColor }]}>
              <Text style={[styles.metricLabel, { color: subtitleColor }]}>Total</Text>
              <Text style={[styles.metricValue, { color: textColor }]}>{total}</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: surfaceColor }]}>
              <Text style={[styles.metricLabel, { color: subtitleColor }]}>Response Rate</Text>
              <Text style={[styles.metricValue, { color: primaryColor }]}>{responseRate}%</Text>
              <View style={styles.smallProgressBar}>
                <View style={[styles.progressFill, { width: `${responseRate}%`, backgroundColor: primaryColor }]} />
              </View>
            </View>
            <View style={[styles.metricCard, { backgroundColor: surfaceColor }]}>
              <Text style={[styles.metricLabel, { color: subtitleColor }]}>This Month</Text>
              <Text style={[styles.metricValue, { color: textColor }]}>{thisMonthCount}</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: surfaceColor }]}>
              <Text style={[styles.metricLabel, { color: subtitleColor }]}>Avg. Response Time</Text>
              <Text style={[styles.metricValue, { color: textColor }]}>{avgResponseDays}</Text>
              <Text style={[styles.metricSub, { color: subtitleColor }]}>{respondedApps.length} responses</Text>
            </View>
          </View>

          {/* Status Distribution Donut Pie */}
          <View style={[styles.chartCard, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Status Distribution</Text>
            <View style={styles.donutContainer}>
              <PieChart
                data={pieData}
                width={screenWidth - 64}
                height={320}
                chartConfig={chartConfig}
                accessor={"count"}
                backgroundColor={"transparent"}
                paddingLeft={"20"}
                absolute={false} // shows % on slices
                hasLegend={false}
              />
              {/* Donut hole + center text */}
              <View style={[styles.donutHole, { backgroundColor: surfaceColor }]} />
              <View style={styles.donutCenter}>
                <Text style={[styles.donutCenterText, { color: textColor }]}>{total}</Text>
                <Text style={[styles.donutCenterSub, { color: subtitleColor }]}>Applications</Text>
              </View>
            </View>
            <View style={styles.legendContainer}>
              {pieData.map((item) => (
                <View key={item.name} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={[styles.legendText, { color: textColor }]}>
                    {item.name} ({item.count})
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Applications per Month Bar */}
          <View style={[styles.chartCard, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Applications per Month</Text>
            {sortedMonths.length === 0 ? (
              <Text style={[styles.emptyText, { color: subtitleColor }]}>No monthly data yet</Text>
            ) : (
              <BarChart
                data={barData}
                width={screenWidth - 64}
                height={320}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={chartConfig}
                verticalLabelRotation={30}
                fromZero
                showValuesOnTopOfBars
              />
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  emptyText: { fontSize: 18, textAlign: 'center', marginTop: 60 },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    alignItems: 'center',
  },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  successNumber: { fontSize: 56, fontWeight: 'bold', color: '#4caf50' },
  successDetail: { fontSize: 16, marginVertical: 12 },
  progressBar: { height: 20, width: '100%', backgroundColor: '#e0e0e0', borderRadius: 10, overflow: 'hidden', marginTop: 8 },
  progressFill: { height: '100%', borderRadius: 10 },
  smallProgressBar: { height: 8, width: '100%', backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 24 },
  metricCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  metricLabel: { fontSize: 14 },
  metricValue: { fontSize: 32, fontWeight: 'bold', marginTop: 8 },
  metricSub: { fontSize: 12, marginTop: 4 },
  chartCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  donutContainer: { position: 'relative', width: screenWidth - 64, height: 320, justifyContent: 'center', alignItems: 'center' },
  donutHole: { position: 'absolute', width: 120, height: 120, borderRadius: 80 },
  donutCenter: { position: 'absolute', alignItems: 'center' },
  donutCenterText: { fontSize: 40, fontWeight: 'bold' },
  donutCenterSub: { fontSize: 16 },
  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 24, gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendColor: { width: 16, height: 16, borderRadius: 8 },
  legendText: { fontSize: 14 },
});