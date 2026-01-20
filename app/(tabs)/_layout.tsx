import { Tabs } from 'expo-router';
import { IconButton } from 'react-native-paper';
import { ThemeToggle } from '../_layout';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerRight: () => <ThemeToggle />,
                tabBarActiveTintColor: '#2196F3',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Jobs',
                    tabBarIcon: ({ color }) => <IconButton icon="briefcase" size={28} iconColor={color} />,
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: 'Stats',
                    tabBarIcon: ({ color }) => <IconButton icon="chart-bar" size={28} iconColor={color} />,
                }}
            />
            <Tabs.Screen
                name="salary"
                options={{
                    title: 'Salary',
                    tabBarIcon: ({ color }) => <IconButton icon="currency-inr" size={28} iconColor={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <IconButton icon="account" size={28} iconColor={color} />,
                }}
            />
        </Tabs>
    );
}