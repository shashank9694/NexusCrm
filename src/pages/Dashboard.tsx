import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  CheckSquare, 
  Clock, 
  Calendar,
  Briefcase,
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
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [timer, setTimer] = useState('00:00:00');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState<any>(null);

  useEffect(() => {
    fetchDashboardStats();
    fetchTasks();
    fetchAttendance();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const record = attendance.find(r => r.date.startsWith(today));
    setTodayRecord(record);
    setIsCheckedIn(!!(record && record.check_in && !record.check_out));
  }, [attendance]);

  const fetchDashboardStats = async () => {
    const res = await fetch('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setDashboardData(data);
  };

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setTasks(data);
  };

  const fetchAttendance = async () => {
    const res = await fetch('/api/attendance/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setAttendance(data);
  };

  const updateTimer = () => {
    if (isCheckedIn && todayRecord?.check_in) {
      const start = new Date(todayRecord.check_in).getTime();
      const now = new Date().getTime();
      const diff = now - start;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimer(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    } else if (todayRecord?.check_in && todayRecord?.check_out) {
      const start = new Date(todayRecord.check_in).getTime();
      const end = new Date(todayRecord.check_out).getTime();
      const diff = end - start;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimer(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    } else {
      setTimer('00:00:00');
    }
  };

  const handleAttendance = async () => {
    const endpoint = isCheckedIn ? '/api/attendance/check-out' : '/api/attendance/check-in';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      fetchAttendance();
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to update attendance');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h1>
          <p className="text-slate-500 dark:text-slate-400">Shift: {user?.shift || '09:00 AM - 06:00 PM'}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`px-4 py-2 rounded-xl border flex items-center space-x-2 ${
            isCheckedIn ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
          }`}>
            <Clock size={18} className={isCheckedIn ? 'text-emerald-600' : 'text-slate-400'} />
            <span className={`font-mono font-bold text-lg ${isCheckedIn ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-300'}`}>{timer}</span>
          </div>
          <button 
            onClick={handleAttendance}
            disabled={!!(todayRecord?.check_in && todayRecord?.check_out)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
              isCheckedIn 
                ? 'bg-rose-600 text-white hover:bg-rose-700' 
                : todayRecord?.check_in && todayRecord?.check_out
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <Clock size={18} />
            <span>{isCheckedIn ? 'Check Out' : todayRecord?.check_in && todayRecord?.check_out ? 'Finished' : 'Check In'}</span>
          </button>
        </div>
      </div>

      {/* Leave Balances */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Your Leave Balances</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">Sick Leave</p>
            <p className="text-2xl font-bold">{dashboardData?.leaveBalance?.sick || 0} Days</p>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase">Vacation</p>
            <p className="text-2xl font-bold">{dashboardData?.leaveBalance?.vacation || 0} Days</p>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase">Personal</p>
            <p className="text-2xl font-bold">{dashboardData?.leaveBalance?.personal || 0} Days</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tasks" value={dashboardData?.totalTasks || 0} icon={CheckSquare} trend={dashboardData?.trends?.tasks} color="bg-blue-500" />
        <StatCard title="Active Projects" value={dashboardData?.activeProjects || 0} icon={Briefcase} trend={dashboardData?.trends?.projects} color="bg-indigo-500" />
        <StatCard title="Attendance Rate" value={`${dashboardData?.attendanceRate || 0}%`} icon={Clock} trend={dashboardData?.trends?.attendance} color="bg-emerald-500" />
        <StatCard title="Pending Leaves" value={dashboardData?.pendingLeaves || 0} icon={Calendar} trend={dashboardData?.trends?.leaves} color="bg-amber-500" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Productivity Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData?.chartData || []}>
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
              <BarChart data={dashboardData?.chartData || []}>
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
