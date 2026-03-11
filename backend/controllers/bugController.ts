import { Bug } from "../models/Bug.ts";
import { Project } from "../models/Project.ts";

export const getBugs = async (req: any, res: any) => {
  const { project_id } = req.query;
  try {
    const query: any = {};
    if (project_id) query.project_id = project_id;
    
    const bugs = await Bug.find(query)
      .populate('reported_by', 'name')
      .populate('assigned_to', 'name')
      .populate('fixed_by', 'name')
      .populate('project_id', 'name')
      .sort({ createdAt: -1 });
      
    res.json(bugs.map((b: any) => ({
      ...b.toObject(),
      id: b._id,
      reporter_name: b.reported_by?.name,
      assignee_name: b.assigned_to?.name,
      fixer_name: b.fixed_by?.name,
      project_name: b.project_id?.name
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createBug = async (req: any, res: any) => {
  const { title, description, project_id, severity, assigned_to } = req.body;
  
  // Testers, Managers, Admins can report bugs
  if (!['admin', 'manager', 'tester', 'tl'].includes(req.user.role)) {
    return res.status(403).json({ error: "Only Testers, Managers or Admins can report bugs" });
  }

  try {
    const bug = await Bug.create({
      title,
      description,
      project_id,
      reported_by: req.user.id,
      severity,
      assigned_to
    });

    // Add assignee to project members
    if (project_id && assigned_to) {
      await Project.findByIdAndUpdate(project_id, {
        $addToSet: { members: assigned_to }
      });
    }

    res.json({ id: bug._id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateBugStatus = async (req: any, res: any) => {
  const { status, assigned_to } = req.body;
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ error: "Bug not found" });

    const updateData: any = { status };
    if (assigned_to) updateData.assigned_to = assigned_to;
    
    if (status === 'fixed') {
      updateData.fixed_by = req.user.id;
      updateData.fixed_at = new Date();
    }

    await Bug.findByIdAndUpdate(req.params.id, updateData);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
