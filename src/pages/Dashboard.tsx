import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      <button className="text-slate-400 hover:text-slate-600">
        <MoreVertical size={20} />
      </button>
    </div>
    <div className="mt-4">
      <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
      <div className="flex items-baseline space-x-2 mt-1">
        <span className="text-2xl font-bold">{value}</span>
        {trend && (
          <span className={`text-xs font-medium flex items-center ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  </div>
);

const chartData = [
  { name: 'Mon', tasks: 4, hours: 8 },
  { name: 'Tue', tasks: 3, hours: 7.5 },
  { name: 'Wed', tasks: 5, hours: 9 },
  { name: 'Thu', tasks: 2, hours: 8 },
  { name: 'Fri', tasks: 6, hours: 8.5 },
  { name: 'Sat', tasks: 1, hours: 4 },
  { name: 'Sun', tasks: 0, hours: 0 },
];

export const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setTasks(data);
  };

  const checkIn = async () => {
    await fetch('/api/attendance/check-in', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    alert('Checked in successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h1>
          <p className="text-slate-500 dark:text-slate-400">Here's what's happening with your projects today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={checkIn}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Clock size={18} />
            <span>Check In</span>
          </button>
          <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tasks" value={tasks.length} icon={CheckCircle2} trend={12} color="bg-blue-500" />
        <StatCard title="Active Employees" value="124" icon={Users} trend={5} color="bg-indigo-500" />
        <StatCard title="Attendance Rate" value="98%" icon={Clock} trend={-2} color="bg-emerald-500" />
        <StatCard title="Pending Leaves" value="12" icon={Calendar} trend={8} color="bg-amber-500" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Productivity Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="tasks" stroke="#4f46e5" fillOpacity={1} fill="url(#colorTasks)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Work Hours</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="hours" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-semibold">My Recent Tasks</h3>
          <button className="text-indigo-600 text-sm font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Task Name</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.slice(0, 5).map((task) => (
                <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{task.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      task.priority === 'high' ? 'bg-rose-100 text-rose-600' : 
                      task.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center space-x-1.5 text-sm ${
                      task.status === 'completed' ? 'text-emerald-500' : 
                      task.status === 'in-progress' ? 'text-blue-500' : 'text-slate-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-emerald-500' : 
                        task.status === 'in-progress' ? 'bg-blue-500' : 'bg-slate-400'
                      }`} />
                      <span className="capitalize">{task.status.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(task.deadline).toLocaleDateString()}</td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">No tasks found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
