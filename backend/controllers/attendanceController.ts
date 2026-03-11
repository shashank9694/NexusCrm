import { Attendance } from "../models/Attendance.ts";

export const checkIn = async (req: any, res: any) => {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  try {
    const existing = await Attendance.findOne({ user_id: req.user.id, date: today });
    if (existing) return res.status(400).json({ error: "Already checked in" });
    
    // Check if late (after 9:00 AM)
    const nineAM = new Date();
    nineAM.setHours(9, 0, 0, 0);
    const status = now > nineAM ? 'late' : 'present';

    await Attendance.create({
      user_id: req.user.id,
      date: today,
      check_in: now,
      status: status
    });
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const checkOut = async (req: any, res: any) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  try {
    await Attendance.findOneAndUpdate(
      { user_id: req.user.id, date: today },
      { check_out: new Date() }
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyAttendance = async (req: any, res: any) => {
  try {
    const records = await Attendance.find({ user_id: req.user.id }).sort({ date: -1 });
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllAttendance = async (req: any, res: any) => {
  try {
    const records = await Attendance.find()
      .populate('user_id', 'name department')
      .sort({ date: -1 });
    
    res.json(records.map((r: any) => ({
      ...r.toObject(),
      id: r._id,
      user_name: r.user_id?.name,
      department: r.user_id?.department
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAttendanceStats = async (req: any, res: any) => {
  try {
    const stats = await Attendance.aggregate([
      { $group: { _id: "$date", present_count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 30 },
      { $project: { date: "$_id", present_count: 1, _id: 0 } }
    ]);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
