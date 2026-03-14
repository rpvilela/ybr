'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, BarChart2, Columns, Settings, Brain, StickyNote } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Tarefas do Dia', href: '/tasks', icon: Calendar },
    { name: 'Board', href: '/board', icon: Columns },
    { name: 'Anotações', href: '/notes', icon: StickyNote },
    { name: 'Relatórios', href: '/reports', icon: BarChart2 },
  ];

  const isConfigActive = pathname === '/settings';

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 hidden lg:flex lg:flex-col justify-between p-4 shrink-0 overflow-y-auto">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-blue-600/10 rounded-full p-2 flex items-center justify-center">
            <Brain className="text-blue-600 w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-slate-900 text-base font-bold leading-none">YBR</h1>
            <p className="text-slate-500 text-xs font-medium">You Better Remind</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-600'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-8">
        <Link
          href="/settings"
          className={`flex items-center justify-center gap-2 rounded-lg h-10 px-4 text-sm font-bold transition-all ${
            isConfigActive
              ? 'bg-blue-700 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Configurações</span>
        </Link>
      </div>
    </aside>
  );
}
