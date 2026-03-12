'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type User = {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  color: string;
};

export type Comment = {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
};

export type Checkpoint = {
  id: string;
  date: string;
  comment: string;
};

export type TaskStatus = 'Em andamento' | 'Concluída';
export type TaskPriority = 'Urgente' | 'Alta' | 'Normal' | 'Baixa';

export type Task = {
  id: string;
  title: string;
  team: string;
  assignees: string[];
  createdAt: string;
  checkpoints: Checkpoint[];
  status: TaskStatus;
  priority: TaskPriority;
  description: string;
  slackLink?: string;
  comments: Comment[];
};

const defaultUsers: User[] = [];

const fallbackUser: User = {
  id: 'current',
  name: 'Usuário',
  avatar: '',
  initials: 'U',
  color: 'bg-slate-200 text-slate-700',
};

type TaskContextType = {
  tasks: Task[];
  users: User[];
  teams: string[];
  responsibles: string[];
  addTask: (task: Omit<Task, 'id' | 'comments' | 'createdAt' | 'checkpoints'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  addComment: (taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  addCheckpoint: (taskId: string, checkpoint: { date: string; comment: string }) => void;
  addTeam: (team: string) => void;
  removeTeam: (team: string) => void;
  addResponsible: (name: string) => void;
  removeResponsible: (name: string) => void;
  exportData: () => void;
  importData: (data: { tasks: Task[]; teams: string[]; responsibles: string[] }) => void;
  isNewTaskModalOpen: boolean;
  setIsNewTaskModalOpen: (isOpen: boolean) => void;
  currentUser: User;
};

export const TaskContext = createContext<TaskContextType | null>(null);

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [responsibles, setResponsibles] = useState<string[]>([]);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const currentUser = defaultUsers[3] ?? fallbackUser;

  const migrateStatus = useCallback((status: unknown): TaskStatus => {
    const s = String(status ?? '');
    if (s === 'Concluída' || s === 'Concluído') return 'Concluída';
    return 'Em andamento';
  }, []);

  const migrateTasks = useCallback((rawTasks: Record<string, unknown>[]): Task[] => {
    const userNameById: Record<string, string> = {};
    defaultUsers.forEach(u => { userNameById[u.id] = u.name; });
    return rawTasks.map(t => {
      const raw = t as Record<string, unknown>;
      let task: Task = raw as Task;
      if ('assigneeIds' in raw && !('assignees' in raw)) {
        const ids = raw.assigneeIds as string[];
        const assignees = ids.map(id => userNameById[id] ?? id);
        const { assigneeIds: _, ...rest } = raw;
        task = { ...rest, assignees } as Task;
      }
      if ('nextCheckpoint' in raw && !('createdAt' in raw)) {
        const { nextCheckpoint, ...rest } = raw;
        task = {
          ...rest,
          createdAt: (nextCheckpoint as string) || new Date().toISOString(),
          checkpoints: [],
        } as unknown as Task;
      }
      task = { ...task, status: migrateStatus(task.status) };
      if (!Array.isArray(task.comments)) task = { ...task, comments: [] };
      if (!Array.isArray(task.checkpoints)) task = { ...task, checkpoints: [] };
      if (task.description === undefined) task = { ...task, description: '' };
      if (task.priority === undefined) task = { ...task, priority: 'Normal' };
      return task;
    });
  }, [migrateStatus]);

  useEffect(() => {
    const loadData = () => {
      const storedTasks = localStorage.getItem('taskflow_tasks');
      if (storedTasks) {
        setTasks(migrateTasks(JSON.parse(storedTasks)));
      }

      const storedTeams = localStorage.getItem('taskflow_teams');
      if (storedTeams) {
        setTeams(JSON.parse(storedTeams));
      }

      const storedResponsibles = localStorage.getItem('taskflow_responsibles');
      if (storedResponsibles) {
        setResponsibles(JSON.parse(storedResponsibles));
      }

      setUsers(defaultUsers);
      setIsLoaded(true);
    };
    loadData();
  }, [migrateTasks]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('taskflow_teams', JSON.stringify(teams));
    }
  }, [teams, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('taskflow_responsibles', JSON.stringify(responsibles));
    }
  }, [responsibles, isLoaded]);

  const addTask = (task: Omit<Task, 'id' | 'comments' | 'createdAt' | 'checkpoints'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      comments: [],
      createdAt: new Date().toISOString(),
      checkpoints: [],
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const addCheckpoint = (taskId: string, checkpoint: { date: string; comment: string }) => {
    setTasks(tasks.map(t => {
      if (t.id !== taskId) return t;
      const dateStr = checkpoint.date.includes('T') ? checkpoint.date : new Date(checkpoint.date + 'T12:00:00').toISOString();
      return {
        ...t,
        checkpoints: [...t.checkpoints, { id: Date.now().toString(), date: dateStr, comment: checkpoint.comment }],
      };
    }));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addComment = (taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          comments: [...t.comments, { ...comment, id: Date.now().toString(), createdAt: new Date().toISOString() }]
        };
      }
      return t;
    }));
  };

  const addTeam = (team: string) => {
    if (team.trim() && !teams.includes(team.trim())) {
      setTeams([...teams, team.trim()]);
    }
  };

  const removeTeam = (team: string) => {
    setTeams(teams.filter(t => t !== team));
  };

  const addResponsible = (name: string) => {
    if (name.trim() && !responsibles.includes(name.trim())) {
      setResponsibles([...responsibles, name.trim()]);
    }
  };

  const removeResponsible = (name: string) => {
    setResponsibles(responsibles.filter(r => r !== name));
  };

  const exportData = () => {
    const data = { tasks, teams, responsibles, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-dados-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (data: { tasks: Task[]; teams: string[]; responsibles: string[] }) => {
    if (Array.isArray(data.tasks)) setTasks(migrateTasks(data.tasks as unknown as Record<string, unknown>[]));
    if (Array.isArray(data.teams)) setTeams(data.teams);
    if (Array.isArray(data.responsibles)) setResponsibles(data.responsibles);
  };

  if (!isLoaded) return null;

  return (
    <TaskContext.Provider value={{
      tasks, users, teams, responsibles,
      addTask, updateTask, removeTask, addComment, addCheckpoint,
      addTeam, removeTeam, addResponsible, removeResponsible,
      exportData, importData,
      isNewTaskModalOpen, setIsNewTaskModalOpen, currentUser
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
