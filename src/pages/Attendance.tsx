import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const Attendance: React.FC = () => {
  const { token, user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [timer, setTimer] = useState('00:00:00');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState<any>(null);

  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const record = records.find(r => r.date.startsWith(today));
    setTodayRecord(record);
    setIsCheckedIn(!!(record && record.check_in && !record.check_out));
  }, [records]);

  const fetchAttendance = async () => {
    const res = await fetch('/api/attendance/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setRecords(data);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Attendance Logs</h1>
          <p className="text-slate-500">Track your daily clock-in and clock-out times.</p>
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

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Check In</th>
              <th className="px-6 py-4 font-medium">Check Out</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 font-medium">{new Date(record.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm">{record.check_in ? new Date(record.check_in).toLocaleTimeString() : '-'}</td>
                <td className="px-6 py-4 text-sm">{record.check_out ? new Date(record.check_out).toLocaleTimeString() : '-'}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-600">
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-500">No attendance records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
