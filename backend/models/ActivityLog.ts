import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  details: { type: String },
}, { timestamps: true });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
