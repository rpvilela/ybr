'use client';

import { Plus, Menu } from 'lucide-react';
import { useTasks } from '@/context/TaskContext';

export default function Header({ title, subtitle, showNewTaskButton = false }: { title?: string, subtitle?: string, showNewTaskButton?: boolean }) {
  const { setIsNewTaskModalOpen } = useTasks();

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white border-b border-slate-200 shrink-0">
      <div className="flex items-center gap-4">
        <button title="Menu" className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
        {title && (
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {showNewTaskButton && (
          <button
            title="Nova Tarefa"
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        )}
      </div>
    </header>
  );
}
