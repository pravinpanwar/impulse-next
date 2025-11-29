import pool from '../db';

export interface UserStats {
  xp: number;
  streak: number;
  last_login: Date | null;
}

export async function getUserStats(userId: number): Promise<UserStats | null> {
  const [rows] = await pool.execute(
    'SELECT xp, streak, last_login FROM user_stats WHERE user_id = ?',
    [userId]
  ) as any[];
  
  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0] as UserStats;
  }
  
  // Initialize if not exists
  await pool.execute(
    'INSERT INTO user_stats (user_id, xp, streak) VALUES (?, 0, 0)',
    [userId]
  );
  
  return { xp: 0, streak: 0, last_login: null };
}

export async function updateUserStats(
  userId: number,
  xp: number,
  streak: number
): Promise<void> {
  await pool.execute(
    'UPDATE user_stats SET xp = ?, streak = ?, last_login = CURDATE() WHERE user_id = ?',
    [xp, streak, userId]
  );
}

export async function incrementUserXP(userId: number, amount: number): Promise<void> {
  await pool.execute(
    'UPDATE user_stats SET xp = xp + ? WHERE user_id = ?',
    [amount, userId]
  );
}

export async function updateUserStreak(userId: number, streak: number): Promise<void> {
  await pool.execute(
    'UPDATE user_stats SET streak = ? WHERE user_id = ?',
    [streak, userId]
  );
}

