import React, { useState, useEffect } from "react";
import api from "../../services/api";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/api/admin/users');
                console.log('Users data:', response.data);
                setUsers(Array.isArray(response.data) ? response.data : []);
            } catch(err) {
                setError("Erro ao carregar usuários");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const updateUserRole = async (userId, newRole) => {
        try {
            const response = await api.patch(`/api/admin/users/${userId}/role`, {
                role: newRole
            });
            
            // Atualizar a lista de usuários localmente
            setUsers(users.map(user => 
                user.id === userId 
                    ? { ...user, role: newRole }
                    : user
            ));
            
            console.log('Role atualizada:', response.data);
        } catch(err) {
            console.error('Erro ao atualizar role:', err);
            alert('Erro ao atualizar permissão do usuário');
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Carregando usuários...</div>;
    }
    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 mx-auto mt-8 max-w-6xl">
            <h2 className="mb-6 text-2xl font-bold">Gerenciamento de Usuários</h2>
            {users.length === 0 ? (
                <p>Nenhum usuário encontrado.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-2 border">ID</th>
                                <th className="px-4 py-2 border">Nome</th>
                                <th className="px-4 py-2 border">Email</th>
                                <th className="px-4 py-2 border">Endereço</th>
                                <th className="px-4 py-2 border">Função</th>
                                <th className="px-4 py-2 border">Data de Cadastro</th>
                                <th className="px-4 py-2 border">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border">{user.id}</td>
                                    <td className="px-4 py-2 border">{user.name}</td>
                                    <td className="px-4 py-2 border">{user.email}</td>
                                    <td className="px-4 py-2 border">{user.address || 'Não informado'}</td>
                                    <td className="px-4 py-2 border">
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => updateUserRole(user.id, 'admin')}
                                                className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Tornar Admin
                                            </button>
                                        )}
                                        {user.role === 'admin' && (
                                            <button
                                                onClick={() => updateUserRole(user.id, 'user')}
                                                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Remover Admin
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
