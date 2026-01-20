export type Interview = {
  date: string;
  time?: string;
  type: string;
  notes: string;
};
export interface Contact {
  id: string;
  name: string;
  role: string;
  company?: string;
  email?: string;
  linkedin?: string;
  notes: string[];
  interactions: { date: string; note: string }[];
  nextFollowUp?: string; 
  linkedJobs: string[];
}
export type Application = {
  id: number;
  company: string;
  position: string;
  status: 'Applied' | 'Interviewing' | 'Rejected' | 'Not Selected' | 'Selected';
  notes: string;
  interviews: Interview[];
  dateApplied: string;
  expectedSalary?: number;
  offeredSalary?: number;
  currency?: string;
  benefitsNotes?: string;
  jdLink?: string;
};

export interface GamificationData {
  streak: number;
  lastActiveDate: string; 
  totalPoints: number;
  badges: string[]; 
}

export type RootStackParamList = {
  Applications: undefined;
  Form: { application?: Application };
};

export interface User {
  name: string;
  totalApplications: number;
  totalInterviews: number;
  offers: number;
  rejections: number;
  streakDays: number;
  successRate: number;
  achievements: string[];
}

 export interface Badge {
  id: string;
  title: string;
  emoji: string;
}

export interface StatProps {
  label: string;
  value: number;
  color?: string;
}

export interface ProgressProps {
  label: string;
  progress: number;
}

export interface GamificationContextType {
  streak: number;
  points: number;
  badges: string[];
  triggerConfetti: () => void;
  updateFromApplications: (apps: Application[]) => Promise<void>;
}