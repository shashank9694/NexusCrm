import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  check_in: { type: Date },
  check_out: { type: Date },
  status: { type: String },
}, { timestamps: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
