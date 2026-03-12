'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import { useTasks } from '@/context/TaskContext';
import { Calendar, ChevronDown, CheckCircle2, Edit, X, Check, Trash2, CirclePlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import AddCheckpointModal from '@/components/AddCheckpointModal';

function isSameDay(dateStr: string, target: Date): boolean {
  const d = new Date(dateStr);
  return d.getFullYear() === target.getFullYear()
    && d.getMonth() === target.getMonth()
    && d.getDate() === target.getDate();
}

function formatDateLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const dayLabel = target.getTime() === today.getTime() ? 'Hoje' :
    target.getTime() === today.getTime() + 86400000 ? 'Amanhã' : null;

  const formatted = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(date);
  return dayLabel ? `${dayLabel}, ${formatted}` : formatted;
}

export default function Tarefas() {
  const router = useRouter();
  const { tasks, teams, responsibles, removeTask, updateTask } = useTasks();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedResponsibles, setSelectedResponsibles] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [showResponsibleDropdown, setShowResponsibleDropdown] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [checkpointTaskId, setCheckpointTaskId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = tasks;
    if (selectedDate !== null) {
      result = result.filter(t => isSameDay(t.createdAt, selectedDate));
    }
    if (selectedResponsibles.length > 0) {
      result = result.filter(t => t.assignees.some(a => selectedResponsibles.includes(a)));
    }
    if (selectedTeams.length > 0) {
      result = result.filter(t => selectedTeams.includes(t.team));
    }
    return result;
  }, [tasks, selectedDate, selectedResponsibles, selectedTeams]);

  const pendingCount = filtered.filter(t => t.status !== 'Concluída').length;

  const toggleResponsible = (name: string) => {
    setSelectedResponsibles(prev =>
      prev.includes(name) ? prev.filter(r => r !== name) : [...prev, name]
    );
  };

  const toggleTeam = (name: string) => {
    setSelectedTeams(prev =>
      prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]
    );
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split('-').map(Number);
      setSelectedDate(new Date(year, month - 1, day));
      setShowDatePicker(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f6f7f8]">
      <Header title="Checkpoints de Hoje" showNewTaskButton={true} />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 max-w-5xl mx-auto w-full">
        <div className="mb-8 flex flex-col gap-4">
          {/* Filtro de data */}
          <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  {selectedDate ? 'Filtro Ativo' : 'Sem filtro de data'}
                </p>
                <h3 className="text-lg font-bold">
                  {selectedDate ? formatDateLabel(selectedDate) : 'Todas as datas'}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showDatePicker ? (
                <input
                  title="Data"
                  type="date"
                  autoFocus
                  value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                  onChange={handleDateChange}
                  onBlur={() => setShowDatePicker(false)}
                  className="px-3 py-1 rounded-lg border border-blue-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              ) : (
                <div className="flex items-center gap-2">
                  {selectedDate && (
                    <button
                      title="Limpar data"
                      onClick={() => setSelectedDate(null)}
                      className="text-slate-500 hover:text-red-500 text-sm font-medium px-2 py-1 flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Limpar
                    </button>
                  )}
                  <button
                    onClick={() => setShowDatePicker(true)}
                    className="text-blue-600 hover:underline text-sm font-medium px-3 py-1"
                  >
                    {selectedDate ? 'Alterar Data' : 'Filtrar por Data'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Filtros de responsável e time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Responsável */}
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Responsável</label>
              <div
                title="Responsável"
                onClick={() => setShowResponsibleDropdown(!showResponsibleDropdown)}
                className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[44px] cursor-pointer"
              >
                {selectedResponsibles.length === 0 ? (
                  <span className="text-sm text-slate-400">Todos</span>
                ) : (
                  selectedResponsibles.map(name => (
                    <span key={name} className="inline-flex items-center gap-1 bg-blue-600/10 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-semibold">
                      {name}
                      <button title="Remover responsável" onClick={e => { e.stopPropagation(); toggleResponsible(name); }} className="hover:text-blue-800">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
                <button title="Abrir lista de responsáveis" className="text-slate-400 hover:text-blue-600 ml-auto">
                  <ChevronDown className={`w-5 h-5 transition-transform ${showResponsibleDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {showResponsibleDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {responsibles.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-slate-400">Cadastre responsáveis em Configurações</p>
                  ) : (
                    responsibles.map(name => (
                      <button
                        key={name}
                        title={`Selecionar ${name}`}
                        onClick={() => toggleResponsible(name)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          selectedResponsibles.includes(name) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                        }`}>
                          {selectedResponsibles.includes(name) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm text-slate-700">{name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Time */}
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Time</label>
              <div
                title="Time"
                onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[44px] cursor-pointer"
              >
                {selectedTeams.length === 0 ? (
                  <span className="text-sm text-slate-400">Todos</span>
                ) : (
                  selectedTeams.map(name => (
                    <span key={name} className="inline-flex items-center gap-1 bg-blue-600/10 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-semibold">
                      {name}
                      <button title="Remover time" onClick={e => { e.stopPropagation(); toggleTeam(name); }} className="hover:text-blue-800">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
                <button title="Abrir lista de times" className="text-slate-400 hover:text-blue-600 ml-auto">
                  <ChevronDown className={`w-5 h-5 transition-transform ${showTeamDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {showTeamDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {teams.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-slate-400">Cadastre times em Configurações</p>
                  ) : (
                    teams.map(name => (
                      <button
                        key={name}
                        title={`Selecionar ${name}`}
                        onClick={() => toggleTeam(name)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          selectedTeams.includes(name) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                        }`}>
                          {selectedTeams.includes(name) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm text-slate-700">{name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Tarefas</h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-200 text-xs font-bold uppercase tracking-widest text-slate-600">
              {pendingCount} Pendente{pendingCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-sm">Nenhum checkpoint encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(task => (
              <div key={task.id} className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      task.status === 'Concluída' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold mb-1">
                    <Link href={`/tasks/${task.id}`} className="hover:text-blue-600 transition-colors">
                      {task.title}
                    </Link>
                  </h4>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed flex-1">{task.description}</p>
                  <div className="flex gap-2 mt-auto">
                    <button
                      title="Concluir"
                      onClick={() => updateTask(task.id, { status: 'Concluída' })}
                      className="flex-1 bg-blue-600 text-white h-10 rounded-lg font-semibold text-sm flex items-center justify-center hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Concluir
                    </button>
                    <button
                      title="Editar"
                      onClick={() => router.push(`/tasks/${task.id}`)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      title="Adicionar checkpoint"
                      onClick={() => setCheckpointTaskId(task.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <CirclePlus className="w-5 h-5" />
                    </button>
                    <button
                      title="Excluir"
                      onClick={() => setDeleteTaskId(task.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
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
