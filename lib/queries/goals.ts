import pool from '../db';

export interface Goal {
  id: number;
  user_id: number;
  name: string;
  color: string;
  created_at: Date;
}

export async function getGoalsByUserId(userId: number): Promise<Goal[]> {
  const [rows] = await pool.execute(
    'SELECT id, user_id, name, color, created_at FROM goals WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows as Goal[];
}

export async function createGoal(userId: number, name: string, color: string): Promise<number> {
  const [result] = await pool.execute(
    'INSERT INTO goals (user_id, name, color) VALUES (?, ?, ?)',
    [userId, name, color]
  ) as any[];
  return result.insertId;
}

export async function deleteGoal(goalId: number, userId: number): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Remove goal_id from dailies
    await connection.execute(
      'UPDATE dailies SET goal_id = NULL WHERE goal_id = ? AND user_id = ?',
      [goalId, userId]
    );

    // Delete goal
    const [result] = await connection.execute(
      'DELETE FROM goals WHERE id = ? AND user_id = ?',
      [goalId, userId]
    ) as any[];

    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

