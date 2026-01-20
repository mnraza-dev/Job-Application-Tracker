import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { ThemeContext } from '../_layout';
import { Application } from '../../types';

const STORAGE_KEY = '@job_applications';
const screenWidth = Dimensions.get('window').width;

const SalaryScreen =()=> {
  const { isDark } = useContext(ThemeContext);
  const [applications, setApplications] = useState<Application[]>([]);

  const backgroundColor = isDark ? '#000000' : '#ffffff';
  const surfaceColor = isDark ? '#1c1c1c' : '#f8f9fa';
  const textColor = isDark ? '#ffffff' : '#000000';
  const subtitleColor = isDark ? '#bbbbbb' : '#666666';
  const primaryColor = '#2196F3';
  const positiveColor = '#4caf50';
  const negativeColor = '#f44336';
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

  // Filter apps with salary data
  const salaryApps = applications.filter(
    app => (app.expectedSalary || app.offeredSalary) && app.currency
  );

  const appsWithExpected = salaryApps.filter(app => app.expectedSalary);
  const appsWithOffered = salaryApps.filter(app => app.offeredSalary);

  // Group by currency to handle multiple (e.g., INR, USD)
  const currencies = [...new Set(salaryApps.map(app => app.currency || 'INR'))];

  // Calculations per currency
  const salaryData: Array<{
    currency: string;
    avgExpected: number;
    avgOffered: number;
    improvementPct: number;
    totalOffers: number;
    highestOffer: number;
  }> = currencies.map(currency => {
    const filtered = salaryApps.filter(app => app.currency === currency);
    const expected = filtered.filter(app => app.expectedSalary);
    const offered = filtered.filter(app => app.offeredSalary);

    const avgExpected =
      expected.reduce((sum, app) => sum + (app.expectedSalary || 0), 0) /
        expected.length || 0;
    const avgOffered =
      offered.reduce((sum, app) => sum + (app.offeredSalary || 0), 0) /
        offered.length || 0;

    const improvementPct =
      avgExpected > 0 ? ((avgOffered - avgExpected) / avgExpected) * 100 : 0;

    const highestOffer = Math.max(...offered.map(app => app.offeredSalary || 0), 0);

    return {
      currency,
      avgExpected: Math.round(avgExpected),
      avgOffered: Math.round(avgOffered),
      improvementPct: Math.round(improvementPct),
      totalOffers: offered.length,
      highestOffer,
    };
  });

  // Prepare data for bar chart (offered salaries by company/role – top 10)
  const offeredApps = applications
    .filter(app => app.offeredSalary && app.company)
    .sort((a, b) => (b.offeredSalary || 0) - (a.offeredSalary || 0))
    .slice(0, 10);

  const barData = {
    labels: offeredApps.map(app => app.company?.slice(0, 12) || 'Unknown'),
    datasets: [{ data: offeredApps.map(app => app.offeredSalary || 0) }],
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

  const formatNumber = (num: number) => num.toLocaleString('en-IN');

  const negotiationTips = [
    'Highlight your unique skills and achievements',
    'Research market rates for your role/location',
    'Ask for sign-on bonus or equity if base is fixed',
    'Consider total compensation (benefits, PTO, remote)',
    'Practice your negotiation script confidently',
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} contentContainerStyle={{ padding: 16 }}>
      <Text style={[styles.title, { color: textColor }]}>Salary & Offer Tracker</Text>

      {salaryApps.length === 0 ? (
        <Text style={[styles.emptyText, { color: subtitleColor }]}>
          No salary data yet – add expected/offered salaries in your job entries!
        </Text>
      ) : (
        <>
          {/* Summary Cards per Currency */}
          {salaryData.map(data => (
            <View key={data.currency} style={[styles.summaryCard, { backgroundColor: surfaceColor }]}>
              <Text style={[styles.currencyTitle, { color: textColor }]}>
                Insights ({data.currency})
              </Text>
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: subtitleColor }]}>Avg Expected</Text>
                  <Text style={[styles.metricValue, { color: textColor }]}>
                    {data.currency === 'INR' ? '₹' : '$'}{formatNumber(data.avgExpected)}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: subtitleColor }]}>Avg Offered</Text>
                  <Text style={[styles.metricValue, { color: textColor }]}>
                    {data.currency === 'INR' ? '₹' : '$'}{formatNumber(data.avgOffered)}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: subtitleColor }]}>Improvement</Text>
                  <Text
                    style={[
                      styles.metricValue,
                      { color: data.improvementPct >= 0 ? positiveColor : negativeColor },
                    ]}
                  >
                    {data.improvementPct >= 0 ? '+' : ''}{data.improvementPct}%
                  </Text>
                </View>
              </View>
              <View style={styles.extraMetrics}>
                <Text style={[styles.extraText, { color: subtitleColor }]}>
                  Offers Received: {data.totalOffers} | Highest: {data.currency === 'INR' ? '₹' : '$'}{formatNumber(data.highestOffer)}
                </Text>
              </View>
            </View>
          ))}

          {/* Offered Salaries Bar Chart */}
          {offeredApps.length > 0 && (
            <View style={[styles.chartCard, { backgroundColor: surfaceColor }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Top Offers by Company</Text>
              <BarChart
                data={barData}
                width={screenWidth - 64}
                height={320}
                yAxisLabel={offeredApps[0]?.currency === 'INR' ? '₹' : '$'}
                yAxisSuffix=""
                chartConfig={chartConfig}
                verticalLabelRotation={30}
                fromZero
                showValuesOnTopOfBars
              />
            </View>
          )}

          {/* Negotiation Tips */}
          <View style={[styles.tipsCard, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Negotiation Tips</Text>
            {negotiationTips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={[styles.tipBullet, { color: primaryColor }]}>•</Text>
                <Text style={[styles.tipText, { color: textColor }]}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* List of Individual Offers */}
          <Text style={[styles.sectionTitle, { color: textColor }]}>Your Offers</Text>
          {appsWithOffered.map(app => {
            const diffPct = app.expectedSalary
              ? Math.round(((app.offeredSalary! - app.expectedSalary) / app.expectedSalary) * 100)
              : 0;
            return (
              <View key={app.id} style={[styles.offerCard, { backgroundColor: surfaceColor }]}>
                <Text style={[styles.companyText, { color: textColor }]}>{app.company} - {app.position}</Text>
                <Text style={[styles.salaryText, { color: subtitleColor }]}>
                  Expected: {app.currency === 'INR' ? '₹' : '$'}{formatNumber(app.expectedSalary || 0)} → 
                  Offered: {app.currency === 'INR' ? '₹' : '$'}{formatNumber(app.offeredSalary || 0)}
                  {' '}({diffPct >= 0 ? '+' : ''}{diffPct}%)
                </Text>
                {app.benefitsNotes && (
                  <Text style={[styles.benefitsText, { color: subtitleColor }]}>Notes: {app.benefitsNotes}</Text>
                )}
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

export default SalaryScreen

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  emptyText: { fontSize: 18, textAlign: 'center', marginTop: 60 },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  currencyTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  metricItem: { alignItems: 'center' },
  metricLabel: { fontSize: 14 },
  metricValue: { fontSize: 28, fontWeight: 'bold', marginTop: 8 },
  extraMetrics: { marginTop: 12, alignItems: 'center' },
  extraText: { fontSize: 16 },
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
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  tipsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  tipItem: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  tipBullet: { fontSize: 20, marginRight: 12 },
  tipText: { fontSize: 16, flex: 1 },
  offerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  companyText: { fontSize: 18, fontWeight: 'bold' },
  salaryText: { fontSize: 16, marginTop: 8 },
  benefitsText: { fontSize: 14, marginTop: 8, fontStyle: 'italic' },
});