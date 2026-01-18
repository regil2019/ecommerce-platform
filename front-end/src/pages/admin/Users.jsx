import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { toast } from "sonner";
import api from "../../services/api";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', email: '', address: '' });
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/admin/users');
                console.log('Users data:', response.data);
                // The API returns { data: users, pagination: {...} }
                const usersData = response.data?.data || [];
                setUsers(Array.isArray(usersData) ? usersData : []);
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
            const response = await api.patch(`/admin/users/${userId}/role`, {
                role: newRole
            });

            // Atualizar a lista de usuários localmente
            setUsers(users.map(user =>
                user.id === userId
                    ? { ...user, role: newRole }
                    : user
            ));

            toast.success('Permissão do usuário atualizada com sucesso');
        } catch(err) {
            console.error('Erro ao atualizar role:', err);
            toast.error('Erro ao atualizar permissão do usuário');
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setEditForm({
            name: user.name || '',
            email: user.email || '',
            address: user.address || ''
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;

        setEditLoading(true);
        try {
            const response = await api.put(`/admin/users/${editingUser.id}`, editForm);

            // Atualizar a lista de usuários localmente
            setUsers(users.map(user =>
                user.id === editingUser.id
                    ? { ...user, ...editForm }
                    : user
            ));

            setIsEditDialogOpen(false);
            setEditingUser(null);
            toast.success('Usuário atualizado com sucesso');
        } catch (err) {
            console.error('Erro ao atualizar usuário:', err);
            toast.error(err.response?.data?.error || 'Erro ao atualizar usuário');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            await api.delete(`/admin/users/${userId}`);

            // Remover usuário da lista localmente
            setUsers(users.filter(user => user.id !== userId));

            toast.success('Usuário excluído com sucesso');
        } catch (err) {
            console.error('Erro ao excluir usuário:', err);
            toast.error(err.response?.data?.error || 'Erro ao excluir usuário');
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

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Nome</Label>
                            <Input
                                id="edit-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                disabled={editLoading}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                disabled={editLoading}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-address">Endereço</Label>
                            <Input
                                id="edit-address"
                                value={editForm.address}
                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                disabled={editLoading}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                            disabled={editLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleUpdateUser}
                            disabled={editLoading}
                        >
                            {editLoading ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
