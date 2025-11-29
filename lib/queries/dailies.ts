import pool from '../db';

export interface Daily {
  id: number;
  user_id: number;
  text: string;
  time: string | null;
  streak: number;
  completed_today: boolean;
  goal_id: number | null;
  created_at: Date;
}

export async function getDailiesByUserId(userId: number): Promise<Daily[]> {
  const [rows] = await pool.execute(
    'SELECT id, user_id, text, time, streak, completed_today, goal_id, created_at FROM dailies WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows as Daily[];
}

export async function createDaily(
  userId: number,
  text: string,
  time: string | null = null,
  goalId: number | null = null
): Promise<number> {
  const [result] = await pool.execute(
    'INSERT INTO dailies (user_id, text, time, goal_id) VALUES (?, ?, ?, ?)',
    [userId, text, time, goalId]
  ) as any[];
  return result.insertId;
}

export async function deleteDaily(dailyId: number, userId: number): Promise<boolean> {
  const [result] = await pool.execute(
    'DELETE FROM dailies WHERE id = ? AND user_id = ?',
    [dailyId, userId]
  ) as any[];
  return result.affectedRows > 0;
}

export async function updateDaily(
  dailyId: number,
  userId: number,
  text: string,
  time: string | null = null
): Promise<boolean> {
  const [result] = await pool.execute(
    'UPDATE dailies SET text = ?, time = ? WHERE id = ? AND user_id = ?',
    [text, time, dailyId, userId]
  ) as any[];
  return result.affectedRows > 0;
}

export async function completeDaily(dailyId: number, userId: number): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Update daily record
    const [updateResult] = await connection.execute(
      'UPDATE dailies SET completed_today = TRUE, streak = streak + 1 WHERE id = ? AND user_id = ?',
      [dailyId, userId]
    ) as any[];

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return false;
    }

    // Add to history
    await connection.execute(
      'INSERT INTO daily_history (daily_id, completed_at) VALUES (?, NOW())',
      [dailyId]
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getDailyHistory(dailyId: number, userId: number): Promise<string[]> {
  const [rows] = await pool.execute(
    `SELECT dh.completed_at 
     FROM daily_history dh
     INNER JOIN dailies d ON dh.daily_id = d.id
     WHERE dh.daily_id = ? AND d.user_id = ?
     ORDER BY dh.completed_at DESC`,
    [dailyId, userId]
  ) as any[];
  
  return rows.map((row: any) => row.completed_at.toISOString());
}

export async function resetDailyCompletions(userId: number): Promise<void> {
  await pool.execute(
    'UPDATE dailies SET completed_today = FALSE WHERE user_id = ?',
    [userId]
  );
}

