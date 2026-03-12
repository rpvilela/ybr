import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TaskProvider } from '@/context/TaskContext';
import Sidebar from '@/components/Sidebar';
import NewTaskModal from '@/components/NewTaskModal';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'YBR',
  description: 'Gerenciamento de tarefas e projetos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className={inter.variable}>
      <body className="bg-[#f6f7f8] text-slate-900 font-sans h-screen flex overflow-hidden" suppressHydrationWarning>
        <TaskProvider>
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
            {children}
          </main>
          <NewTaskModal />
        </TaskProvider>
      </body>
    </html>
  );
}
