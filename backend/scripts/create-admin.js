import bcrypt from 'bcrypt';
import User from '../src/models/User.js';
import sequelize from '../src/config/database.js';

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco de dados.');

    const adminData = {
      name: 'Admin User',
      email: 'admin@regil.com',
      address: 'Admin Address',
      password: await bcrypt.hash('Admin123!', 10), // Senha forte
      role: 'admin'
    };

    // Verificar se já existe
    const existingAdmin = await User.findOne({ where: { email: adminData.email } });
    if (existingAdmin) {
      console.log('Admin já existe.');
      return;
    }

    const admin = await User.create(adminData);
    console.log('Admin criado com sucesso:', admin.email);
  } catch (error) {
    console.error('Erro ao criar admin:', error);
  } finally {
    await sequelize.close();
  }
}

createAdmin();