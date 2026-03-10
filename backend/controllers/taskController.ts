import { Task } from "../models/Task.ts";

export const getTasks = async (req: any, res: any) => {
  try {
    let tasks;
    if (req.user.role === 'employee') {
      tasks = await Task.find({ assigned_to: req.user.id });
    } else {
      tasks = await Task.find().populate('assigned_to', 'name');
    }
    res.json(tasks.map((t: any) => ({
      ...t.toObject(),
      id: t._id,
      assignee_name: t.assigned_to?.name
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createTask = async (req: any, res: any, io: any) => {
  const { title, description, assigned_to, priority, deadline } = req.body;
  try {
    const task = await Task.create({
      title,
      description,
      assigned_to,
      created_by: req.user.id,
      priority,
      deadline
    });
    
    io.to(`user_${assigned_to}`).emit('notification', { message: `New task assigned: ${title}` });
    res.json({ id: task._id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateTaskStatus = async (req: any, res: any) => {
  const { status } = req.body;
  try {
    await Task.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
