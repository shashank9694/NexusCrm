import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Check, X, Clock } from 'lucide-react';

export const Leaves: React.FC = () => {
  const { token, user } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    type: 'vacation',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    const res = await fetch('/api/leaves', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setLeaves(data);
  };

  const handleUpdateStatus = async (leaveId: number, status: string) => {
    const res = await fetch(`/api/leaves/${leaveId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      fetchLeaves();
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/leaves', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(newLeave)
    });
    if (res.ok) {
      setShowModal(false);
      fetchLeaves();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Leave Management</h1>
          <p className="text-slate-500">Apply for leaves and track your balance.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Apply Leave</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-6 rounded-2xl text-white">
          <h4 className="text-indigo-100 text-sm font-medium">Annual Leave</h4>
          <div className="text-3xl font-bold mt-1">12 / 20</div>
          <p className="text-xs text-indigo-200 mt-2">Days remaining</p>
        </div>
        <div className="bg-emerald-600 p-6 rounded-2xl text-white">
          <h4 className="text-emerald-100 text-sm font-medium">Sick Leave</h4>
          <div className="text-3xl font-bold mt-1">8 / 10</div>
          <p className="text-xs text-emerald-200 mt-2">Days remaining</p>
        </div>
        <div className="bg-amber-600 p-6 rounded-2xl text-white">
          <h4 className="text-amber-100 text-sm font-medium">Personal Leave</h4>
          <div className="text-3xl font-bold mt-1">3 / 5</div>
          <p className="text-xs text-amber-200 mt-2">Days remaining</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-semibold">Leave History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td className="px-6 py-4 font-medium">{leave.user_name || user?.name}</td>
                  <td className="px-6 py-4 capitalize">{leave.type}</td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      leave.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 
                      leave.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user?.role !== 'employee' && leave.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleUpdateStatus(leave.id, 'approved')}
                          className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(leave.id, 'rejected')}
                          className="p-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-6">Apply for Leave</h3>
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Leave Type</label>
                <select 
                  value={newLeave.type}
                  onChange={(e) => setNewLeave({...newLeave, type: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="vacation">Vacation</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input 
                    required
                    type="date" 
                    value={newLeave.start_date}
                    onChange={(e) => setNewLeave({...newLeave, start_date: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input 
                    required
                    type="date" 
                    value={newLeave.end_date}
                    onChange={(e) => setNewLeave({...newLeave, end_date: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea 
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-24"
                />
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl">Apply</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
