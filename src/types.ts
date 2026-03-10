export type UserRole = 'student' | 'beginner';
export type BudgetLevel = 'zero' | 'low' | 'medium';
export type TimeAvailable = '1-2h' | '3-5h' | 'full-time';

export interface UserProfile {
  role: UserRole;
  budget: BudgetLevel;
  time: TimeAvailable;
  onboarded: boolean;
}

export interface Task {
  day: number;
  title: string;
  description: string;
  completed: boolean;
  status?: 'incomplete' | 'pending' | 'completed';
  screenshotUrl?: string;
  submittedAt?: string;
  videoId?: string;
}

export interface Roadmap {
  id: string;
  title: string;
  tasks: Task[];
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
