'use client';

import Header from '@/components/Header';
import { useTasks } from '@/context/TaskContext';
import { Calendar, MoreHorizontal, List, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Dashboard() {
  const { tasks, removeTask } = useTasks();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkpoints = tasks.filter(t => t.status === 'Em andamento').slice(0, 3);
  const allTasks = tasks;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f6f7f8]">
      <Header showNewTaskButton={true} />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard Principal</h2>
            <p className="text-slate-500 mt-1">Gerencie suas atividades e prazos de hoje com facilidade.</p>
          </div>
        </div>

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-blue-600 w-6 h-6" />
            <h3 className="text-xl font-bold text-slate-900">Checkpoints de Hoje</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {checkpoints.map(task => (
              <div key={task.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-xl hover:shadow-blue-600/5 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                    task.status === 'Concluída' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {task.status}
                  </span>
                  <div className="relative" ref={openMenuId === task.id ? menuRef : undefined}>
                    <button
                      title="Menu de opções"
                      onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {openMenuId === task.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            setDeleteTaskId(task.id);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir tarefa
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <h4 className="text-lg font-bold mb-1 text-slate-900">
                  <Link href={`/tarefas/${task.id}`} className="hover:text-blue-600 transition-colors">
                    {task.title}
                  </Link>
                </h4>
                <p className="text-slate-500 text-sm mb-4">{task.team}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {task.assignees.map((name, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{name}</span>
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Checkpoint</p>
                    {task.status === 'Concluída' ? (
                      <p className="text-sm font-bold text-slate-400 line-through">Concluído</p>
                    ) : (
                      <p className="text-sm font-bold text-blue-600">Pendente</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <List className="text-blue-600 w-6 h-6" />
              <h3 className="text-xl font-bold text-slate-900">Todas as Tarefas</h3>
            </div>
            <Link href="/tarefas" className="text-sm font-semibold text-blue-600 hover:underline">Ver todas</Link>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tarefa</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Time</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Responsáveis</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Criada em</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allTasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/tarefas/${task.id}`} className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{task.team}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {task.assignees.map((name, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{name}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(task.createdAt))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        task.status === 'Concluída' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        title="Excluir tarefa"
                        onClick={() => setDeleteTaskId(task.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <AlertDialog open={deleteTaskId !== null} onOpenChange={(open) => { if (!open) setDeleteTaskId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta tarefa? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTaskId) removeTask(deleteTaskId);
                setDeleteTaskId(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
