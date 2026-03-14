'use client';

import { useState, useEffect } from 'react';
import { useTasks } from '@/context/TaskContext';
import { useNotes } from '@/context/NotesContext';
import { X } from 'lucide-react';

function formatDateToDisplay(isoDate: string): string {
  const [y, m, d] = isoDate.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

type AddCheckpointModalProps = {
  taskId: string;
  open: boolean;
  onClose: () => void;
};

export default function AddCheckpointModal({ taskId, open, onClose }: AddCheckpointModalProps) {
  const { addCheckpoint, tasks } = useTasks();
  const { appendToNote } = useNotes();
  const [comment, setComment] = useState('');
  const [insertAsNote, setInsertAsNote] = useState(false);

  useEffect(() => {
    if (open) {
      setComment('');
      setInsertAsNote(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    addCheckpoint(taskId, { date: now, comment });

    if (insertAsNote && comment.trim()) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const dateFormatted = formatDateToDisplay(now);
        const line = `${dateFormatted} - ${escapeHtml(comment.trim())}`;
        const snippet = `<p>${line}</p>`;

        const teamName = task.team?.trim();
        if (teamName) {
          appendToNote({ type: 'team', name: teamName }, snippet);
        }
        (task.assignees || []).forEach((name: string) => {
          const responsibleName = name?.trim();
          if (responsibleName) {
            appendToNote({ type: 'responsible', name: responsibleName }, snippet);
          }
        });
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold tracking-tight">Adicionar Checkpoint</h2>
          <button onClick={onClose} title="Fechar" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="checkpoint-comment" className="text-sm font-semibold text-slate-700">Comentário</label>
            <textarea
              id="checkpoint-comment"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              placeholder="Comentário do checkpoint..."
              title="Comentário do checkpoint"
              aria-label="Comentário do checkpoint"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all resize-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="checkpoint-insert-as-note"
              type="checkbox"
              checked={insertAsNote}
              onChange={e => setInsertAsNote(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              aria-label="Inserir como anotação"
            />
            <label htmlFor="checkpoint-insert-as-note" className="text-sm font-medium text-slate-700 cursor-pointer">
              Inserir como anotação
            </label>
          </div>
          <p className="text-xs text-slate-500">
            Quando marcado, a data e o texto serão adicionados como anotação para o time e os responsáveis da tarefa (formato: data - texto).
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
