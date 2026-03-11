import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, CheckSquare, Clock, AlertTriangle } from 'lucide-react';

export const Tasks: React.FC = () => {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [taskForm, setTaskForm] = useState<any>({
    title: '',
    description: '',
    assigned_to: '',
    project_id: '',
    priority: 'medium',
    deadline: '',
    status: 'pending',
    dependencies: []
  });
  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
    if (user?.role !== 'employee') {
      fetchEmployees();
      fetchProjects();
    }
  }, []);

  const openCreateModal = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      assigned_to: '',
      project_id: '',
      priority: 'medium',
      deadline: '',
      status: 'pending',
      dependencies: []
    });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      assigned_to: task.assigned_to?._id || task.assigned_to,
      project_id: task.project_id || '',
      priority: task.priority,
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
      status: task.status,
      dependencies: task.dependencies?.map((d: any) => d._id || d) || []
    });
    setError(null);
    setShowModal(true);
  };

  const fetchProjects = async () => {
    const res = await fetch('/api/projects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setProjects(data);
  };

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

  const validateTaskForm = () => {
    if (!taskForm.title.trim()) return "Task title is required";
    if (!taskForm.assigned_to) return "Assignee is required";
    if (!taskForm.deadline) return "Deadline is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateTaskForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
    const method = editingTask ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(taskForm)
      });
      if (res.ok) {
        setShowModal(false);
        fetchTasks();
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    }
  };

  const updateStatus = async (taskId: string, status: string) => {
    setError(null);
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ status })
    });
    
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Failed to update status');
    }
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
            onClick={openCreateModal}
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
                    <div className="flex items-center space-x-2">
                      {(user?.role === 'admin' || user?.role === 'manager' || task.created_by === user?.id) && (
                        <button 
                          onClick={() => openEditModal(task)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <Plus size={14} className="rotate-45" />
                        </button>
                      )}
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
                  </div>
                  <h4 className="font-bold mb-1">{task.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-2">{task.description}</p>
                  
                  {task.dependencies && task.dependencies.length > 0 && (
                    <div className="mb-4 space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Dependencies:</p>
                      <div className="flex flex-wrap gap-1">
                        {task.dependencies.map((dep: any) => (
                          <span key={dep._id || dep.id} className={`text-[9px] px-1.5 py-0.5 rounded flex items-center ${
                            dep.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {dep.status === 'completed' ? <CheckSquare size={10} className="mr-1" /> : <Clock size={10} className="mr-1" />}
                            {dep.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
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
            <h3 className="text-xl font-bold mb-6">{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input 
                  required
                  type="text" 
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Project</label>
                <select 
                  value={taskForm.project_id}
                  onChange={(e) => setTaskForm({...taskForm, project_id: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">No Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Assign To</label>
                  <select 
                    required
                    value={taskForm.assigned_to}
                    onChange={(e) => setTaskForm({...taskForm, assigned_to: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select 
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
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
                  value={taskForm.deadline}
                  onChange={(e) => setTaskForm({...taskForm, deadline: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dependencies</label>
                <div className="max-h-32 overflow-y-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 space-y-1">
                  {tasks.filter(t => t.id !== editingTask?.id).map(t => (
                    <label key={t.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded">
                      <input 
                        type="checkbox"
                        checked={taskForm.dependencies.includes(t.id)}
                        onChange={(e) => {
                          const deps = e.target.checked 
                            ? [...taskForm.dependencies, t.id]
                            : taskForm.dependencies.filter((id: string) => id !== t.id);
                          setTaskForm({...taskForm, dependencies: deps});
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="truncate">{t.title}</span>
                      <span className={`text-[10px] px-1 rounded ${
                        t.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'
                      }`}>{t.status}</span>
                    </label>
                  ))}
                  {tasks.length <= 1 && <p className="text-xs text-slate-400 p-2">No other tasks available</p>}
                </div>
              </div>
              {error && (
                <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm flex items-center space-x-2">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
