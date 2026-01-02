import db from "../src/config/database.js";
import Category from "../src/models/Category.js";

async function createSampleCategories() {
  try {
    await db.authenticate();
    console.log("✔ Conexão com o banco estabelecida");

    // Sample categories to create
    const sampleCategories = [
      "Eletrônicos",
      "Roupas",
      "Casa e Decoração",
      "Esportes",
      "Livros",
      "Calçados"
      
    ];

    for (const categoryName of sampleCategories) {
      try {
        // Check if category already exists
        const existingCategory = await Category.findOne({ 
          where: { name: categoryName } 
        });

        if (existingCategory) {
          console.log(`ℹ️ Categoria "${categoryName}" já existe`);
        } else {
          const category = await Category.create({ name: categoryName });
          console.log(`✅ Categoria criada: ${category.name} (ID: ${category.id})`);
        }
      } catch (error) {
        console.error(`❌ Erro ao criar categoria "${categoryName}":`, error.message);
      }
    }

    console.log("\n📋 Lista de categorias existentes:");
    const allCategories = await Category.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });
    
    allCategories.forEach(cat => {
      console.log(`- ${cat.id}: ${cat.name}`);
    });

  } catch (error) {
    console.error("❌ Erro geral:", error.message);
  } finally {
    await db.close();
    console.log("\n🔒 Conexão com o banco fechada");
  }
}

createSampleCategories();
