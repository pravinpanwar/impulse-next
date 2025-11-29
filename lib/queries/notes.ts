import pool from '../db';

export interface Note {
  id: number;
  user_id: number;
  text: string;
  category: string;
  created_at: Date;
}

export async function getNotesByUserId(userId: number): Promise<Note[]> {
  const [rows] = await pool.execute(
    'SELECT id, user_id, text, category, created_at FROM notes WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows as Note[];
}

export async function createNote(userId: number, text: string, category: string): Promise<number> {
  const [result] = await pool.execute(
    'INSERT INTO notes (user_id, text, category) VALUES (?, ?, ?)',
    [userId, text, category]
  ) as any[];
  return result.insertId;
}

export async function deleteNote(noteId: number, userId: number): Promise<boolean> {
  const [result] = await pool.execute(
    'DELETE FROM notes WHERE id = ? AND user_id = ?',
    [noteId, userId]
  ) as any[];
  return result.affectedRows > 0;
}

