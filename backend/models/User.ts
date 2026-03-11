import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'hr', 'manager', 'tl', 'employee', 'tester'], 
    required: true 
  },
  department: { type: String },
  manager_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  leave_balance: {
    sick: { type: Number, default: 12 },
    vacation: { type: Number, default: 15 },
    personal: { type: Number, default: 10 }
  },
  status: { type: String, default: 'active' },
  avatar: { type: String },
  shift: { type: String, default: '09:00 AM - 06:00 PM' },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
