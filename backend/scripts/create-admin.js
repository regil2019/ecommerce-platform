import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import sequelize from '../src/config/database.js';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const password = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: ADMIN_EMAIL } });

    if (existingAdmin) {
      await existingAdmin.update({ password });
      console.log('Admin password reset successfully:', existingAdmin.email);
    } else {
      const admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        address: '',
        password,
        role: 'admin'
      });
      console.log('Admin created successfully:', admin.email);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

createAdmin();