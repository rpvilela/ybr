'use client';

import { useMemo } from 'react';
import { useTasks } from '@/context/TaskContext';
import { CalendarCheck, CheckCircle, ClipboardList } from 'lucide-react';
import Header from '@/components/Header';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  'Em andamento': '#3b82f6',
  'Concluída': '#10b981',
};

export default function Relatorios() {
  const { tasks } = useTasks();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Concluída').length;

  const checkpointsToday = useMemo(() => {
    const today = new Date();
    const todayY = today.getFullYear();
    const todayM = today.getMonth();
    const todayD = today.getDate();
    return tasks.reduce((acc, t) => {
      return acc + t.checkpoints.filter(cp => {
        const cpDate = new Date(cp.date);
        return cpDate.getFullYear() === todayY && cpDate.getMonth() === todayM && cpDate.getDate() === todayD;
      }).length;
    }, 0);
  }, [tasks]);

  const pieData = useMemo(() => {
    const statusCount: Record<string, number> = {};
    tasks.forEach(t => {
      statusCount[t.status] = (statusCount[t.status] || 0) + 1;
    });
    return Object.entries(statusCount).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || '#94a3b8',
    }));
  }, [tasks]);

  const teamData = useMemo(() => {
    const teamCount: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.team) teamCount[t.team] = (teamCount[t.team] || 0) + 1;
    });
    return Object.entries(teamCount)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }));
  }, [tasks]);

  const maxTeamCount = teamData.length > 0 ? teamData[0].count : 1;

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [tasks]);

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'Concluída': return 'bg-emerald-100 text-emerald-600';
      case 'Em andamento': return 'bg-blue-600/10 text-blue-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f6f7f8]">
      <Header title="Relatórios" showNewTaskButton={true} />

      <div className="flex-1 overflow-y-auto p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Cards de métricas */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-500 font-medium">Total de Tarefas</p>
              <span className="p-2 bg-blue-600/10 text-blue-600 rounded-lg"><ClipboardList className="w-5 h-5" /></span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">{totalTasks}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-500 font-medium">Concluídas</p>
              <span className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle className="w-5 h-5" /></span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">{completedTasks}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-500 font-medium">Checkpoints realizados no dia</p>
              <span className="p-2 bg-violet-100 text-violet-600 rounded-lg"><CalendarCheck className="w-5 h-5" /></span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">{checkpointsToday}</h3>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tarefas por Status - Gráfico de pizza */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-6">Tarefas por Status</h4>
            {totalTasks === 0 ? (
              <p className="text-sm text-slate-400 text-center py-12">Nenhuma tarefa cadastrada</p>
            ) : (
              <div className="flex items-center gap-8">
                <div className="relative w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-900">{totalTasks}</span>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Total</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {pieData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-slate-600">{item.name}</span>
                      <span className="text-sm font-bold ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tarefas por Time */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-6">Tarefas por Time</h4>
            {teamData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-12">Nenhuma tarefa cadastrada</p>
            ) : (
              <div className="space-y-6">
                {teamData.map(({ name, count }) => (
                  <div key={name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{name}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(count / maxTeamCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabela Últimos Checkpoints */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
          <div className="p-6 border-b border-slate-200">
            <h4 className="font-bold text-slate-900">Últimos Checkpoints</h4>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">Nenhuma tarefa cadastrada</p>
          ) : (
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
                <tr>
                  <th className="px-6 py-4">Tarefa</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Responsáveis</th>
                  <th className="px-6 py-4">Data</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {recentTasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{task.title}</td>
                    <td className="px-6 py-4">{task.team}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadgeClass(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {task.assignees.map((name, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{name}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(task.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
