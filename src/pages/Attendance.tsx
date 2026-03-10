import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const Attendance: React.FC = () => {
  const { token } = useAuth();
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    const res = await fetch('/api/attendance/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setRecords(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Attendance Logs</h1>
          <p className="text-slate-500">Track your daily clock-in and clock-out times.</p>
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
