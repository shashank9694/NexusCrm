import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bug as BugIcon, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  Clock
} from 'lucide-react';

interface Bug {
  id: string;
  title: string;
  description: string;
  project_id: string;
  project_name?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'fixed' | 'verified' | 'closed';
  reporter_name: string;
  assignee_name?: string;
  fixer_name?: string;
  createdAt: string;
}

export const BugTracking: React.FC = () => {
  const { token, user } = useAuth();
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    try {
      const res = await fetch('/api/bugs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setBugs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

    if (res.ok) {
      fetchBugs();
    }
  };

  const filteredBugs = bugs.filter(bug => {
    const matchesFilter = filter === 'all' || bug.status === filter;
    const matchesSearch = bug.title.toLowerCase().includes(search.toLowerCase()) || 
                         bug.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Bug Tracking</h1>
          <p className="text-slate-500">View and manage bugs across all projects.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search bugs..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter size={18} className="text-slate-400" />
          <select 
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="fixed">Fixed</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredBugs.map((bug) => (
          <div key={bug.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  bug.status === 'fixed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                }`}>
                  <BugIcon size={20} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-lg">{bug.title}</h3>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded font-medium">
                      {bug.project_name}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{bug.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                  bug.severity === 'critical' ? 'bg-rose-600 text-white' : 
                  bug.severity === 'high' ? 'bg-rose-100 text-rose-600' : 
                  bug.severity === 'medium' ? 'bg-amber-100 text-amber-600' : 
                  'bg-blue-100 text-blue-600'
                }`}>
                  {bug.severity}
                </span>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                  bug.status === 'fixed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {bug.status}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-4">
              <div className="flex items-center space-x-6 text-xs text-slate-500">
                <div className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  Reported by: <span className="font-bold text-slate-700 dark:text-slate-300">{bug.reporter_name}</span>
                </div>
                {bug.fixer_name && (
                  <div className="text-emerald-600 font-bold flex items-center">
                    <CheckCircle2 size={14} className="mr-1" />
                    Fixed by: {bug.fixer_name}
                  </div>
                )}
              </div>
              
              {bug.status !== 'fixed' && (
                <button 
                  onClick={() => handleFixBug(bug.id)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Mark as Fixed
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredBugs.length === 0 && !loading && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <BugIcon size={48} className="mx-auto mb-4 text-slate-200" />
            <p className="text-slate-500">No bugs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
