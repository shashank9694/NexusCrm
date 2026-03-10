import { Leave } from "../models/Leave.ts";

export const applyLeave = async (req: any, res: any) => {
  const { type, start_date, end_date, reason } = req.body;
  try {
    const leave = await Leave.create({
      user_id: req.user.id,
      type,
      start_date,
      end_date,
      reason
    });
    res.json({ id: leave._id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getLeaves = async (req: any, res: any) => {
  try {
    let leaves;
    if (req.user.role === 'employee') {
      leaves = await Leave.find({ user_id: req.user.id });
    } else {
      leaves = await Leave.find().populate('user_id', 'name');
    }
    res.json(leaves.map((l: any) => ({
      ...l.toObject(),
      id: l._id,
      user_name: l.user_id?.name
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLeaveStatus = async (req: any, res: any) => {
  const { status } = req.body;
  try {
    await Leave.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
