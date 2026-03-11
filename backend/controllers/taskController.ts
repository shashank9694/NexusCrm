import { Task } from "../models/Task.ts";
import { Project } from "../models/Project.ts";

export const getTasks = async (req: any, res: any) => {
  try {
    let tasks;
    if (req.user.role === 'employee') {
      tasks = await Task.find({ assigned_to: req.user.id }).populate('dependencies', 'title status');
    } else {
      tasks = await Task.find().populate('assigned_to', 'name').populate('dependencies', 'title status');
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
  const { title, description, assigned_to, priority, deadline, project_id, dependencies } = req.body;
  try {
    const task = await Task.create({
      title,
      description,
      assigned_to,
      created_by: req.user.id,
      priority,
      deadline,
      project_id,
      dependencies: dependencies || []
    });
    
    // Add user to project members if project_id is provided
    if (project_id) {
      await Project.findByIdAndUpdate(project_id, {
        $addToSet: { members: assigned_to }
      });
    }

    io.to(`user_${assigned_to}`).emit('notification', { message: `New task assigned: ${title}` });
    res.json({ id: task._id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateTask = async (req: any, res: any) => {
  const { title, description, assigned_to, priority, deadline, status, project_id, dependencies } = req.body;
  try {
    const task = await Task.findById(req.params.id).populate('dependencies');
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Dependency Check: If trying to complete, check if all dependencies are completed
    if (status === 'completed') {
      const incompleteDeps = (task.dependencies as any[]).filter(dep => dep.status !== 'completed');
      if (incompleteDeps.length > 0) {
        return res.status(400).json({ 
          error: `Cannot complete task. Dependencies not met: ${incompleteDeps.map(d => d.title).join(', ')}` 
        });
      }
    }

    // Circular Dependency Check
    if (dependencies && dependencies.includes(req.params.id)) {
      return res.status(400).json({ error: "A task cannot depend on itself" });
    }

    // Allow Admin, Manager, or the creator to update full details
    const isAuthorized = req.user.role === 'admin' || req.user.role === 'manager' || task.created_by.toString() === req.user.id;
    
    if (!isAuthorized) {
      if (task.assigned_to.toString() === req.user.id) {
        await Task.findByIdAndUpdate(req.params.id, { status });
        return res.json({ success: true, message: "Status updated" });
      }
      return res.status(403).json({ error: "Forbidden" });
    }

    await Task.findByIdAndUpdate(req.params.id, {
      title,
      description,
      assigned_to,
      priority,
      deadline,
      status,
      project_id,
      dependencies: dependencies || task.dependencies
    });

    // Add user to project members if project_id is provided or changed
    if (project_id) {
      await Project.findByIdAndUpdate(project_id, {
        $addToSet: { members: assigned_to }
      });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
