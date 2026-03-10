import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5 },
  comments: { type: String },
  review_date: { type: Date, default: Date.now },
}, { timestamps: true });

export const Performance = mongoose.model('Performance', performanceSchema);
