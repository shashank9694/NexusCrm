import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.ts';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected...');
    
    // Seed Admin if not exists
    await seedAdmin();
  } catch (err: any) {
    console.error('MongoDB Connection Error:', err.message);
    // Exit process with failure
    // process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@nexus.com',
        password: hashedPassword,
        role: 'admin',
        department: 'Management'
      });
      console.log('Default admin user created: admin@nexus.com / admin123');
    }
  } catch (err: any) {
    console.error('Error seeding admin:', err.message);
  }
};

export default mongoose.connection;
