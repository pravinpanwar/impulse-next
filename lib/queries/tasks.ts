import pool from '../db';

export interface Task {
  id: number;
  user_id: number;
  text: string;
  time: string | null;
  created_at: Date;
}

export async function getTasksByUserId(userId: number): Promise<Task[]> {
  const [rows] = await pool.execute(
    'SELECT id, user_id, text, time, created_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows as Task[];
}

export async function createTask(userId: number, text: string, time: string | null = null): Promise<number> {
  const [result] = await pool.execute(
    'INSERT INTO tasks (user_id, text, time) VALUES (?, ?, ?)',
    [userId, text, time]
  ) as any[];
  return result.insertId;
}

export async function deleteTask(taskId: number, userId: number): Promise<boolean> {
  const [result] = await pool.execute(
    'DELETE FROM tasks WHERE id = ? AND user_id = ?',
    [taskId, userId]
  ) as any[];
  return result.affectedRows > 0;
}

export async function updateTask(taskId: number, userId: number, text: string, time: string | null = null): Promise<boolean> {
  const [result] = await pool.execute(
    'UPDATE tasks SET text = ?, time = ? WHERE id = ? AND user_id = ?',
    [text, time, taskId, userId]
  ) as any[];
  return result.affectedRows > 0;
}

