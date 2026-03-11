import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  manager_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { 
    type: String, 
    enum: ['planning', 'active', 'on-hold', 'completed'], 
    default: 'planning' 
  },
  start_date: { type: Date },
  end_date: { type: Date },
  comments: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export const Project = mongoose.model('Project', projectSchema);
