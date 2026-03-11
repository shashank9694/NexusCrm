import { Leave } from "../models/Leave.ts";
import { User } from "../models/User.ts";

export const applyLeave = async (req: any, res: any) => {
  const { type, start_date, end_date, reason } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if enough balance
    const leaveType = type as keyof typeof user.leave_balance;
    const balance = user.leave_balance[leaveType];
    
    // Calculate days
    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (balance < diffDays) {
      return res.status(400).json({ error: `Insufficient ${type} leave balance. Available: ${balance} days.` });
    }

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
  
  // Only Admin or Manager can approve/reject
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({ error: "Forbidden: Only Admin or Manager can approve leaves" });
  }

  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ error: "Leave not found" });

    if (status === leave.status) return res.json({ success: true });

    const user = await User.findById(leave.user_id);
    if (user) {
      const leaveType = leave.type as keyof typeof user.leave_balance;
      
      // Calculate days
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // Deduct balance if approving
      if (status === 'approved' && leave.status !== 'approved') {
        if ((user.leave_balance as any)[leaveType] < diffDays) {
          return res.status(400).json({ error: `Insufficient ${leaveType} leave balance. Available: ${(user.leave_balance as any)[leaveType]} days.` });
        }
        (user.leave_balance as any)[leaveType] -= diffDays;
      } 
      // Restore balance if moving away from approved
      else if (leave.status === 'approved' && status !== 'approved') {
        (user.leave_balance as any)[leaveType] += diffDays;
      }
      
      await user.save();
    }

    leave.status = status;
    await leave.save();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteLeave = async (req: any, res: any) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ error: "Leave not found" });

    // Only allow user to delete their own pending leave, or admin/manager to delete any
    if (leave.user_id.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Restore balance if it was approved
    if (leave.status === 'approved') {
      const user = await User.findById(leave.user_id);
      if (user) {
        const leaveType = leave.type as keyof typeof user.leave_balance;
        const start = new Date(leave.start_date);
        const end = new Date(leave.end_date);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        (user.leave_balance as any)[leaveType] += diffDays;
        await user.save();
      }
    }

    await Leave.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
