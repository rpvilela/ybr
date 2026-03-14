'use client';

import { useCallback, useEffect, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, EditorState, LexicalEditor } from 'lexical';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { Bold, Italic, Underline, ListOrdered, List } from 'lucide-react';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';

const theme = {
  paragraph: 'mb-2 last:mb-0',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
  list: {
    ul: 'list-disc list-inside ml-4',
    ol: 'list-decimal list-inside ml-4',
    listitem: 'mb-1',
  },
};

function onError(error: Error) {
  console.error('Lexical:', error);
}

type InitialContentPluginProps = { initialHtml: string };
function InitialContentPlugin({ initialHtml }: InitialContentPluginProps) {
  const [editor] = useLexicalComposerContext();
  const loadedRef = useRef(false);
  useEffect(() => {
    if (!initialHtml.trim()) return;
    if (loadedRef.current) return;
    loadedRef.current = true;
    editor.update(() => {
      const root = $getRoot();
      const parser = new DOMParser();
      const dom = parser.parseFromString(initialHtml, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      root.clear();
      root.append(...nodes);
    });
  }, [editor, initialHtml]);
  return null;
}

type ToolbarPluginProps = {};
function ToolbarPlugin(_props: ToolbarPluginProps) {
  const [editor] = useLexicalComposerContext();
  const applyFormat = useCallback((format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  }, [editor]);
  const applyList = useCallback((listType: 'ul' | 'ol') => {
    editor.dispatchCommand(listType === 'ul' ? INSERT_UNORDERED_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  return (
    <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 rounded-t-lg">
      <button
        type="button"
        title="Negrito"
        onClick={() => applyFormat('bold')}
        className="p-2 rounded hover:bg-slate-200 text-slate-700"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Itálico"
        onClick={() => applyFormat('italic')}
        className="p-2 rounded hover:bg-slate-200 text-slate-700"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Sublinhado"
        onClick={() => applyFormat('underline')}
        className="p-2 rounded hover:bg-slate-200 text-slate-700"
      >
        <Underline className="w-4 h-4" />
      </button>
      <span className="w-px h-5 bg-slate-300 mx-1" />
      <button
        type="button"
        title="Lista com marcadores"
        onClick={() => applyList('ul')}
        className="p-2 rounded hover:bg-slate-200 text-slate-700"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Lista numerada"
        onClick={() => applyList('ol')}
        className="p-2 rounded hover:bg-slate-200 text-slate-700"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
    </div>
  );
}

type OnChangePluginWrapperProps = { onSave: (html: string) => void };
function OnChangePluginWrapper({ onSave }: OnChangePluginWrapperProps) {
  const handleChange = useCallback((editorState: EditorState, editor: LexicalEditor) => {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor, null);
      onSave(html);
    });
  }, [onSave]);
  return <OnChangePlugin onChange={handleChange} />;
}

type NotesEditorProps = {
  initialHtml: string;
  onSave: (html: string) => void;
};

export default function NotesEditor({ initialHtml, onSave }: NotesEditorProps) {
  const initialConfig = useCallback(() => ({
    namespace: 'NotesEditor',
    theme,
    onError,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
  }), []);

  return (
    <LexicalComposer initialConfig={initialConfig()}>
      <ToolbarPlugin />
      <div className="relative border border-t-0 border-slate-200 rounded-b-lg bg-white min-h-[200px]">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="outline-none min-h-[200px] p-4 text-slate-800 prose prose-slate max-w-none"
              aria-placeholder="Digite sua anotação..."
              placeholder={
                <div className="absolute top-4 left-4 text-slate-400 pointer-events-none">
                  Digite sua anotação...
                </div>
              }
            />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <InitialContentPlugin initialHtml={initialHtml} />
        <OnChangePluginWrapper onSave={onSave} />
      </div>
    </LexicalComposer>
  );
}
