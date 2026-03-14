'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type NoteOwnerType = 'responsible' | 'team';

export type NoteOwner = {
  type: NoteOwnerType;
  name: string;
};

/** Chave única por responsável ou time: type:name */
export function noteKey(owner: NoteOwner): string {
  return `${owner.type}:${owner.name}`;
}

export type NotesContextType = {
  /** Conteúdo em HTML (serializado pelo Lexical) por chave owner */
  notesByOwner: Record<string, string>;
  getNote: (owner: NoteOwner) => string;
  setNote: (owner: NoteOwner, html: string) => void;
  /** Acrescenta um trecho HTML ao final da anotação (atômico, evita race com getNote+setNote). */
  appendToNote: (owner: NoteOwner, htmlSnippet: string) => void;
  /** Remove a anotação do responsável ou time (ex.: ao remover o responsável/time em Configurações). */
  removeNote: (owner: NoteOwner) => void;
  isLoaded: boolean;
};

const NotesContext = createContext<NotesContextType | null>(null);

const STORAGE_KEY = 'taskflow_notes';

export const NotesProvider = ({ children }: { children: React.ReactNode }) => {
  const [notesByOwner, setNotesByOwner] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string>;
        setNotesByOwner(typeof parsed === 'object' && parsed !== null ? parsed : {});
      }
      setIsLoaded(true);
    } catch {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notesByOwner));
  }, [notesByOwner, isLoaded]);

  const getNote = (owner: NoteOwner) => notesByOwner[noteKey(owner)] ?? '';

  const setNote = (owner: NoteOwner, html: string) => {
    const key = noteKey(owner);
    setNotesByOwner(prev => ({ ...prev, [key]: html }));
  };

  const appendToNote = (owner: NoteOwner, htmlSnippet: string) => {
    const key = noteKey(owner);
    setNotesByOwner(prev => {
      const current = (prev[key] ?? '').trim();
      const newHtml = current ? `${current}${htmlSnippet}` : htmlSnippet;
      return { ...prev, [key]: newHtml };
    });
  };

  const removeNote = (owner: NoteOwner) => {
    const key = noteKey(owner);
    setNotesByOwner(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <NotesContext.Provider value={{ notesByOwner, getNote, setNote, appendToNote, removeNote, isLoaded }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
};
