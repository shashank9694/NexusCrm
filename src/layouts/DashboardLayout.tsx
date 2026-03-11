import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase,
  Users, 
  CalendarCheck, 
  CheckSquare, 
  FileText, 
  TrendingUp, 
  Bell, 
  LogOut,
  User as UserIcon,
  Moon,
  Sun,
  Menu,
  X,
  Bug
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-indigo-600 text-white' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

export const DashboardLayout: React.FC<{ children: React.ReactNode, activeTab: string, setActiveTab: (tab: string) => void }> = ({ children, activeTab, setActiveTab }) => {
  const { user, token, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [showNotifications, setShowNotifications] = React.useState(false);

  React.useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchNotifications();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'hr', 'manager', 'tl', 'employee'] },
    { id: 'projects', label: 'Projects', icon: Briefcase, roles: ['admin', 'hr', 'manager', 'tl', 'employee'] },
    { id: 'employees', label: 'Employees', icon: Users, roles: ['admin', 'hr'] },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, roles: ['admin', 'hr', 'manager', 'tl', 'employee'] },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, roles: ['admin', 'hr', 'manager', 'tl', 'employee'] },
    { id: 'leaves', label: 'Leaves', icon: FileText, roles: ['admin', 'hr', 'manager', 'tl', 'employee'] },
    { id: 'performance', label: 'Performance', icon: TrendingUp, roles: ['admin', 'hr', 'manager', 'tl', 'employee'] },
    { id: 'bugs', label: 'Bugs', icon: Bug, roles: ['admin', 'hr', 'manager', 'tl', 'employee', 'tester'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="bg-slate-900 overflow-hidden flex flex-col"
      >
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold text-white">Nexus CRM</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {filteredMenu.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors mb-2 ${
              activeTab === 'profile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white">
              <UserIcon size={20} />
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className={`h-16 border-b flex items-center justify-between px-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-lg font-semibold capitalize">{activeTab}</h2>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative"
              >
                <Bell size={20} />
                {notifications.some(n => !n.is_read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <h3 className="font-bold">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)} className="text-xs text-indigo-600 hover:underline">Close</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => markRead(n.id)}
                          className={`p-4 border-b border-slate-50 dark:border-slate-800/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.is_read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                        >
                          <p className={`text-sm ${!n.is_read ? 'font-bold' : 'text-slate-600 dark:text-slate-400'}`}>{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div className="p-8 text-center text-slate-500 text-sm">No notifications yet.</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
