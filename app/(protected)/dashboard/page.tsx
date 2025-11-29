'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, CheckCircle, XCircle, RefreshCw, Zap, Brain, Trophy, History, Activity, Lock, ShieldAlert, Play, Clock, Calendar, Edit3, Save, FileText, Tag, Copy, Target, BarChart2, ChevronLeft, Layers, LogOut, User } from 'lucide-react';
import { useTasks, useDailies, useNotes, useGoals, useStats } from '@/lib/hooks/useData';
import { GlitchText } from '@/components/ui/GlitchText';
import { AppState, TaskType, ActiveTab, Task, Daily, Note, Goal } from '@/lib/types';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  // Session & Router
  const { data: session } = useSession();
  const router = useRouter();

  // Data hooks
  const { tasks, addTask, deleteTask } = useTasks();
  const { dailies, addDaily, deleteDaily, completeDaily, getDailyHistory } = useDailies();
  const { notes, addNote, deleteNote } = useNotes();
  const { goals, addGoal, deleteGoal } = useGoals();
  const { stats, updateStats } = useStats();

  // Logout handler
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  // Input State
  const [inputValue, setInputValue] = useState('');
  const [inputTime, setInputTime] = useState('');
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [inputType, setInputType] = useState<ActiveTab>('DAILIES');
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [noteCategory, setNoteCategory] = useState('IDEA');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  // App Flow State
  const [activeTab, setActiveTab] = useState<ActiveTab>('DAILIES');
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [currentTask, setCurrentTask] = useState<Task | Daily | null>(null);
  const [taskType, setTaskType] = useState<TaskType>(null);
  const [inspectingItem, setInspectingItem] = useState<Daily | null>(null);

  // Editing State
  const [editValue, setEditValue] = useState('');
  const [editTime, setEditTime] = useState('');

  // Mechanics State
  const [timeLeft, setTimeLeft] = useState(1200);
  const [initialTime, setInitialTime] = useState(1200);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [history, setHistory] = useState<string[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load stats
  useEffect(() => {
    setStreak(stats.streak);
    setXp(stats.xp);
  }, [stats]);

  // Reset daily completions on new day
  useEffect(() => {
    const lastLogin = localStorage.getItem('impulse_last_login');
    const today = new Date().toDateString();
    if (lastLogin !== today) {
      // Reset logic would go here - we'd need an API endpoint for this
      localStorage.setItem('impulse_last_login', today);
    }
  }, []);

  useEffect(() => {
    setInputType(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (appState === 'ACTIVE' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && appState === 'ACTIVE') {
      handleFail();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [appState, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (inputType === 'DAILIES') {
      await addDaily(inputValue.trim(), inputTime || null, selectedGoalId);
    } else if (inputType === 'NOTES') {
      const finalCategory = isCustomCategory ? (customCategory.trim() || 'GENERAL') : noteCategory;
      await addNote(inputValue.trim(), finalCategory);
      setCustomCategory('');
      setIsCustomCategory(false);
    } else {
      await addTask(inputValue.trim(), inputTime || null);
    }
    
    setInputValue('');
    setInputTime('');
    setShowTimeInput(false);
    setSelectedGoalId(null);
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim()) return;
    const colors = ['text-purple-400 border-purple-500', 'text-cyan-400 border-cyan-500', 'text-yellow-400 border-yellow-500', 'text-pink-400 border-pink-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    await addGoal(goalInput.trim(), randomColor);
    setGoalInput('');
  };

  const removeDaily = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await deleteDaily(id);
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const initiateProtocol = (type: 'DAILY' | 'CHAOS') => {
    let pool: (Task | Daily)[] = [];
    if (type === 'DAILY') {
      pool = dailies.filter(d => !d.completed_today);
    } else {
      pool = tasks;
    }

    if (pool.length === 0) return;

    setAppState('SPINNING');
    setTaskType(type);
    
    let spins = 0;
    const maxSpins = 15;
    const interval = setInterval(() => {
      spins++;
      const randomIndex = Math.floor(Math.random() * pool.length);
      setCurrentTask(pool[randomIndex]);
      
      if (spins >= maxSpins) {
        clearInterval(interval);
        presentTarget(pool[randomIndex]);
      }
    }, 80);
  };

  const presentTarget = (task: Task | Daily) => {
    setCurrentTask(task);
    setAppState('READY_CHECK');
  };

  const startMission = () => {
    setAppState('ACTIVE');
    setTimeLeft(1200);
    setInitialTime(1200);
  };

  const enterNegotiation = () => {
    if (!currentTask) return;
    setEditValue(currentTask.text);
    setEditTime(currentTask.time || '');
    setAppState('EDITING');
  };

  const saveNegotiation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask) return;

    // Update task/daily logic would go here - need API endpoint for updates
    setAppState('IDLE');
    setCurrentTask(null);
  };

  const handleSuccess = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setAppState('RESULT');
    const newStreak = streak + 1;
    const xpGain = 150 + (streak * 10);
    const newXp = xp + xpGain;
    
    setStreak(newStreak);
    setXp(newXp);
    setHistory([`COMPLETED: ${currentTask?.text || ''}`, ...history].slice(0, 5));
    await updateStats(newXp, newStreak);
    
    if (taskType === 'CHAOS' && currentTask) {
      await deleteTask(currentTask.id);
    } else if (taskType === 'DAILY' && currentTask) {
      await completeDaily(currentTask.id);
    }
  };

  const handleFail = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setAppState('RESULT');
    setStreak(0);
    setHistory([`FAILED: ${currentTask?.text || ''}`, ...history].slice(0, 5));
    updateStats(xp, 0);
  };

  const inspectDaily = async (daily: Daily) => {
    const history = await getDailyHistory(daily.id);
    setInspectingItem({ ...daily, history });
    setAppState('PROGRESS_VIEW');
  };

  const resetToIdle = () => {
    setAppState('IDLE');
    setCurrentTask(null);
    setTaskType(null);
    setInspectingItem(null);
  };

  const pendingDailies = dailies.filter(d => !d.completed_today).length;
  const totalDailies = dailies.length;
  const dailyProgress = totalDailies === 0 ? 100 : Math.round(((totalDailies - pendingDailies) / totalDailies) * 100);

  // Render functions
  const renderIdleView = () => (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto p-2 sm:p-4 space-y-3 sm:space-y-6">
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-4">
        <div className={`p-2 sm:p-3 md:p-4 border-2 rounded-lg backdrop-blur transition-all cursor-pointer flex flex-col justify-between touch-manipulation ${activeTab === 'DAILIES' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-800 bg-black/40 opacity-60'}`} onClick={() => setActiveTab('DAILIES')}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-1 sm:mb-2">
            <h2 className="text-blue-400 font-mono text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest">Baseline</h2>
            <ShieldAlert size={14} className={`sm:w-4 sm:h-4 ${pendingDailies > 0 ? "text-red-500 animate-pulse" : "text-green-500"}`} />
          </div>
          <div className="text-lg sm:text-xl md:text-2xl font-black text-white">{totalDailies - pendingDailies}/{totalDailies}</div>
          <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${dailyProgress}%` }}></div>
          </div>
        </div>
        <div className={`p-2 sm:p-3 md:p-4 border-2 rounded-lg backdrop-blur transition-all cursor-pointer flex flex-col justify-between touch-manipulation ${activeTab === 'CHAOS' ? 'border-green-500 bg-green-900/20' : 'border-gray-800 bg-black/40 opacity-60'}`} onClick={() => setActiveTab('CHAOS')}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-1 sm:mb-2">
             <h2 className="text-green-400 font-mono text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest">Chaos</h2>
             <Activity size={14} className="sm:w-4 sm:h-4 text-green-500" />
          </div>
          <div className="text-lg sm:text-xl md:text-2xl font-black text-white">{tasks.length} <span className="text-[9px] sm:text-[10px] md:text-sm font-mono font-normal text-gray-400">ITEMS</span></div>
        </div>
        <div className={`p-2 sm:p-3 md:p-4 border-2 rounded-lg backdrop-blur transition-all cursor-pointer flex flex-col justify-between touch-manipulation ${activeTab === 'NOTES' ? 'border-purple-500 bg-purple-900/20' : 'border-gray-800 bg-black/40 opacity-60'}`} onClick={() => setActiveTab('NOTES')}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-1 sm:mb-2">
             <h2 className="text-purple-400 font-mono text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest">Databank</h2>
             <FileText size={14} className="sm:w-4 sm:h-4 text-purple-500" />
          </div>
          <div className="text-lg sm:text-xl md:text-2xl font-black text-white">{notes.length} <span className="text-[9px] sm:text-[10px] md:text-sm font-mono font-normal text-gray-400">NOTES</span></div>
        </div>
      </div>
      {activeTab === 'DAILIES' && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="text-[10px] sm:text-xs font-mono text-gray-500 uppercase tracking-widest">Baseline Protocol Config</div>
              <button onClick={() => setAppState('GOAL_MANAGER')} className="text-[10px] sm:text-xs font-mono text-blue-400 border border-blue-900 bg-blue-900/10 px-2 sm:px-3 py-1 rounded hover:bg-blue-900/30 flex items-center gap-1 sm:gap-2 touch-manipulation">
                  <Layers size={12} /> <span className="whitespace-nowrap">Manage Core Directives</span>
              </button>
          </div>
      )}
      <div className="bg-black/40 border border-gray-800 p-2 sm:p-4 rounded-lg backdrop-blur-sm space-y-2 sm:space-y-3 transition-all duration-300">
        {activeTab === 'NOTES' ? (
            <div className="flex flex-wrap gap-2 mb-2">
                {['IDEA', 'MEMORY', 'LIST'].map(cat => (
                    <button key={cat} onClick={() => { setNoteCategory(cat); setIsCustomCategory(false); }} className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded border transition-all ${noteCategory === cat && !isCustomCategory ? 'bg-purple-900/40 border-purple-500 text-purple-300' : 'bg-black/20 border-gray-800 text-gray-600'}`}>{cat}</button>
                ))}
                <button onClick={() => setIsCustomCategory(true)} className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded border transition-all flex items-center gap-1 ${isCustomCategory ? 'bg-purple-900/40 border-purple-500 text-purple-300' : 'bg-black/20 border-gray-800 text-gray-600'}`}><Tag size={10} /> {isCustomCategory && customCategory ? customCategory : 'CUSTOM'}</button>
                {isCustomCategory && (
                    <input type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="TAG..." className="bg-black/50 border border-purple-500/50 text-purple-200 text-xs px-2 py-1 rounded outline-none font-mono w-24" autoFocus />
                )}
            </div>
        ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                <button type="button" onClick={() => { setActiveTab('DAILIES'); setInputType('DAILIES'); }} className={`flex-1 py-2 px-3 text-xs font-mono uppercase tracking-wider border rounded transition-all flex items-center justify-center gap-2 whitespace-nowrap ${inputType === 'DAILIES' ? 'bg-blue-900/30 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-black/20 border-gray-800 text-gray-600 hover:border-gray-600'}`}>
                    <ShieldAlert size={14} /> Exec
                </button>
                <button type="button" onClick={() => { setActiveTab('CHAOS'); setInputType('CHAOS'); }} className={`flex-1 py-2 px-3 text-xs font-mono uppercase tracking-wider border rounded transition-all flex items-center justify-center gap-2 whitespace-nowrap ${inputType === 'CHAOS' ? 'bg-green-900/30 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-black/20 border-gray-800 text-gray-600 hover:border-gray-600'}`}>
                    <Activity size={14} /> Chaos
                </button>
            </div>
        )}
        {inputType === 'DAILIES' && goals.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                <button onClick={() => setSelectedGoalId(null)} className={`px-2 py-1 rounded border text-[10px] font-mono uppercase whitespace-nowrap ${!selectedGoalId ? 'border-white text-white' : 'border-gray-800 text-gray-600'}`}>No Directive</button>
                {goals.map(g => (
                    <button key={g.id} onClick={() => setSelectedGoalId(g.id)} className={`px-2 py-1 rounded border text-[10px] font-mono uppercase whitespace-nowrap transition-all ${selectedGoalId === g.id ? g.color + ' bg-white/5' : 'border-gray-800 text-gray-600 hover:border-gray-600'}`}>
                        {g.name}
                    </button>
                ))}
            </div>
        )}
        <form onSubmit={handleAddItem} className="flex gap-1.5 sm:gap-2 items-stretch">
          <div className="flex-1 flex flex-col gap-1.5 sm:gap-2">
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={inputType === 'NOTES' ? "Enter data for storage..." : inputType === 'DAILIES' ? "Define Recurring Protocol..." : "Input Random Task..."} className={`w-full bg-black/60 border-2 focus:border-opacity-100 border-gray-700 text-gray-100 text-sm sm:text-base p-2 sm:p-3 rounded font-mono outline-none transition-all placeholder-gray-600 ${inputType === 'DAILIES' ? 'focus:border-blue-500' : inputType === 'CHAOS' ? 'focus:border-green-500' : 'focus:border-purple-500'}`} />
            {showTimeInput && inputType !== 'NOTES' && (
                <input type="time" value={inputTime} onChange={(e) => setInputTime(e.target.value)} className="w-full bg-black/60 border-2 border-gray-700 text-yellow-500 text-sm p-1.5 sm:p-2 rounded font-mono outline-none focus:border-yellow-500" />
            )}
          </div>
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {inputType !== 'NOTES' && (
                <button type="button" onClick={() => setShowTimeInput(!showTimeInput)} className={`p-2 sm:p-3 rounded border-2 transition-all h-full flex items-center justify-center touch-manipulation min-h-[44px] ${showTimeInput || inputTime ? 'border-yellow-500 text-yellow-500 bg-yellow-900/20' : 'border-gray-700 text-gray-500 hover:text-yellow-500 hover:border-yellow-500'}`} title="Set Schedule">
                    <Clock size={20} className="sm:w-6 sm:h-6" />
                </button>
            )}
            <button type="submit" className={`border-2 border-gray-700 p-2 sm:p-3 rounded transition-all flex-1 flex items-center justify-center touch-manipulation min-h-[44px] ${inputType === 'DAILIES' ? 'hover:bg-blue-900/50 hover:border-blue-500 text-blue-500' : inputType === 'CHAOS' ? 'hover:bg-green-900/50 hover:border-green-500 text-green-500' : 'hover:bg-purple-900/50 hover:border-purple-500 text-purple-500'}`}>
                <Plus size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </form>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5 sm:space-y-2 pr-1 sm:pr-2 custom-scrollbar min-h-0">
        {activeTab === 'DAILIES' && (dailies.length === 0 ? (
            <div className="text-center text-gray-600 font-mono py-10">NO BASELINE ESTABLISHED.</div>
        ) : (
            dailies.map(daily => {
                const goal = goals.find(g => g.id === daily.goal_id);
                return (
                    <div key={daily.id} onClick={() => inspectDaily(daily)} className={`group flex items-center justify-between p-2 sm:p-3 md:p-4 rounded border transition-all cursor-pointer hover:bg-gray-900 touch-manipulation ${daily.completed_today ? 'bg-blue-900/10 border-blue-900/50 opacity-50' : 'bg-gray-900/50 border-gray-800 border-l-2 sm:border-l-4 border-l-blue-500'}`}>
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                            <div className="text-[10px] sm:text-xs font-mono text-gray-500 flex flex-col items-center bg-black/30 p-1 rounded flex-shrink-0">
                                <span className="text-blue-400 font-bold text-xs sm:text-sm">{daily.streak}</span>
                                <span className="text-[8px] sm:text-[10px]">DAY</span>
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className={`font-mono text-sm sm:text-base truncate ${daily.completed_today ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{daily.text}</span>
                                <div className="flex gap-1.5 sm:gap-2 items-center mt-1 flex-wrap">
                                    {daily.time && <span className="text-[9px] sm:text-[10px] font-mono text-yellow-600 flex items-center gap-1"><Clock size={9} className="sm:w-[10px] sm:h-[10px]"/> {daily.time}</span>}
                                    {goal && <span className={`text-[9px] sm:text-[10px] font-mono border px-1 rounded ${goal.color}`}>{goal.name}</span>}
                                </div>
                            </div>
                        </div>
                        {daily.completed_today ? (
                            <CheckCircle className="text-blue-500 flex-shrink-0 w-[18px] h-[18px] sm:w-5 sm:h-5"/>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                <BarChart2 size={14} className="sm:w-4 sm:h-4 text-gray-700 group-hover:text-blue-400 transition-colors" />
                                <button onClick={(e) => removeDaily(e, daily.id)} className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 touch-manipulation p-1">
                                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                </button>
                            </div>
                        )}
                    </div>
                );
            })
        ))}
        {activeTab === 'CHAOS' && (tasks.length === 0 ? (
            <div className="text-center text-gray-600 font-mono py-10">CHAOS QUEUE EMPTY.</div>
        ) : (
            tasks.map(task => (
                <div key={task.id} className="group flex items-center justify-between bg-gray-900/50 border border-gray-800 p-2 sm:p-3 md:p-4 rounded hover:border-green-500/50 transition-all">
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-gray-300 font-mono text-sm sm:text-base truncate">{task.text}</span>
                        {task.time && <span className="text-[9px] sm:text-xs font-mono text-yellow-600 flex items-center gap-1 mt-1"><Clock size={9} className="sm:w-[10px] sm:h-[10px]"/> {task.time}</span>}
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 touch-manipulation p-1 flex-shrink-0 ml-2">
                        <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                </div>
            ))
        ))}
        {activeTab === 'NOTES' && (notes.length === 0 ? (
            <div className="text-center text-gray-600 font-mono py-10">DATABANK EMPTY.</div>
        ) : (
            notes.map(note => (
                <div key={note.id} className="group bg-gray-900/30 border border-gray-800 p-2 sm:p-3 md:p-4 rounded hover:border-purple-500/50 transition-all relative">
                    <div className="flex justify-between items-start mb-1.5 sm:mb-2 gap-2">
                         <span className="text-[9px] sm:text-[10px] font-mono uppercase bg-purple-900/30 text-purple-400 px-1.5 sm:px-2 py-0.5 rounded border border-purple-500/20">{note.category}</span>
                         <div className="flex gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => copyToClipboard(note.text)} className="text-gray-500 hover:text-white touch-manipulation p-1" title="Copy Data"><Copy size={12} className="sm:w-[14px] sm:h-[14px]" /></button>
                            <button onClick={() => deleteNote(note.id)} className="text-gray-500 hover:text-red-500 touch-manipulation p-1"><Trash2 size={12} className="sm:w-[14px] sm:h-[14px]" /></button>
                         </div>
                    </div>
                    <div className="text-gray-200 font-mono text-xs sm:text-sm whitespace-pre-wrap break-words">{note.text}</div>
                </div>
            ))
        ))}
      </div>
      {activeTab !== 'NOTES' && (
        <div className="flex flex-col gap-2 sm:gap-3 pt-2 sm:pt-4">
            <button onClick={() => initiateProtocol('CHAOS')} disabled={tasks.length === 0} className={`w-full py-3 sm:py-4 font-black uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base touch-manipulation ${tasks.length === 0 ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed' : pendingDailies > 0 ? 'bg-black border-gray-700 text-gray-500 hover:border-red-500 hover:text-red-500' : 'bg-gradient-to-r from-green-600 to-emerald-800 border-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-[1.01]'}`}>
                {pendingDailies > 0 ? <><Lock size={18} className="sm:w-5 sm:h-5" /><span className="text-xs sm:text-sm">Chaos Queue (Finish Dailies)</span></> : <><Activity size={18} className="sm:w-5 sm:h-5" /><span className="text-xs sm:text-sm">Override Executive Function</span></>}
            </button>
            {pendingDailies > 0 && (
                <button onClick={() => initiateProtocol('DAILY')} className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-700 to-indigo-900 text-white font-black uppercase tracking-widest border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base touch-manipulation">
                <ShieldAlert size={20} className="sm:w-6 sm:h-6" />
                <span className="text-xs sm:text-sm">Execute Daily Protocol ({pendingDailies} Remaining)</span>
            </button>
            )}
        </div>
      )}
    </div>
  );

  const renderGoalManager = () => (
      <div className="flex flex-col h-full w-full max-w-2xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <button onClick={() => setAppState('IDLE')} className="text-gray-500 hover:text-white touch-manipulation p-1"><ChevronLeft size={20} className="sm:w-6 sm:h-6" /></button>
              <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-widest">Core Directives Config</h2>
          </div>
          <div className="bg-black/40 border border-gray-800 p-3 sm:p-4 md:p-6 rounded-lg backdrop-blur-sm">
              <form onSubmit={handleAddGoal} className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                  <input value={goalInput} onChange={(e) => setGoalInput(e.target.value)} placeholder="NEW DIRECTIVE NAME..." className="flex-1 bg-black/60 border border-gray-700 text-white text-sm sm:text-base p-2 sm:p-3 rounded font-mono outline-none focus:border-blue-500" />
                  <button type="submit" className="bg-blue-900/30 border border-blue-500 text-blue-400 px-3 sm:px-4 rounded hover:bg-blue-900/50 touch-manipulation min-w-[44px] flex items-center justify-center"><Plus size={18} className="sm:w-5 sm:h-5" /></button>
              </form>
              <div className="space-y-1.5 sm:space-y-2">
                  {goals.length === 0 ? (
                      <div className="text-gray-600 font-mono text-center py-6 sm:py-8 text-sm sm:text-base">NO CORE DIRECTIVES ESTABLISHED.</div>
                  ) : (
                      goals.map(goal => (
                          <div key={goal.id} className={`flex justify-between items-center p-2 sm:p-3 md:p-4 rounded border bg-black/20 ${goal.color}`}>
                              <span className="font-bold font-mono uppercase text-sm sm:text-base truncate flex-1">{goal.name}</span>
                              <button onClick={() => deleteGoal(goal.id)} className="text-gray-600 hover:text-red-500 touch-manipulation p-1 flex-shrink-0 ml-2"><Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>
  );

  const renderProgressView = () => {
      if (!inspectingItem) return null;
      const days = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dateStr = d.toDateString();
          const isCompleted = inspectingItem.history && inspectingItem.history.some((h: string) => new Date(h).toDateString() === dateStr);
          days.push({ date: d, isCompleted });
      }
      return (
        <div className="flex flex-col h-full w-full max-w-3xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
             <div className="flex items-center gap-2 sm:gap-4 mb-2">
                <button onClick={() => setAppState('IDLE')} className="text-gray-500 hover:text-white touch-manipulation p-1"><ChevronLeft size={20} className="sm:w-6 sm:h-6" /></button>
                <h2 className="text-base sm:text-xl font-black text-blue-400 uppercase tracking-widest font-mono">Temporal Analysis</h2>
            </div>
            <div className="bg-black/60 border-2 border-blue-900/50 p-3 sm:p-4 md:p-6 rounded-xl backdrop-blur-md">
                <div className="mb-4 sm:mb-6 md:mb-8">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2 break-words">{inspectingItem.text}</h1>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm font-mono text-gray-500">
                        <div className="flex items-center gap-2">
                            <Target size={14} className="sm:w-4 sm:h-4" />
                            <span>STREAK: <span className="text-white">{inspectingItem.streak}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <History size={14} className="sm:w-4 sm:h-4" />
                            <span>SESSIONS: <span className="text-white">{inspectingItem.history ? inspectingItem.history.length : 0}</span></span>
                        </div>
                    </div>
                </div>
                <div className="mb-4">
                    <h3 className="text-[10px] sm:text-xs font-mono text-gray-500 uppercase mb-2">30-Day Execution Heatmap</h3>
                    <div className="grid grid-cols-10 gap-1 sm:gap-2">
                        {days.map((day, idx) => (
                            <div key={idx} title={day.date.toDateString()} className={`aspect-square rounded-sm transition-all ${day.isCompleted ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-gray-900 border border-gray-800'}`}></div>
                        ))}
                    </div>
                </div>
                <div className="mt-4 sm:mt-6 border-t border-gray-800 pt-3 sm:pt-4">
                    <h3 className="text-[10px] sm:text-xs font-mono text-gray-500 uppercase mb-2 sm:mb-3">Execution Log</h3>
                    <div className="space-y-1.5 sm:space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1 sm:pr-2">
                        {inspectingItem.history && inspectingItem.history.length > 0 ? (
                            [...inspectingItem.history].reverse().map((timestamp: string, idx: number) => (
                                <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 text-xs sm:text-sm font-mono bg-black/40 p-1.5 sm:p-2 rounded border border-gray-800">
                                    <span className="text-blue-400">SESSION #{inspectingItem.history!.length - idx}</span>
                                    <span className="text-gray-300 text-[10px] sm:text-xs">{new Date(timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-600 italic text-[10px] sm:text-xs">No data recorded.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      );
  };

  const renderSpinningView = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-4 sm:space-y-6 md:space-y-8 px-4">
      <div className={`${taskType === 'DAILY' ? 'text-blue-500' : 'text-green-500'} font-mono animate-pulse text-xs sm:text-sm md:text-base text-center`}>
        {taskType === 'DAILY' ? "ACCESSING BASELINE PROTOCOLS..." : "RANDOMIZING CHAOS INPUTS..."}
      </div>
      <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black text-white text-center font-mono border-y-2 py-6 sm:py-8 md:py-10 w-full bg-black/50 backdrop-blur px-2 ${taskType === 'DAILY' ? 'border-blue-500/50' : 'border-green-500/50'}`}>
        {currentTask ? currentTask.text : "..."}
      </div>
    </div>
  );

  const renderReadyCheckView = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-4 sm:space-y-6 md:space-y-8 p-2 sm:p-4">
      <div className={`w-full max-w-2xl border-2 p-4 sm:p-6 md:p-8 rounded-xl text-center backdrop-blur-md relative overflow-hidden ${taskType === 'DAILY' ? 'border-blue-500 bg-blue-900/20' : 'border-green-500 bg-green-900/20'}`}>
        <div className="absolute top-2 left-2 flex gap-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white animate-pulse"></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white animate-pulse delay-75"></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white animate-pulse delay-150"></div>
        </div>
        <h3 className="text-gray-400 font-mono text-xs sm:text-sm uppercase tracking-[0.3em] mb-4 sm:mb-6">Target Acquired</h3>
        <div className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black text-white mb-4 sm:mb-6 tracking-tight break-words px-2">{currentTask?.text}</div>
        {currentTask?.time && (
            <div className="mb-6 sm:mb-8 md:mb-10 flex items-center justify-center gap-2 text-yellow-400 font-mono text-sm sm:text-base md:text-xl border border-yellow-500/30 bg-yellow-900/20 py-1.5 sm:py-2 px-3 sm:px-4 rounded-full inline-block">
                <Clock size={16} className="sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm md:text-base">SCHEDULED: {currentTask.time}</span>
            </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center">
            <button onClick={startMission} className={`flex items-center justify-center gap-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 rounded font-black text-base sm:text-lg md:text-xl transition-all text-white shadow-lg uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] touch-manipulation ${taskType === 'DAILY' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/40' : 'bg-green-600 hover:bg-green-500 shadow-green-500/40'}`}>
                <Play size={20} className="sm:w-6 sm:h-6" fill="currentColor" /> <span className="text-sm sm:text-base md:text-lg">Initiate</span>
            </button>
            <button onClick={enterNegotiation} className="px-4 sm:px-6 py-3 sm:py-4 md:py-5 rounded font-mono text-yellow-600 hover:text-yellow-400 hover:bg-yellow-900/20 transition-all uppercase text-xs sm:text-sm tracking-widest border border-transparent hover:border-yellow-600/50 flex items-center gap-2 justify-center touch-manipulation">
               <Edit3 size={14} className="sm:w-4 sm:h-4" /> <span className="text-xs sm:text-sm">Defer / Edit</span>
            </button>
        </div>
      </div>
      <div className="text-gray-500 font-mono text-[10px] sm:text-xs">AWAITING AUTHORIZATION...</div>
    </div>
  );

  const renderEditingView = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-4 sm:space-y-6 p-2 sm:p-4">
      <div className="w-full max-w-xl bg-black/80 border-2 border-yellow-600 p-4 sm:p-6 md:p-8 rounded-xl backdrop-blur-md shadow-[0_0_50px_rgba(202,138,4,0.15)]">
         <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 text-yellow-500">
            <Activity size={16} className="sm:w-5 sm:h-5 animate-pulse" />
            <h3 className="font-mono text-xs sm:text-sm uppercase tracking-[0.2em]">Deferral Protocol Initiated</h3>
         </div>
         <div className="text-gray-300 mb-4 sm:mb-6 font-mono text-xs sm:text-sm">
            You are attempting to defer a directive. You must RESCHEDULE or REFINE the objective to proceed. Evasion is not an option.
         </div>
         <form onSubmit={saveNegotiation} className="space-y-3 sm:space-y-4">
            <div>
                <label className="block text-[10px] sm:text-xs font-mono text-gray-500 mb-1 uppercase">Objective Name</label>
                <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full bg-black border border-gray-700 p-2 sm:p-3 text-white text-sm sm:text-base font-mono focus:border-yellow-500 outline-none rounded" />
            </div>
            <div>
                <label className="block text-[10px] sm:text-xs font-mono text-gray-500 mb-1 uppercase">Reschedule Time (Optional)</label>
                <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="w-full bg-black border border-gray-700 p-2 sm:p-3 text-yellow-500 text-sm sm:text-base font-mono focus:border-yellow-500 outline-none rounded" />
            </div>
            <div className="pt-2 sm:pt-4 flex gap-2 sm:gap-3">
                <button type="submit" className="flex-1 bg-yellow-700 hover:bg-yellow-600 text-white py-2.5 sm:py-3 font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-all text-sm sm:text-base touch-manipulation">
                    <Save size={16} className="sm:w-[18px] sm:h-[18px]" /> <span>Confirm Changes</span>
                </button>
            </div>
         </form>
      </div>
    </div>
  );

  const renderActiveView = () => (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto p-2 sm:p-4 items-center justify-center space-y-4 sm:space-y-6 md:space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1 animate-scanline ${taskType === 'DAILY' ? 'bg-blue-500/20' : 'bg-green-500/20'}`}></div>
      </div>
      <div className={`w-full bg-black/60 border-2 p-4 sm:p-6 md:p-8 rounded-xl text-center backdrop-blur-md ${taskType === 'DAILY' ? 'border-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.15)]' : 'border-red-500/50 shadow-[0_0_50px_rgba(220,38,38,0.15)]'}`}>
        <h3 className={`${taskType === 'DAILY' ? 'text-blue-400' : 'text-red-400'} font-mono text-xs sm:text-sm uppercase tracking-[0.3em] mb-3 sm:mb-4`}>
            {taskType === 'DAILY' ? "BASELINE REINFORCEMENT" : "CURRENT OBJECTIVE"}
        </h3>
        {currentTask && <GlitchText text={currentTask.text} as="h1" className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black text-white mb-4 sm:mb-6 md:mb-8 block break-words px-2" />}
        <div className="font-mono text-5xl sm:text-6xl md:text-7xl lg:text-9xl text-gray-200 tracking-tighter tabular-nums mb-4 sm:mb-6 md:mb-8">{formatTime(timeLeft)}</div>
        <div className="w-full h-2 bg-gray-800 rounded-full mb-4 sm:mb-6 md:mb-8 overflow-hidden">
          <div className={`h-full transition-all duration-1000 ${taskType === 'DAILY' ? 'bg-blue-500' : 'bg-gradient-to-r from-green-500 to-red-500'}`} style={{ width: `${(timeLeft / initialTime) * 100}%` }} />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center w-full">
          <button onClick={handleSuccess} className={`flex items-center justify-center gap-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded font-bold text-base sm:text-lg md:text-xl transition-all text-white shadow-lg hover:scale-105 touch-manipulation ${taskType === 'DAILY' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/40' : 'bg-green-600 hover:bg-green-500 shadow-green-500/40'}`}>
            <CheckCircle size={18} className="sm:w-5 sm:h-5" /> <span className="text-sm sm:text-base md:text-lg">COMPLETE</span>
          </button>
          <button onClick={handleFail} className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-red-900/50 text-gray-500 hover:text-red-400 border border-gray-700 hover:border-red-500 px-4 sm:px-6 py-3 sm:py-4 rounded font-bold text-sm sm:text-base md:text-lg transition-all touch-manipulation">
            <XCircle size={18} className="sm:w-5 sm:h-5" /> <span className="text-sm sm:text-base md:text-lg">ABORT</span>
          </button>
        </div>
      </div>
      <div className="text-gray-500 font-mono text-[10px] sm:text-xs animate-pulse text-center">
        {taskType === 'DAILY' ? "MAINTAINING DISCIPLINE..." : "FOCUS LOCK ENGAGED."}
      </div>
    </div>
  );

  const renderResultView = () => {
    const isSuccess = streak > 0;
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 sm:space-y-6 md:space-y-8 p-2 sm:p-4 text-center">
        <div className={`p-4 sm:p-6 md:p-8 rounded-2xl border-2 sm:border-4 ${isSuccess ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'} backdrop-blur-lg max-w-xl w-full`}>
          <div className="mb-3 sm:mb-4">
            {isSuccess ? <Trophy size={48} className="sm:w-16 sm:h-16 text-yellow-400 mx-auto" /> : <Zap size={48} className="sm:w-16 sm:h-16 text-red-500 mx-auto" />}
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4 ${isSuccess ? 'text-green-400' : 'text-red-500'}`}>
            {isSuccess ? "OBJECTIVE SECURED" : "MISSION FAILED"}
          </h2>
          <p className="text-gray-300 font-mono mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base md:text-lg px-2">
            {isSuccess ? taskType === 'DAILY' ? "Baseline integrity restored. Discipline increased." : "Task executed. Dopamine authorized." : "Disappointing. Resetting synchronization."}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
             <div className="bg-black/40 p-2 sm:p-3 md:p-4 rounded border border-gray-700">
                <div className="text-[10px] sm:text-xs text-gray-500 uppercase">XP Gained</div>
                <div className="text-xl sm:text-2xl font-bold text-white">{isSuccess ? `+${150 + ((streak - 1) * 10)}` : "0"}</div>
             </div>
             <div className="bg-black/40 p-2 sm:p-3 md:p-4 rounded border border-gray-700">
                <div className="text-[10px] sm:text-xs text-gray-500 uppercase">Current Streak</div>
                <div className="text-xl sm:text-2xl font-bold text-white">{streak}</div>
             </div>
          </div>
          <button onClick={resetToIdle} className="w-full bg-white text-black font-bold py-3 sm:py-4 rounded hover:bg-gray-200 transition-all uppercase tracking-widest flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation">
            <RefreshCw size={18} className="sm:w-5 sm:h-5" /> <span>{isSuccess ? "Next Objective" : "Try Again"}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans overflow-hidden relative selection:bg-green-500 selection:text-black">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-overlay"></div>
      
      <div className="absolute top-0 left-0 w-full p-2 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 z-20 bg-gradient-to-b from-black to-transparent">
        <div className="flex items-center gap-2">
          <Brain className="text-blue-500" size={18} />
          <span className="font-mono text-blue-500 font-bold tracking-widest text-xs sm:text-sm hidden md:inline">IMPULSE_PROTOCOL_V3</span>
          <span className="font-mono text-blue-500 font-bold tracking-widest text-xs sm:text-sm md:hidden">IMPULSE_V2</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-mono flex-wrap">
          <div className="flex items-center gap-1 text-yellow-500">
            <Zap size={12} className="sm:w-[14px] sm:h-[14px]" />
            <span>LVL {Math.floor(xp / 1000)}</span>
          </div>
          <div className="flex items-center gap-1 text-purple-500">
            <History size={12} className="sm:w-[14px] sm:h-[14px]" />
            <span>{streak}x</span>
          </div>
          {session?.user?.name && (
            <div className="flex items-center gap-1 sm:gap-2 text-blue-400 border-l border-gray-700 pl-2 sm:pl-4">
              <User size={12} className="sm:w-[14px] sm:h-[14px]" />
              <span className="hidden sm:inline truncate max-w-[100px] md:max-w-none">{session.user.name}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded border border-gray-700 hover:border-red-500 hover:bg-red-900/20 text-gray-400 hover:text-red-400 transition-all text-[10px] sm:text-xs font-mono uppercase tracking-wider touch-manipulation"
            title="Logout"
          >
            <LogOut size={12} className="sm:w-[14px] sm:h-[14px]" />
            <span className="hidden sm:inline">LOGOUT</span>
          </button>
        </div>
      </div>

      <main className="h-screen pt-20 sm:pt-16 pb-4 px-2 sm:px-4 relative z-10 flex flex-col">
        {appState === 'IDLE' && renderIdleView()}
        {appState === 'GOAL_MANAGER' && renderGoalManager()}
        {appState === 'PROGRESS_VIEW' && renderProgressView()}
        {appState === 'SPINNING' && renderSpinningView()}
        {appState === 'READY_CHECK' && renderReadyCheckView()}
        {appState === 'EDITING' && renderEditingView()}
        {appState === 'ACTIVE' && renderActiveView()}
        {appState === 'RESULT' && renderResultView()}
      </main>
      
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .animate-scanline {
          animation: scanline 3s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #000; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333; 
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}

