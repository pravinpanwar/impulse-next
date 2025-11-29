'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, Daily, Note, Goal, UserStats } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (text: string, time: string | null = null) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, time }),
      });
      if (res.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return { tasks, loading, addTask, deleteTask, refresh: fetchTasks };
}

export function useDailies() {
  const [dailies, setDailies] = useState<Daily[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDailies = useCallback(async () => {
    try {
      const res = await fetch('/api/dailies');
      if (res.ok) {
        const data = await res.json();
        setDailies(data);
      }
    } catch (error) {
      console.error('Error fetching dailies:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailies();
  }, [fetchDailies]);

  const addDaily = async (text: string, time: string | null = null, goalId: number | null = null) => {
    try {
      const res = await fetch('/api/dailies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, time, goalId }),
      });
      if (res.ok) {
        await fetchDailies();
      }
    } catch (error) {
      console.error('Error adding daily:', error);
    }
  };

  const deleteDaily = async (id: number) => {
    try {
      const res = await fetch(`/api/dailies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDailies(dailies.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error('Error deleting daily:', error);
    }
  };

  const completeDaily = async (id: number) => {
    try {
      const res = await fetch(`/api/dailies/${id}/complete`, { method: 'POST' });
      if (res.ok) {
        await fetchDailies();
      }
    } catch (error) {
      console.error('Error completing daily:', error);
    }
  };

  const getDailyHistory = async (id: number): Promise<string[]> => {
    try {
      const res = await fetch(`/api/dailies/${id}/complete`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        return data.history || [];
      }
    } catch (error) {
      console.error('Error fetching daily history:', error);
    }
    return [];
  };

  return { dailies, loading, addDaily, deleteDaily, completeDaily, getDailyHistory, refresh: fetchDailies };
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async (text: string, category: string) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, category }),
      });
      if (res.ok) {
        await fetchNotes();
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const deleteNote = async (id: number) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotes(notes.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return { notes, loading, addNote, deleteNote, refresh: fetchNotes };
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch('/api/goals');
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (name: string, color: string) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
      });
      if (res.ok) {
        await fetchGoals();
      }
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const deleteGoal = async (id: number) => {
    try {
      const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGoals(goals.filter(g => g.id !== id));
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  return { goals, loading, addGoal, deleteGoal, refresh: fetchGoals };
}

export function useStats() {
  const [stats, setStats] = useState<UserStats>({ xp: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const updateStats = async (xp: number, streak: number) => {
    try {
      const res = await fetch('/api/stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp, streak }),
      });
      if (res.ok) {
        setStats({ xp, streak });
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  return { stats, loading, updateStats, refresh: fetchStats };
}

