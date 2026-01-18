import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

// Model Category direto
const Category = sequelize.define('Category', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING,
  slug: Sequelize.STRING
});

(async () => {
  try {
    console.log('🔍 Config:', {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      name: process.env.DB_NAME
    });
    
    await sequelize.authenticate();
    console.log('✅ MySQL conectado');

    await sequelize.sync();

    const categories = [
      { name: 'Eletrônicos', slug: 'eletronicos' },
      { name: 'Roupas', slug: 'roupas' },
      { name: 'Casa', slug: 'casa' },
      { name: 'Esportes', slug: 'esportes' },
      { name: 'Livros', slug: 'livros' }
    ];

    for (const cat of categories) {
      const [category, created] = await Category.findOrCreate({
        where: { slug: cat.slug },
        defaults: cat
      });
      console.log(created ? `✅ Criada: ${category.name}` : `ℹ️ Existe: ${category.name}`);
    }

    console.log('🎉 Categorias criadas!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
})();
