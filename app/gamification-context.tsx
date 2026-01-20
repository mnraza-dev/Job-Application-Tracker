import { ConfettiTrigger } from '@/components/ConfettiTrigger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Application, GamificationContextType } from '../types';

const GAMIFICATION_KEY = '@gamification';
const GamificationContext = createContext<GamificationContextType>({
  streak: 0,
  points: 0,
  badges: [],
  triggerConfetti: () => {},
  updateFromApplications: async () => {},
});

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const triggerConfetti = () => setShowConfetti(true);

  const loadGamification = async () => {
    const data = await AsyncStorage.getItem(GAMIFICATION_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      setStreak(parsed.streak || 0);
      setPoints(parsed.points || 0);
      setBadges(parsed.badges || []);
    }
  };

  const saveGamification = async () => {
    await AsyncStorage.setItem(GAMIFICATION_KEY, JSON.stringify({ streak, points, badges }));
  };

  const updateFromApplications = async (apps: Application[]) => {
    let newPoints = 0;
    let newBadges = [...badges];
    const today = new Date().toISOString().split('T')[0];

    // Points
    apps.forEach(app => {
      newPoints += 10;
      if (app.status === 'Interviewing') newPoints += 40;
      if (app.status === 'Selected') newPoints += 90;
    });

    // Streak
    const dates = apps.map(a => a.dateApplied.split('T')[0]).sort().reverse();
    let currentStreak = 0;
    let checkDate = today;
    for (const date of dates) {
      if (date === checkDate) {
        currentStreak++;
        checkDate = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split('T')[0];
      } else if (date < checkDate) break;
    }

    // Badges
    const totalApps = apps.length;
    if (totalApps >= 1 && !badges.includes('first_app')) newBadges.push('first_app');
    if (totalApps >= 10 && !badges.includes('10_apps')) newBadges.push('10_apps');
    if (currentStreak >= 7 && !badges.includes('week_streak')) newBadges.push('week_streak');
    if (apps.some(a => a.status === 'Selected') && !badges.includes('first_offer')) newBadges.push('first_offer');

    const badgeUnlocked = newBadges.length > badges.length;

    setPoints(newPoints);
    setStreak(currentStreak);
    setBadges(newBadges);
    await saveGamification();

    if (badgeUnlocked || totalApps % 10 === 0) triggerConfetti();
  };

  useEffect(() => {
    loadGamification();
  }, []);

  return (
    <GamificationContext.Provider value={{ streak, points, badges, triggerConfetti, updateFromApplications }}>
      {children}
      {showConfetti && <ConfettiTrigger onDone={() => setShowConfetti(false)} />}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => useContext(GamificationContext);