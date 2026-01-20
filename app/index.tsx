import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  Card,
  Chip,
  Divider,
  FAB,
  IconButton,
  Menu,
  Paragraph,
  Searchbar,
  Text,
  Title,
  useTheme,
} from 'react-native-paper';

import { Application } from '../types';

const STORAGE_KEY = '@job_applications';

const STATUS_OPTIONS = ['All', 'Applied', 'Interviewing', 'Rejected', 'Not Selected', 'Selected'];

export default function ListScreen() {
  const theme = useTheme();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  const loadData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue) {
        const apps: Application[] = JSON.parse(jsonValue);
        apps.sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime());
        setApplications(apps);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  useEffect(() => {
    let filtered = applications;

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        app =>
          app.company.toLowerCase().includes(lowerQuery) ||
          app.position.toLowerCase().includes(lowerQuery) ||
          (app.notes?.toLowerCase().includes(lowerQuery))
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApps(filtered);
  }, [applications, searchQuery, statusFilter]);

  const deleteApplication = async (id: number) => {
    const newApps = applications.filter(app => app.id !== id);
    setApplications(newApps);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newApps));
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'Selected': return '#4CAF50';
      case 'Interviewing': return '#2196F3';
      case 'Rejected': return '#F44336';
      case 'Not Selected': return '#FF9800';
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const renderItem = ({ item }: { item: Application }) => (
    <Card style={styles.card} onPress={() => router.push({ pathname: '/form', params: { appJson: JSON.stringify(item) } })}>
      <Card.Content>
        <Title>{item.company} — {item.position}</Title>
        <Paragraph>Applied: {new Date(item.dateApplied).toLocaleDateString()}</Paragraph>
        <View style={styles.chipRow}>
          <Chip icon="briefcase" selectedColor={getStatusColor(item.status)}>
            {item.status}
          </Chip>
          <Chip icon="calendar-multiple-check">{item.interviews.length} Interviews</Chip>
        </View>
      </Card.Content>
      <Card.Actions>
        <IconButton icon="delete" iconColor="#F44336" onPress={() => deleteApplication(item.id)} />
        <IconButton icon="chart-line" onPress={() => router.push('/stats')} />
      </Card.Actions>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search company, position, notes..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.filterRow}>
        <Text variant="titleMedium">Filter by status:</Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="filter-variant"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          {STATUS_OPTIONS.map(s => (
            <Menu.Item
              key={s}
              onPress={() => {
                setStatusFilter(s);
                setMenuVisible(false);
              }}
              title={s}
              leadingIcon={statusFilter === s ? 'check' : undefined}
            />
          ))}
        </Menu>
        {statusFilter !== 'All' && (
          <Chip onClose={() => setStatusFilter('All')} style={styles.activeFilterChip}>
            {statusFilter}
          </Chip>
        )}
      </View>

      <Divider style={styles.divider} />

      <FlatList
        data={filteredApps}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text variant="bodyLarge" style={styles.emptyText}>
            {searchQuery || statusFilter !== 'All' ? 'No matching applications' : 'No applications yet. Add one!'}
          </Text>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/form')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchbar: { margin: 16, marginBottom: 8 },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
  activeFilterChip: { marginLeft: 'auto' },
  divider: { marginVertical: 8 },
  listContent: { padding: 16, paddingTop: 0 },
  card: { marginBottom: 16 },
  chipRow: { flexDirection: 'row', marginTop: 12, gap: 12 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  emptyText: { textAlign: 'center', marginTop: 60 },
});