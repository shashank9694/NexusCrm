import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, CheckSquare, Clock, AlertTriangle } from 'lucide-react';

export const Tasks: React.FC = () => {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    deadline: ''
  });
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetchTasks();
    if (user?.role !== 'employee') fetchEmployees();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setTasks(data);
  };

  const fetchEmployees = async () => {
    const res = await fetch('/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setEmployees(data);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(newTask)
    });
    if (res.ok) {
      setShowModal(false);
      fetchTasks();
    }
  };

  const updateStatus = async (taskId: number, status: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ status })
    });
    fetchTasks();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tasks & Projects</h1>
          <p className="text-slate-500">Manage your workload and track progress.</p>
        </div>
        {user?.role !== 'employee' && (
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create Task</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['pending', 'in-progress', 'completed'].map((status) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-bold text-slate-500 uppercase text-xs tracking-wider flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  status === 'completed' ? 'bg-emerald-500' : 
                  status === 'in-progress' ? 'bg-blue-500' : 'bg-slate-400'
                }`} />
                <span>{status.replace('-', ' ')}</span>
              </h3>
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-bold">
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>
            
            <div className="space-y-4">
              {tasks.filter(t => t.status === status).map((task) => (
                <div key={task.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      task.priority === 'high' ? 'bg-rose-100 text-rose-600' : 
                      task.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {task.priority}
                    </span>
                    <select 
                      value={task.status}
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                      className="text-xs bg-transparent border-none focus:ring-0 text-slate-400 cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <h4 className="font-bold mb-1">{task.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">{task.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <Clock size={14} />
                      <span>{new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                    {task.assignee_name && (
                      <div className="text-xs font-medium text-indigo-600">@{task.assignee_name}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-6">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input 
                  required
                  type="text" 
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-24"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Assign To</label>
                  <select 
                    required
                    value={newTask.assigned_to}
                    onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select 
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deadline</label>
                <input 
                  required
                  type="date" 
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
