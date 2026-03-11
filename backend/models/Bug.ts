import mongoose from 'mongoose';

const bugSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  reported_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fixed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  status: { 
    type: String, 
    enum: ['open', 'in-progress', 'fixed', 'verified', 'closed'], 
    default: 'open' 
  },
  fixed_at: { type: Date }
}, { timestamps: true });

export const Bug = mongoose.model('Bug', bugSchema);
