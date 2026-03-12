'use client';

import { useState, useRef } from 'react';
import { useTasks } from '@/context/TaskContext';
import { Plus, X, Users, Building2, Download, Upload } from 'lucide-react';
import Header from '@/components/Header';

export default function Configuracoes() {
  const { teams, responsibles, addTeam, removeTeam, addResponsible, removeResponsible, exportData, importData } = useTasks();
  const [newTeam, setNewTeam] = useState('');
  const [newResponsible, setNewResponsible] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    setImportError(null);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string) as unknown;
        if (typeof raw !== 'object' || raw === null) throw new Error('Arquivo inválido');
        const data = raw as Record<string, unknown>;
        importData({
          tasks: Array.isArray(data.tasks) ? data.tasks as Parameters<typeof importData>[0]['tasks'] : [],
          teams: Array.isArray(data.teams) ? (data.teams as string[]) : [],
          responsibles: Array.isArray(data.responsibles) ? (data.responsibles as string[]) : [],
        });
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Erro ao ler o arquivo.');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    addTeam(newTeam);
    setNewTeam('');
  };

  const handleAddResponsible = (e: React.FormEvent) => {
    e.preventDefault();
    addResponsible(newResponsible);
    setNewResponsible('');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f6f7f8]">
      <Header title="Configurações" subtitle="Gerencie times e responsáveis do sistema" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Times */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-blue-600/10 p-2 rounded-lg">
                <Building2 className="text-blue-600 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Times</h3>
                <p className="text-sm text-slate-500">{teams.length} cadastrado{teams.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <form onSubmit={handleAddTeam} className="p-4 border-b border-slate-100 flex gap-2">
              <input
                value={newTeam}
                onChange={e => setNewTeam(e.target.value)}
                type="text"
                placeholder="Nome do time..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm transition-all"
              />
              <button
                type="submit"
                disabled={!newTeam.trim()}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </form>

            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
              {teams.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">Nenhum time cadastrado</p>
              )}
              {teams.map(team => (
                <div key={team} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg group">
                  <span className="text-sm font-medium text-slate-700">{team}</span>
                  <button
                    title="Remover time"
                    onClick={() => removeTeam(team)}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Responsáveis */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Users className="text-emerald-600 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Responsáveis</h3>
                <p className="text-sm text-slate-500">{responsibles.length} cadastrado{responsibles.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <form onSubmit={handleAddResponsible} className="p-4 border-b border-slate-100 flex gap-2">
              <input
                value={newResponsible}
                onChange={e => setNewResponsible(e.target.value)}
                type="text"
                placeholder="Nome do responsável..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm transition-all"
              />
              <button
                type="submit"
                disabled={!newResponsible.trim()}
                className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </form>

            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
              {responsibles.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">Nenhum responsável cadastrado</p>
              )}
              {responsibles.map(name => (
                <div key={name} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg group">
                  <span className="text-sm font-medium text-slate-700">{name}</span>
                  <button
                    title="Remover responsável"
                    onClick={() => removeResponsible(name)}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Exportar / Importar */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Download className="text-amber-600 w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Dados do sistema</h3>
              <p className="text-sm text-slate-500">Exportar ou importar tarefas, times e responsáveis em JSON</p>
            </div>
          </div>
          <div className="p-6 flex flex-wrap gap-4 items-center">
            <button
              type="button"
              onClick={exportData}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar dados (.json)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImport}
              className="hidden"
              aria-label="Selecionar arquivo JSON para importar"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Importar dados (.json)
            </button>
            {importError && (
              <p className="text-sm text-red-600 flex-1">{importError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
