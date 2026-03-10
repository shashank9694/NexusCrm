import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Building2, Save, Loader2, Key, CheckCircle2, AlertCircle } from 'lucide-react';

export const Profile: React.FC = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{type: 'success' | 'error' | null, message: string}>({type: null, message: ''});
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await fetch('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setProfile(data);
    setLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({type: null, message: ''});

    if (newPassword !== confirmPassword) {
      setPasswordStatus({type: 'error', message: 'New passwords do not match'});
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({type: 'error', message: 'Password must be at least 6 characters'});
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setPasswordStatus({type: 'success', message: 'Password updated successfully'});
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordStatus({type: 'error', message: data.error || 'Failed to update password'});
      }
    } catch (err) {
      setPasswordStatus({type: 'error', message: 'An error occurred'});
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="h-32 bg-indigo-600" />
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-lg">
              <div className="w-full h-full rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-indigo-600">
                <User size={40} />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-slate-500 capitalize">{profile.role} • {profile.department}</p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full uppercase">
              {profile.status}
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <Mail size={16} className="text-slate-400" />
                <span>{profile.email}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Department</label>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <Building2 size={16} className="text-slate-400" />
                <span>{profile.department}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Access Level</label>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <Shield size={16} className="text-slate-400" />
                <span className="capitalize">{profile.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
            <Key size={20} />
          </div>
          <h2 className="text-xl font-bold">Security</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
              <input 
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <input 
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <input 
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {passwordStatus.type && (
            <div className={`p-4 rounded-xl flex items-center space-x-3 ${
              passwordStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}>
              {passwordStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span className="text-sm font-medium">{passwordStatus.message}</span>
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              disabled={changingPassword}
              className="px-6 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {changingPassword ? <Loader2 className="animate-spin" size={18} /> : <Key size={18} />}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
