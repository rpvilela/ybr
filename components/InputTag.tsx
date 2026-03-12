'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

type InputTagProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
};

export default function InputTag({ value, onChange, placeholder = 'Digite e pressione Enter', className }: InputTagProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    const isDuplicate = value.some(t => t.toLowerCase() === tag.toLowerCase());
    if (isDuplicate) return;
    onChange([...value, tag]);
    setInput('');
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const handleBlur = () => {
    if (input.trim()) {
      addTag(input);
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-2 p-2 min-h-[50px] rounded-lg border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-600/20 focus-within:border-blue-600 transition-all cursor-text ${className ?? ''}`}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, idx) => (
        <span
          key={idx}
          className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-medium"
        >
          {tag}
          <button
            type="button"
            title={`Remover ${tag}`}
            onClick={(e) => { e.stopPropagation(); removeTag(idx); }}
            className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
      />
    </div>
  );
}
