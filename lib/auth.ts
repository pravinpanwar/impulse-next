import bcrypt from 'bcryptjs';
import pool from './db';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function getUserByEmail(email: string) {
  const [rows] = await pool.execute(
    'SELECT id, username, email, password_hash FROM users WHERE email = ?',
    [email]
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] as {
    id: number;
    username: string;
    email: string;
    password_hash: string;
  } : null;
}

export async function getUserByUsername(username: string) {
  const [rows] = await pool.execute(
    'SELECT id, username, email, password_hash FROM users WHERE username = ?',
    [username]
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] as {
    id: number;
    username: string;
    email: string;
    password_hash: string;
  } : null;
}

export async function createUser(username: string, email: string, passwordHash: string) {
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, passwordHash]
  ) as any[];
  
  // Initialize user stats
  await pool.execute(
    'INSERT INTO user_stats (user_id, xp, streak) VALUES (?, 0, 0)',
    [result.insertId]
  );
  
  return result.insertId;
}

