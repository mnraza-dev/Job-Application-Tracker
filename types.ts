export type Interview = {
  date: string;
  time?: string; // 'HH:mm' format, optional for all-day events
  type: string;
  notes: string;
  };
  
  export type Application = {
    id: number;
    company: string;
    position: string;
    status: 'Applied' | 'Interviewing' | 'Rejected' | 'Not Selected' | 'Selected';
    notes: string;
    interviews: Interview[];
    dateApplied: string;
  };
  
  export type RootStackParamList = {
    Applications: undefined;
    Form: { application?: Application };
  };