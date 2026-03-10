import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'hr', 'manager', 'employee'], 
    required: true 
  },
  department: { type: String },
  manager_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'active' },
  avatar: { type: String },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
