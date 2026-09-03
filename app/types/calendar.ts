export interface CalendarTaskItem {
  id: string;
  date: string; // ISO date format 'YYYY-MM-DD'
  text: string;
  completed: boolean;
  createdAt: number;
}

export type CalendarTasksMap = Record<string, CalendarTaskItem[]>;

export interface CalendarDayInfo {
  dayNumber: number;
  dateKey: string; // 'YYYY-MM-DD'
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasTasks: boolean;
  taskCount: number;
}
