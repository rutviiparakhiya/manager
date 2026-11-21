export type TaskSectionType = 'today' | 'yesterday';

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}
