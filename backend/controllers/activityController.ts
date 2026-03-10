import { ActivityLog } from "../models/ActivityLog.ts";

export const logActivity = async (userId: string, action: string, details: string) => {
  try {
    await ActivityLog.create({
      user_id: userId,
      action,
      details
    });
  } catch (err: any) {
    console.error('Error logging activity:', err.message);
  }
};

export const getActivityLogs = async (req: any, res: any) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user_id', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json(logs.map((l: any) => ({
      ...l.toObject(),
      id: l._id,
      user_name: l.user_id?.name
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
