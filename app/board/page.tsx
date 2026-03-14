'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import { useTasks } from '@/context/TaskContext';
import type { Task } from '@/context/TaskContext';
import Link from 'next/link';
import { CheckCircle, CalendarPlus, ExternalLink, User } from 'lucide-react';
import AddCheckpointModal from '@/components/AddCheckpointModal';

type ViewMode = 'responsavel' | 'time';
type StatusFilter = 'Todos' | 'Em andamento' | 'Concluída';

function priorityClass(priority: Task['priority']): string {
  switch (priority) {
    case 'Urgente': return 'bg-red-100 text-red-700';
    case 'Alta': return 'bg-yellow-100 text-yellow-700';
    case 'Normal': return 'bg-blue-100 text-blue-700';
    case 'Baixa': return 'bg-green-100 text-green-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}

export default function BoardPage() {
  const { tasks, teams, responsibles, updateTask } = useTasks();
  const [viewMode, setViewMode] = useState<ViewMode>('responsavel');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Em andamento');
  const [checkpointTaskId, setCheckpointTaskId] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    if (statusFilter === 'Todos') return tasks;
    return tasks.filter(t => t.status === statusFilter);
  }, [tasks, statusFilter]);

  const columns = useMemo(() => {
    if (viewMode === 'responsavel') {
      const semResponsavel = { name: 'Sem responsável', tasks: filteredTasks.filter(t => t.assignees.length === 0) };
      const byResponsible: { name: string; tasks: Task[] }[] = [semResponsavel];
      for (const name of responsibles) {
        const columnTasks = filteredTasks.filter(t => t.assignees.includes(name));
        if (columnTasks.length > 0) {
          byResponsible.push({ name, tasks: columnTasks });
        }
      }
      return byResponsible;
    }
    const semTime = { name: 'Sem time', tasks: filteredTasks.filter(t => !t.team || t.team.trim() === '') };
    const byTeam: { name: string; tasks: Task[] }[] = [semTime];
    for (const name of teams) {
      const columnTasks = filteredTasks.filter(t => t.team === name);
      if (columnTasks.length > 0) {
        byTeam.push({ name, tasks: columnTasks });
      }
    }
    return byTeam;
  }, [viewMode, filteredTasks, teams, responsibles]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f6f7f8]">
      <Header title="Board" showNewTaskButton={true} />
      <div className="flex-1 overflow-auto p-4 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-600">Agrupar por:</span>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('responsavel')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'responsavel' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Responsável
              </button>
              <button
                onClick={() => setViewMode('time')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'time' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Time
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600">Status:</span>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white">
              <button
                onClick={() => setStatusFilter('Todos')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === 'Todos' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('Em andamento')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === 'Em andamento' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Em andamento
              </button>
              <button
                onClick={() => setStatusFilter('Concluída')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === 'Concluída' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Concluída
              </button>
            </div>
          </div>
        </div>

        {columns.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            {tasks.length === 0
              ? 'Nenhuma tarefa cadastrada.'
              : filteredTasks.length === 0
                ? `Nenhuma tarefa com status "${statusFilter}".`
                : `Nenhuma tarefa com ${viewMode === 'responsavel' ? 'os responsáveis' : 'os times'} configurados. Cadastre em Configurações ou atribua nas tarefas.`}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 min-h-[400px]">
            {columns.map(col => (
              <div
                key={col.name}
                className="flex-shrink-0 w-72 bg-slate-100/80 border border-slate-200 rounded-xl overflow-hidden flex flex-col"
              >
                <div className="p-4 border-b border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 truncate">{col.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{col.tasks.length} tarefa{col.tasks.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {(col.name === 'Sem time' || col.name === 'Sem responsável') && col.tasks.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      {col.name === 'Sem time' ? 'Nenhuma tarefa sem time' : 'Nenhuma tarefa sem responsável'}
                    </p>
                  ) : (
                  col.tasks.map(task => (
                    <div
                      key={task.id}
                      className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                    >
                      <Link href={`/tasks/${task.id}`} className="block">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${priorityClass(task.priority)}`}>
                          {task.priority}
                        </span>
                        <h4 className="font-semibold text-slate-900 mt-2 line-clamp-2">{task.title}</h4>
                        {task.createdAt && (
                          <p className="text-xs text-slate-400 mt-1">
                            {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(task.createdAt))}
                          </p>
                        )}
                        {viewMode === 'time' && task.assignees.length > 0 && (
                          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <User className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{task.assignees.join(', ')}</span>
                          </p>
                        )}
                      </Link>
                      {task.slackLink && (
                        <a
                          href={task.slackLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1 truncate"
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{task.slackLink}</span>
                        </a>
                      )}
                      <div className="flex gap-1 mt-3 pt-3 border-t border-slate-100">
                        {task.status !== 'Concluída' && (
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); updateTask(task.id, { status: 'Concluída' }); }}
                            title="Concluir"
                            className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); setCheckpointTaskId(task.id); }}
                          title="Adicionar Checkpoint"
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <CalendarPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                  ) }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <AddCheckpointModal
        taskId={checkpointTaskId ?? ''}
        open={checkpointTaskId !== null}
        onClose={() => setCheckpointTaskId(null)}
      />
    </div>
  );
}
