'use client';

import { useMemo, useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useTasks } from '@/context/TaskContext';
import { useNotes } from '@/context/NotesContext';
import { noteKey, type NoteOwner } from '@/context/NotesContext';
import NotesEditor from '@/components/NotesEditor';
import { Users, Building2, StickyNote } from 'lucide-react';

type TabItem = {
  owner: NoteOwner;
  label: string;
  icon: typeof Users;
};

export default function NotesPage() {
  const { teams, responsibles } = useTasks();
  const { getNote, setNote, isLoaded } = useNotes();

  const tabs: TabItem[] = useMemo(() => {
    const items: TabItem[] = [];
    responsibles.forEach(name => {
      items.push({ owner: { type: 'responsible', name }, label: name, icon: Users });
    });
    teams.forEach(name => {
      items.push({ owner: { type: 'team', name }, label: name, icon: Building2 });
    });
    return items;
  }, [responsibles, teams]);

  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    if (tabs.length === 0) return;
    const key = noteKey(tabs[0].owner);
    setActiveKey(prev => (prev && tabs.some(t => noteKey(t.owner) === prev)) ? prev : key);
  }, [tabs]);

  const activeTab = useMemo(() => tabs.find(t => noteKey(t.owner) === activeKey), [tabs, activeKey]);
  const currentOwner = activeTab?.owner ?? null;

  if (!isLoaded) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f6f7f8]">
        <Header title="Anotações" subtitle="Carregando..." />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f6f7f8]">
      <Header
        title="Anotações"
        subtitle="Anotações por responsável ou time"
      />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 max-w-4xl mx-auto w-full">
        {tabs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 text-amber-600 mb-4">
              <StickyNote className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Nenhum responsável ou time</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Cadastre responsáveis e times em <strong>Configurações</strong> para criar anotações. Cada responsável e cada time terá sua própria aba.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
              {tabs.map((tab) => {
                const key = noteKey(tab.owner);
                const isActive = key === activeKey;
                const Icon = tab.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveKey(key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-white border border-b-0 border-slate-200 text-blue-600 -mb-px'
                        : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {currentOwner && (
              <div key={noteKey(currentOwner)} className="animate-in fade-in duration-200">
                <NotesEditor
                  initialHtml={getNote(currentOwner)}
                  onSave={(html) => setNote(currentOwner, html)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
