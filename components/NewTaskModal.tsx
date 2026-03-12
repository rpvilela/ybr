'use client';

import { useState } from 'react';
import { useTasks } from '@/context/TaskContext';
import type { TaskPriority } from '@/context/TaskContext';
import { X, Plus, Link as LinkIcon, ChevronDown, Check } from 'lucide-react';

const PRIORITY_OPTIONS: TaskPriority[] = ['Urgente', 'Alta', 'Normal', 'Baixa'];

export default function NewTaskModal() {
  const { isNewTaskModalOpen, setIsNewTaskModalOpen, addTask, teams, responsibles } = useTasks();
  const [title, setTitle] = useState('');
  const [team, setTeam] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Normal');
  const [description, setDescription] = useState('');
  const [slackLink, setSlackLink] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  if (!isNewTaskModalOpen) return null;

  const toggleAssignee = (name: string) => {
    setAssignees(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
      title,
      team,
      description,
      slackLink,
      assignees,
      status: 'Em andamento',
      priority,
    });
    setIsNewTaskModalOpen(false);
    setTitle('');
    setTeam('');
    setPriority('Normal');
    setDescription('');
    setSlackLink('');
    setAssignees([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/10 p-2 rounded-lg">
              <Plus className="text-blue-600 w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Nova Tarefa</h2>
          </div>
          <button onClick={() => setIsNewTaskModalOpen(false)} title="Fechar" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Título da Tarefa</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              type="text"
              placeholder="Ex: Finalizar protótipo de alta fidelidade"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Time Responsável</label>
              <div className="relative">
                <select
                  title="Time Responsável"
                  value={team}
                  onChange={e => setTeam(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Selecione um time</option>
                  {teams.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {teams.length === 0 && (
                <p className="text-xs text-amber-600">Cadastre times em Configurações</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Prioridade</label>
              <div className="relative">
                <select
                  title="Prioridade"
                  value={priority}
                  onChange={e => setPriority(e.target.value as TaskPriority)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all appearance-none cursor-pointer"
                >
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Responsáveis</label>
            <div className="relative">
              <button
                title="Responsáveis"
                type="button"
                onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-left flex items-center justify-between"
              >
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {assignees.length === 0 ? (
                    <span className="text-slate-400 text-sm">Selecione os responsáveis</span>
                  ) : (
                    assignees.map(name => (
                      <span key={name} className="inline-flex items-center gap-1 bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded text-xs font-semibold">
                        {name}
                        <button
                          type="button"
                          title="Remover responsável"
                          onClick={e => { e.stopPropagation(); toggleAssignee(name); }}
                          className="hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${showAssigneeDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showAssigneeDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {responsibles.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-amber-600">Cadastre responsáveis em Configurações</p>
                  ) : (
                    responsibles.map(name => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleAssignee(name)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          assignees.includes(name) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                        }`}>
                          {assignees.includes(name) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm text-slate-700">{name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Descrição</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Descreva os detalhes, requisitos e objetivos desta tarefa..."
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Link da Thread no Slack</label>
            <div className="relative flex items-center">
              <LinkIcon className="absolute left-4 text-slate-400 w-5 h-5" />
              <input
                value={slackLink}
                onChange={e => setSlackLink(e.target.value)}
                type="url"
                placeholder="https://app.slack.com/archives/..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewTaskModalOpen(false)}
              className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98]"
            >
              Criar Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
