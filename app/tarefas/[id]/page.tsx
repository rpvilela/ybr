'use client';

import { useTasks } from '@/context/TaskContext';
import { useParams, useRouter } from 'next/navigation';
import { MoreVertical, CheckCircle, Link as LinkIcon, FileText, MessageSquare, Send, ArrowLeft, Trash2, CirclePlus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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

export default function TarefaDetalhes() {
  const { id } = useParams();
  const router = useRouter();
  const { tasks, users, addComment, removeTask, updateTask, currentUser } = useTasks();
  const [newComment, setNewComment] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCheckpointModal, setShowCheckpointModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const task = tasks.find(t => t.id === id);

  if (!task) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f6f7f8]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Tarefa não encontrada</h2>
          <button onClick={() => router.back()} className="text-blue-600 hover:underline">Voltar</button>
        </div>
      </div>
    );
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment(task.id, {
      userId: currentUser.id,
      text: newComment,
    });
    setNewComment('');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f6f7f8]">
      <div className="px-4 md:px-12 lg:px-20 flex flex-1 justify-center py-5 overflow-y-auto">
        <div className="flex flex-col max-w-[960px] flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-white rounded-t-xl">
            <div className="flex items-center gap-4">
              <button title="Voltar" onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-slate-900 text-lg font-bold">Detalhes da Tarefa</h2>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                title="Menu de opções"
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center justify-center rounded-lg h-10 bg-slate-100 text-slate-700 px-3 hover:bg-slate-200 transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteDialog(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir tarefa
                  </button>
                </div>
              )}
            </div>
          </header>

          <div className="bg-white shadow-sm border-x border-slate-200 p-6">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
              <div className="flex flex-col gap-2 max-w-2xl">
                <h1 className="text-slate-900 text-3xl font-bold leading-tight tracking-tight">{task.title}</h1>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    task.status === 'Concluída' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {task.status}
                  </span>
                  <span className="text-slate-500 text-sm font-medium">• {task.team}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => updateTask(task.id, { status: 'Concluída' })}
                  className="flex flex-1 items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-sm"
                >
                  <CheckCircle className="w-5 h-5" />
                  Marcar como Concluída
                </button>
                <button
                  onClick={() => setShowCheckpointModal(true)}
                  className="flex flex-1 items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-900 border border-slate-200 rounded-lg font-bold hover:bg-slate-200 transition-all"
                >
                  <CirclePlus className="w-5 h-5" />
                  Adicionar checkpoint
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-12 border-y border-slate-100 py-6">
              <div className="flex flex-col py-3 border-b border-slate-50">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Time</span>
                <span className="text-slate-900 font-medium">{task.team}</span>
              </div>
              <div className="flex flex-col py-3 border-b border-slate-50">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Responsáveis</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {task.assignees.map((name, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-medium">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col py-3 border-b border-slate-50 md:border-b-0">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Criada em</span>
                <span className="text-slate-900 font-medium">
                  {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(task.createdAt))}
                </span>
              </div>
              <div className="flex flex-col py-3">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Link Slack</span>
                {task.slackLink ? (
                  <a href={task.slackLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-medium">
                    <LinkIcon className="w-4 h-4" />
                    {task.slackLink}
                  </a>
                ) : (
                  <span className="text-slate-400 text-sm">Nenhum link adicionado</span>
                )}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-slate-900 text-lg font-bold mb-3 flex items-center gap-2">
                <FileText className="text-slate-400 w-5 h-5" />
                Descrição
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-slate-200">
              <h3 className="text-slate-900 text-lg font-bold mb-4 flex items-center gap-2">
                Checkpoints
              </h3>
              {task.checkpoints.length === 0 ? (
                <p className="text-slate-400 text-sm">Nenhum checkpoint registrado.</p>
              ) : (
                <ul className="space-y-4">
                  {[...task.checkpoints]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(cp => (
                      <li key={cp.id} className="flex flex-col gap-1 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-sm font-semibold text-slate-700">
                          {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(cp.date))}
                        </span>
                        {cp.comment && <p className="text-sm text-slate-600">{cp.comment}</p>}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div className="mt-10 pt-10 border-t border-slate-200">
              <h3 className="text-slate-900 text-lg font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="text-slate-400 w-5 h-5" />
                Comentários
              </h3>
              <div className="space-y-6 mb-8">
                {task.comments.map(comment => {
                  const user = users.find(u => u.id === comment.userId);
                  return (
                    <div key={comment.id} className="flex gap-4">
                      <div className={`w-10 h-10 rounded-full ${user?.color || 'bg-slate-200 text-slate-600'} flex-shrink-0 flex items-center justify-center font-bold`}>
                        {user?.initials}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{user?.name}</span>
                          <span className="text-slate-400 text-xs">
                            {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(comment.createdAt))}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-6">
                <div className={`w-10 h-10 rounded-full ${currentUser.color} flex-shrink-0 flex items-center justify-center font-bold`}>
                  {currentUser.initials}
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none placeholder-slate-400 outline-none"
                    placeholder="Escreva um comentário..."
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddComment}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                    >
                      Enviar
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="h-6 bg-white rounded-b-xl border-x border-b border-slate-200 mb-10"></div>
        </div>
      </div>

      <AddCheckpointModal
        taskId={task.id}
        open={showCheckpointModal}
        onClose={() => setShowCheckpointModal(false)}
      />
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
                removeTask(task.id);
                router.push('/tarefas');
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
