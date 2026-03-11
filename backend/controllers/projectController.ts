import { Project } from "../models/Project.ts";
import { User } from "../models/User.ts";
import { Task } from "../models/Task.ts";
import { Bug } from "../models/Bug.ts";

export const getProjects = async (req: any, res: any) => {
  try {
    let projects;
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      projects = await Project.find()
        .populate('manager_id', 'name')
        .populate('members', 'name')
        .populate('comments.user_id', 'name');
    } else if (req.user.role === 'manager') {
      projects = await Project.find({ manager_id: req.user.id })
        .populate('manager_id', 'name')
        .populate('members', 'name')
        .populate('comments.user_id', 'name');
    } else {
      projects = await Project.find({ members: req.user.id })
        .populate('manager_id', 'name')
        .populate('members', 'name')
        .populate('comments.user_id', 'name');
    }
    const projectsWithStats = await Promise.all(projects.map(async (p: any) => {
      const tasks = await Task.find({ project_id: p._id });
      const bugs = await Bug.find({ project_id: p._id });
      
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const totalBugs = bugs.length;
      const fixedBugs = bugs.filter(b => b.status === 'fixed' || b.status === 'verified' || b.status === 'closed').length;

      return {
        ...p.toObject(),
        id: p._id,
        manager_name: p.manager_id?.name,
        stats: {
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          total_bugs: totalBugs,
          fixed_bugs: fixedBugs,
          progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        }
      };
    }));
    res.json(projectsWithStats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createProject = async (req: any, res: any) => {
  const { name, description, manager_id, members, start_date, end_date } = req.body;
  
  // Only Admin or Manager can create projects
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({ error: "Forbidden: Only Admin or Manager can create projects" });
  }

  try {
    const project = await Project.create({
      name,
      description,
      manager_id: manager_id || req.user.id,
      members: members || [],
      start_date,
      end_date
    });
    res.json({ id: project._id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateProject = async (req: any, res: any) => {
  const { name, description, manager_id, members, status, start_date, end_date } = req.body;
  
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Only Admin or the project's Manager can update
    if (req.user.role !== 'admin' && project.manager_id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await Project.findByIdAndUpdate(req.params.id, {
      name,
      description,
      manager_id,
      members,
      status,
      start_date,
      end_date
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const assignMembers = async (req: any, res: any) => {
  const { members } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (req.user.role !== 'admin' && project.manager_id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    project.members = members;
    await project.save();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const addComment = async (req: any, res: any) => {
  const { text } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Only Manager or Admin can add comments (as per user request "manager can add comment")
    // But maybe TLs too? Let's stick to Manager/Admin for now.
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: "Only Managers or Admins can add comments" });
    }

    project.comments.push({
      user_id: req.user.id,
      text,
      created_at: new Date()
    });

    await project.save();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getProjectProgressReport = async (req: any, res: any) => {
  try {
    let projects;
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      projects = await Project.find().populate('members', 'name');
    } else if (req.user.role === 'manager') {
      projects = await Project.find({ manager_id: req.user.id }).populate('members', 'name');
    } else {
      projects = await Project.find({ members: req.user.id }).populate('members', 'name');
    }
    
    const report = await Promise.all(projects.map(async (project: any) => {
      const tasks = await Task.find({ project_id: project._id });
      const bugs = await Bug.find({ project_id: project._id });
      
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const totalBugs = bugs.length;
      const fixedBugs = bugs.filter(b => b.status === 'fixed' || b.status === 'verified' || b.status === 'closed').length;
      
      // Progress per employee
      const members = project.members || [];
      const employeeProgress = await Promise.all(members.map(async (member: any) => {
        const memberTasks = tasks.filter(t => t.assigned_to?.toString() === member._id.toString());
        const memberBugsFixed = bugs.filter(b => b.fixed_by?.toString() === member._id.toString());
        
        return {
          employee_id: member._id,
          employee_name: member.name,
          tasks_count: memberTasks.length,
          tasks_completed: memberTasks.filter(t => t.status === 'completed').length,
          bugs_fixed: memberBugsFixed.length
        };
      }));

      return {
        project_id: project._id,
        project_name: project.name,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        total_bugs: totalBugs,
        fixed_bugs: fixedBugs,
        overall_progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        employee_progress: employeeProgress
      };
    }));

    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
