export interface Task {
  id: number;
  user_id?: number;
  text: string;
  time: string | null;
  created_at?: string | Date;
}

export interface Daily {
  id: number;
  user_id?: number;
  text: string;
  time: string | null;
  streak: number;
  completed_today: boolean;
  goal_id: number | null;
  created_at?: string | Date;
  history?: string[];
}

export interface Note {
  id: number;
  user_id?: number;
  text: string;
  category: string;
  created_at?: string | Date;
}

export interface Goal {
  id: number;
  user_id?: number;
  name: string;
  color: string;
  created_at?: string | Date;
}

export interface UserStats {
  xp: number;
  streak: number;
  last_login?: string | Date | null;
}

export type AppState = 'IDLE' | 'SPINNING' | 'READY_CHECK' | 'ACTIVE' | 'RESULT' | 'EDITING' | 'GOAL_MANAGER' | 'PROGRESS_VIEW';
export type TaskType = 'DAILY' | 'CHAOS' | null;
export type ActiveTab = 'DAILIES' | 'CHAOS' | 'NOTES';

