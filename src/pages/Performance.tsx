import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Star, MessageSquare, TrendingUp, Award, Send } from 'lucide-react';
import { getHRAssistantResponse } from '../../backend/services/geminiService';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';

export const Performance: React.FC = () => {
  const { token, user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({
    user_id: '',
    rating: 5,
    comments: ''
  });

  useEffect(() => {
    fetchPerformance();
    fetchStats();
    if (user?.role !== 'employee') fetchEmployees();
  }, []);

  const fetchStats = async () => {
    const res = await fetch('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setStats(data);
  };

  const fetchEmployees = async () => {
    const res = await fetch('/api/auth/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setEmployees(data);
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/performance', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(newReview)
    });
    if (res.ok) {
      setShowReviewModal(false);
      fetchPerformance();
    }
  };

  const fetchPerformance = async () => {
    const res = await fetch(`/api/performance/${user?.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setReviews(data);
  };

  const askAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    try {
      const response = await getHRAssistantResponse(aiQuery, { user, reviews });
      setAiResponse(response || 'No response from AI');
    } catch (err) {
      setAiResponse('Error communicating with AI assistant.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Performance & Growth</h1>
          <p className="text-slate-500">Review your feedback and track your professional growth.</p>
        </div>
        {user?.role !== 'employee' && (
          <button 
            onClick={() => setShowReviewModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Award size={18} />
            <span>Write Review</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Assistant Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp size={20} />
              </div>
              <h3 className="font-bold">AI HR Assistant</h3>
            </div>
            <p className="text-indigo-100 text-sm mb-6">
              Ask me anything about your performance, leave policies, or career growth.
            </p>
            
            <form onSubmit={askAI} className="space-y-3">
              <textarea 
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="How can I improve my task completion score?"
                className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 h-24 resize-none"
              />
              <button 
                type="submit"
                disabled={isAiLoading}
                className="w-full bg-white text-indigo-600 font-bold py-2 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isAiLoading ? <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent animate-spin rounded-full" /> : <Send size={18} />}
                <span>Ask Assistant</span>
              </button>
            </form>
          </div>

          {aiResponse && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center space-x-2 mb-3 text-indigo-600">
                <MessageSquare size={18} />
                <span className="font-bold text-sm">Assistant Response</span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 prose dark:prose-invert max-w-none">
                <Markdown>{aiResponse}</Markdown>
              </div>
            </motion.div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <Award size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Overall Rating</p>
                <div className="flex items-center space-x-1">
                  <span className="text-2xl font-bold">{stats?.avgRating || "0.0"}</span>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill={i <= Math.round(parseFloat(stats?.avgRating || "0")) ? "currentColor" : "none"} />)}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Growth Score</p>
                <span className="text-2xl font-bold">{stats?.growthScore || "0"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-semibold">Recent Reviews</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {reviews.map((review) => (
                <div key={review.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill={i <= review.rating ? "currentColor" : "none"} />)}
                      </div>
                      <span className="text-sm font-bold">{review.rating}/5</span>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(review.review_date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm italic">"{review.comments}"</p>
                  <div className="mt-4 flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200" />
                    <span className="text-xs font-medium text-slate-500">Reviewed by Manager</span>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="p-10 text-center text-slate-500">No performance reviews found yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-6">Write Performance Review</h3>
            <form onSubmit={handleCreateReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee</label>
                <select 
                  required
                  value={newReview.user_id}
                  onChange={(e) => setNewReview({...newReview, user_id: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="5"
                  value={newReview.rating}
                  onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comments</label>
                <textarea 
                  required
                  value={newReview.comments}
                  onChange={(e) => setNewReview({...newReview, comments: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-24"
                />
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowReviewModal(false)} className="flex-1 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
