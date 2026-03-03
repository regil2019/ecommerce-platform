
import db from './src/config/database.js';
import User from './src/models/User.js';

async function checkUser() {
    try {
        await db.authenticate();
        console.log('Conexão bem sucedida.');

        const user = await User.findOne({ where: { email: 'admin@regil.com' } });

        if (user) {
            console.log('✅ Usuário encontrado no banco de dados local:');
            console.log(JSON.stringify(user.toJSON(), null, 2));
        } else {
            console.log('❌ Usuário NÃO encontrado no banco de dados local.');
        }
    } catch (error) {
        console.error('Erro ao conectar:', error);
    } finally {
        await db.close();
    }
}

checkUser();
