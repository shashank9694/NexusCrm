import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  Plus, 
  Users, 
  Calendar, 
  MoreVertical, 
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Bug as BugIcon,
  BarChart3,
  ChevronLeft,
  Send
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  manager_id?: string;
  manager_name: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  members: any[];
  start_date: string;
  end_date: string;
  comments?: any[];
  stats?: {
    total_tasks: number;
    completed_tasks: number;
    total_bugs: number;
    fixed_bugs: number;
    progress: number;
  };
}

interface Bug {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'fixed' | 'verified' | 'closed';
  reporter_name: string;
  assignee_name?: string;
  fixer_name?: string;
  createdAt: string;
}

interface ProgressReport {
  project_id: string;
  project_name: string;
  total_tasks: number;
  completed_tasks: number;
  total_bugs: number;
  fixed_bugs: number;
  overall_progress: number;
  employee_progress: any[];
}

export const ProjectManagement: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [view, setView] = useState<'list' | 'report' | 'details'>('list');
  const [reportData, setReportData] = useState<ProgressReport[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [newBug, setNewBug] = useState({
    title: '',
    description: '',
    severity: 'medium',
    assigned_to: ''
  });
  const [employees, setEmployees] = useState<any[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState<any>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    manager_id: user?.id || '',
    status: 'planning',
    members: []
  });

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (view === 'report' || view === 'details') {
      fetchReport();
    }
  }, [view]);

  useEffect(() => {
    if (selectedProject) {
      fetchBugs(selectedProject.id);
      fetchProjectTasks(selectedProject.id);
      fetchReport(); // Ensure we have latest stats for contributions
    }
  }, [selectedProject]);

  const fetchProjectTasks = async (projectId: string) => {
    const res = await fetch('/api/tasks', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      setProjectTasks(data.filter((t: any) => t.project_id === projectId));
    }
  };

  const fetchEmployees = async () => {
    const res = await fetch('/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setEmployees(data);
  };

  const fetchBugs = async (projectId: string) => {
    const res = await fetch(`/api/bugs?project_id=${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setBugs(data);
  };

  const fetchReport = async () => {
    const res = await fetch('/api/projects/report', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setReportData(data);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newComment.trim()) return;

    const res = await fetch(`/api/projects/${selectedProject.id}/comments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ text: newComment })
    });

    if (res.ok) {
      setNewComment('');
      fetchProjects(); // Refresh to get new comments
      // Also update selectedProject locally if needed or just refetch
      const updatedProjects = await (await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      })).json();
      setProjects(updatedProjects);
      setSelectedProject(updatedProjects.find((p: any) => p.id === selectedProject.id));
    }
  };

  const handleCreateBug = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!selectedProject) return;
    
    if (!newBug.title.trim()) {
      setFormError("Bug title is required");
      return;
    }

    try {
      const res = await fetch('/api/bugs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ ...newBug, project_id: selectedProject.id })
      });
  
      if (res.ok) {
        setIsBugModalOpen(false);
        setNewBug({ title: '', description: '', severity: 'medium', assigned_to: '' });
        fetchBugs(selectedProject.id);
      } else {
        const data = await res.json();
        setFormError(data.error || 'Failed to report bug');
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
      console.error(err);
    }
  };

  const handleFixBug = async (bugId: string) => {
    const res = await fetch(`/api/bugs/${bugId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ status: 'fixed' })
    });

    if (res.ok && selectedProject) {
      fetchBugs(selectedProject.id);
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setProjectForm({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      manager_id: user?.id || '',
      status: 'planning',
      members: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name,
      description: project.description,
      start_date: project.start_date.split('T')[0],
      end_date: project.end_date.split('T')[0],
      manager_id: project.manager_id || user?.id || '',
      status: project.status,
      members: project.members?.map(m => m._id || m.id || m) || []
    });
    setIsModalOpen(true);
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const [formError, setFormError] = useState<string | null>(null);

  const validateProjectForm = () => {
    if (!projectForm.name.trim()) return "Project name is required";
    if (!projectForm.start_date) return "Start date is required";
    if (!projectForm.end_date) return "End date is required";
    if (new Date(projectForm.start_date) > new Date(projectForm.end_date)) {
      return "End date cannot be before start date";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    const validationError = validateProjectForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
    const method = editingProject ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(projectForm)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchProjects();
      } else {
        const data = await res.json();
        setFormError(data.error || 'Failed to save project');
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-600';
      case 'planning': return 'bg-blue-100 text-blue-600';
      case 'on-hold': return 'bg-amber-100 text-amber-600';
      case 'completed': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {view !== 'list' && (
            <button 
              onClick={() => { setView('list'); setSelectedProject(null); }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {view === 'list' ? 'Project Management' : 
               view === 'report' ? 'Organization Progress Report' : 
               selectedProject?.name}
            </h1>
            <p className="text-slate-500">
              {view === 'list' ? "Track and manage your organization's projects." : 
               view === 'report' ? "Detailed overview of employee performance across projects." : 
               selectedProject?.description}
            </p>
          </div>
        </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => {
                if (selectedProject) {
                  fetchBugs(selectedProject.id);
                  fetchProjectTasks(selectedProject.id);
                  fetchReport();
                  fetchProjects();
                }
              }}
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              title="Refresh Data"
            >
              <Clock size={18} />
            </button>
            {view === 'list' && (
            <>
              <button 
                onClick={() => setView('report')}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center space-x-2"
              >
                <BarChart3 size={18} />
                <span>Progress Report</span>
              </button>
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <button 
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <Plus size={18} />
                  <span>New Project</span>
                </button>
              )}
            </>
          )}
          {view === 'details' && (
            <button 
              onClick={() => setIsBugModalOpen(true)}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors flex items-center space-x-2"
            >
              <BugIcon size={18} />
              <span>Report Bug</span>
            </button>
          )}
        </div>
      </div>

      {view === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id} 
              onClick={() => { setSelectedProject(project); setView('details'); }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg group-hover:bg-indigo-100 transition-colors">
                  <Briefcase className="text-indigo-600" size={20} />
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              
              <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
              <p className="text-slate-500 text-sm mb-4 line-clamp-2">{project.description}</p>
              
              {project.stats && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">Progress</span>
                    <span className="text-xs font-bold text-indigo-600">{project.stats.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-500" 
                      style={{ width: `${project.stats.progress}%` }} 
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
                    <span>{project.stats.completed_tasks}/{project.stats.total_tasks} Tasks</span>
                    <span>{project.stats.fixed_bugs}/{project.stats.total_bugs} Bugs</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Users size={16} className="mr-2" />
                  <span>{project.members?.length || 0} Members</span>
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Calendar size={16} className="mr-2" />
                  <span>{new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold mr-2">
                    {project.manager_name?.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-slate-500">Manager: {project.manager_name}</span>
                </div>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEditModal(project); }}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                  >
                    <MoreVertical size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'report' && (
        <div className="space-y-6">
          {reportData.map((report) => (
            <div key={report.project_id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{report.project_name}</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-bold">Overall Progress</p>
                    <p className="text-lg font-bold text-indigo-600">{report.overall_progress}%</p>
                  </div>
                  <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600" style={{ width: `${report.overall_progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-500 font-bold uppercase">Total Tasks</p>
                  <p className="text-2xl font-bold">{report.total_tasks}</p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <p className="text-xs text-emerald-600 font-bold uppercase">Completed Tasks</p>
                  <p className="text-2xl font-bold">{report.completed_tasks}</p>
                </div>
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                  <p className="text-xs text-rose-600 font-bold uppercase">Total Bugs</p>
                  <p className="text-2xl font-bold">{report.total_bugs}</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-xs text-blue-600 font-bold uppercase">Fixed Bugs</p>
                  <p className="text-2xl font-bold">{report.fixed_bugs}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-3">Employee</th>
                      <th className="pb-3">Tasks Assigned</th>
                      <th className="pb-3">Tasks Completed</th>
                      <th className="pb-3">Bugs Fixed</th>
                      <th className="pb-3">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {report.employee_progress.map((emp) => (
                      <tr key={emp.employee_id}>
                        <td className="py-4 font-medium">{emp.employee_name}</td>
                        <td className="py-4">{emp.tasks_count}</td>
                        <td className="py-4">{emp.tasks_completed}</td>
                        <td className="py-4 text-emerald-600 font-bold">{emp.bugs_fixed}</td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold">
                              {emp.tasks_count > 0 ? Math.round((emp.tasks_completed / emp.tasks_count) * 100) : 0}%
                            </span>
                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500" 
                                style={{ width: `${emp.tasks_count > 0 ? (emp.tasks_completed / emp.tasks_count) * 100 : 0}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'details' && selectedProject && (
        <div className="space-y-6">
          {/* Project Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Overall Progress</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-indigo-600">{selectedProject.stats?.progress || 0}%</p>
                <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-indigo-600" style={{ width: `${selectedProject.stats?.progress || 0}%` }} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Tasks Status</p>
              <p className="text-3xl font-bold">{selectedProject.stats?.completed_tasks || 0} <span className="text-sm text-slate-400 font-normal">/ {selectedProject.stats?.total_tasks || 0}</span></p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Bugs Resolved</p>
              <p className="text-3xl font-bold text-emerald-600">{selectedProject.stats?.fixed_bugs || 0} <span className="text-sm text-slate-400 font-normal">/ {selectedProject.stats?.total_bugs || 0}</span></p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Team Size</p>
              <p className="text-3xl font-bold">{selectedProject.members?.length || 0} <span className="text-sm text-slate-400 font-normal">Members</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Tasks, Bugs & Employee Contributions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Tasks */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold flex items-center">
                    <CheckCircle2 className="mr-2 text-indigo-600" size={20} />
                    Project Tasks
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">
                      {projectTasks.filter(t => t.status !== 'completed').length} Pending
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {projectTasks.map((task) => (
                    <div key={task.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'
                        }`}>
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <h4 className={`font-bold text-sm ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>{task.title}</h4>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-[10px] text-slate-500 flex items-center">
                              <Clock size={10} className="mr-1" />
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-600">@{task.assignee_name}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        task.priority === 'high' ? 'bg-rose-100 text-rose-600' : 
                        task.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                  {projectTasks.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                      <p>No tasks assigned to this project yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Employee Contributions */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <BarChart3 className="mr-2 text-indigo-600" size={20} />
                  Employee Contributions
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs text-slate-500 uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                        <th className="pb-3">Employee</th>
                        <th className="pb-3">Tasks Done</th>
                        <th className="pb-3">Bugs Fixed</th>
                        <th className="pb-3">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {reportData.find(r => r.project_id === selectedProject.id)?.employee_progress.map((emp) => (
                        <tr key={emp.employee_id}>
                          <td className="py-4 font-medium">{emp.employee_name}</td>
                          <td className="py-4">{emp.tasks_completed} / {emp.tasks_count}</td>
                          <td className="py-4 text-emerald-600 font-bold">{emp.bugs_fixed}</td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold">
                                {emp.tasks_count > 0 ? Math.round((emp.tasks_completed / emp.tasks_count) * 100) : 0}%
                              </span>
                              <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-500" 
                                  style={{ width: `${emp.tasks_count > 0 ? (emp.tasks_completed / emp.tasks_count) * 100 : 0}%` }} 
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center">
                  <BugIcon className="mr-2 text-rose-500" size={20} />
                  Project Bugs
                </h3>
                <div className="flex items-center space-x-3">
                  <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-bold">
                    {bugs.filter(b => b.status === 'open').length} Open
                  </span>
                  {onNavigate && (
                    <button 
                      onClick={() => onNavigate('bugs')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
                    >
                      View All Bugs
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {bugs.map((bug) => (
                  <div key={bug.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold">{bug.title}</h4>
                        <p className="text-sm text-slate-500">{bug.description}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        bug.severity === 'critical' ? 'bg-rose-600 text-white' : 
                        bug.severity === 'high' ? 'bg-rose-100 text-rose-600' : 
                        bug.severity === 'medium' ? 'bg-amber-100 text-amber-600' : 
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {bug.severity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>Reported by: <span className="font-bold">{bug.reporter_name}</span></span>
                        {bug.fixer_name && (
                          <span className="text-emerald-600 font-bold flex items-center">
                            <CheckCircle2 size={12} className="mr-1" />
                            Fixed by: {bug.fixer_name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          bug.status === 'fixed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {bug.status}
                        </span>
                        {bug.status !== 'fixed' && (
                          <button 
                            onClick={() => handleFixBug(bug.id)}
                            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Mark as Fixed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {bugs.length === 0 && (
                  <div className="text-center py-10 text-slate-500">
                    <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500 opacity-20" />
                    <p>No bugs reported for this project yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Comments & Members */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-[600px]">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <MessageSquare className="mr-2 text-indigo-600" size={20} />
                Project Comments
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {selectedProject.comments?.map((comment, idx) => {
                  const isMe = (comment.user_id?._id || comment.user_id) === user?.id;
                  const commenterName = comment.user_id?.name || 'User';
                  
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className={`text-[10px] font-bold text-slate-400 mb-1 ${isMe ? 'mr-2' : 'ml-2'}`}>
                        {isMe ? 'You' : commenterName}
                      </span>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none'
                      }`}>
                        {comment.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">
                        {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                {(!selectedProject.comments || selectedProject.comments.length === 0) && (
                  <p className="text-center text-slate-500 text-sm mt-10">No comments yet.</p>
                )}
              </div>

              {(user?.role === 'admin' || user?.role === 'manager') && (
                <form onSubmit={handleAddComment} className="relative">
                  <input 
                    type="text" 
                    placeholder="Add a comment..."
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Users className="mr-2 text-slate-400" size={18} />
                Team Members
              </h3>
              <div className="space-y-3">
                {selectedProject.members?.map((member: any) => (
                  <div key={member._id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 text-xs font-bold">
                      {member.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{member.role || 'Employee'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Bug Report Modal */}
      {isBugModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Report a Bug</h2>
            <form onSubmit={handleCreateBug} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bug Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Login button not working"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
                  value={newBug.title}
                  onChange={(e) => setNewBug({...newBug, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  required
                  placeholder="Describe the issue in detail..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent h-24"
                  value={newBug.description}
                  onChange={(e) => setNewBug({...newBug, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Severity</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
                    value={newBug.severity}
                    onChange={(e) => setNewBug({...newBug, severity: e.target.value as any})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assign To</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
                    value={newBug.assigned_to}
                    onChange={(e) => setNewBug({...newBug, assigned_to: e.target.value})}
                  >
                    <option value="">Select Developer</option>
                    {selectedProject?.members?.map((m: any) => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm flex items-center space-x-2">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsBugModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700"
                >
                  Report Bug
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent h-24"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                />
              </div>
              {editingProject && (
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({...projectForm, status: e.target.value as any})}
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
                    value={projectForm.start_date}
                    onChange={(e) => setProjectForm({...projectForm, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
                    value={projectForm.end_date}
                    onChange={(e) => setProjectForm({...projectForm, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Team Members</label>
                <div className="max-h-40 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                  {employees.map((emp) => (
                    <label key={emp.id} className="flex items-center space-x-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded-lg transition-colors">
                      <input 
                        type="checkbox"
                        checked={projectForm.members.includes(emp.id)}
                        onChange={(e) => {
                          const newMembers = e.target.checked 
                            ? [...projectForm.members, emp.id]
                            : projectForm.members.filter((id: string) => id !== emp.id);
                          setProjectForm({...projectForm, members: newMembers});
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="text-sm">{emp.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase">({emp.role})</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm flex items-center space-x-2">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
                >
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
