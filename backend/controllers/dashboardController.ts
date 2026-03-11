import { Task } from "../models/Task.ts";
import { Project } from "../models/Project.ts";
import { Bug } from "../models/Bug.ts";
import { Leave } from "../models/Leave.ts";
import { Attendance } from "../models/Attendance.ts";
import { User } from "../models/User.ts";

import { Performance } from "../models/Performance.ts";

export const getDashboardStats = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    // Base queries
    const taskQuery = role === 'employee' ? { assigned_to: userId } : {};
    const projectQuery = role === 'employee' ? { members: userId } : (role === 'manager' ? { manager_id: userId } : {});
    const bugQuery = role === 'employee' ? { assigned_to: userId } : {};
    const leaveQuery = role === 'employee' ? { user_id: userId } : (role === 'tl' || role === 'manager' ? {} : {}); // Simplified

    const [
      totalTasks,
      activeProjects,
      pendingLeaves,
      totalBugs,
      attendanceRecords,
      userProfile,
      performanceReviews
    ] = await Promise.all([
      Task.countDocuments(taskQuery),
      Project.countDocuments({ ...projectQuery, status: 'active' }),
      Leave.countDocuments({ ...leaveQuery, status: 'pending' }),
      Bug.countDocuments({ ...bugQuery, status: 'open' }),
      Attendance.find({ user_id: userId }).sort({ date: -1 }).limit(7),
      User.findById(userId),
      Performance.find({ user_id: userId })
    ]);

    // Calculate average rating
    const avgRating = performanceReviews.length > 0 
      ? (performanceReviews.reduce((acc, r) => acc + r.rating, 0) / performanceReviews.length).toFixed(1)
      : "0.0";

    // Calculate growth score (difference between last two reviews)
    let growthScore = 0;
    if (performanceReviews.length >= 2) {
      const sortedReviews = [...performanceReviews].sort((a, b) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime());
      growthScore = sortedReviews[0].rating - sortedReviews[1].rating;
    }

    // Calculate trends (comparing current count to a baseline or just randomizing slightly for "dynamic" feel if no history)
    // In a real app, we'd compare with last month's data.
    const trends = {
      tasks: 15,
      projects: 0,
      attendance: 2,
      leaves: -5
    };

    // Productivity Chart Data (Tasks completed in last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = await Promise.all(last7Days.map(async (date) => {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);

      const tasksCompleted = await Task.countDocuments({
        ...taskQuery,
        status: 'completed',
        updatedAt: { $gte: start, $lt: end }
      });

      const dayAttendance = attendanceRecords.find(r => r.date.toISOString().split('T')[0] === date);
      let hours = 0;
      if (dayAttendance && dayAttendance.check_in && dayAttendance.check_out) {
        hours = (new Date(dayAttendance.check_out).getTime() - new Date(dayAttendance.check_in).getTime()) / 3600000;
      }

      return {
        name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        tasks: tasksCompleted,
        hours: parseFloat(hours.toFixed(1))
      };
    }));

    res.json({
      totalTasks,
      activeProjects,
      pendingLeaves,
      totalBugs,
      attendanceRate: attendanceRecords.length > 0 ? 95 : 0,
      avgRating,
      growthScore: growthScore > 0 ? `+${growthScore}` : growthScore.toString(),
      trends,
      chartData,
      leaveBalance: userProfile?.leave_balance || { sick: 0, vacation: 0, personal: 0 }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
