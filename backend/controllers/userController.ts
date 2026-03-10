import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.ts";

export const login = async (req: any, res: any) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name }, 
      process.env.JWT_SECRET || "secret"
    );
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role, 
        email: user.email 
      } 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUsers = async (req: any, res: any) => {
  try {
    const users = await User.find({}, 'name email role department status');
    res.json(users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      status: u.status
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createUser = async (req: any, res: any) => {
  const { name, email, password, role, department, manager_id } = req.body;
  const hashedPassword = bcrypt.hashSync(password || "password123", 10);
  try {
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      department,
      manager_id: manager_id || null
    });
    res.json({ id: user._id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateUser = async (req: any, res: any) => {
  const { name, email, role, department, status, manager_id } = req.body;
  try {
    await User.findByIdAndUpdate(req.params.id, {
      name,
      email,
      role,
      department,
      status,
      manager_id: manager_id || null
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getProfile = async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id, 'name email role department status avatar');
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
      avatar: user.avatar
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const changePassword = async (req: any, res: any) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();
    
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
