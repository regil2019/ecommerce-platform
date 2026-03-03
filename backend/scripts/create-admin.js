import bcrypt from 'bcrypt';
import User from '../src/models/User.js';
import sequelize from '../src/config/database.js';

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const password = await bcrypt.hash('Admin123!', 10);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@regil.com' } });

    if (existingAdmin) {
      // Update the password (fix broken 90-round hash)
      await existingAdmin.update({ password });
      console.log('Admin password reset successfully:', existingAdmin.email);
    } else {
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@regil.com',
        address: 'Admin Address',
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