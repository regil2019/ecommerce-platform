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
import { useI18n } from "@/i18n";

export default function Users() {
    const { t } = useI18n();
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
                const usersData = response.data?.data || [];
                setUsers(Array.isArray(usersData) ? usersData : []);
            } catch (err) {
                setError(t('common.errorLoad'));
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [t]);

    const updateUserRole = async (userId, newRole) => {
        try {
            await api.patch(`/admin/users/${userId}/role`, { role: newRole });
            setUsers(users.map(user =>
                user.id === userId ? { ...user, role: newRole } : user
            ));
            toast.success(t('admin.updateRoleSuccess'));
        } catch (err) {
            console.error(err);
            toast.error(t('admin.updateRoleError'));
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
            await api.put(`/admin/users/${editingUser.id}`, editForm);
            setUsers(users.map(user =>
                user.id === editingUser.id ? { ...user, ...editForm } : user
            ));
            setIsEditDialogOpen(false);
            setEditingUser(null);
            toast.success(t('admin.userUpdated'));
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || t('common.error'));
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm(t('admin.deleteUserConfirm'))) {
            return;
        }
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(users.filter(user => user.id !== userId));
            toast.success(t('admin.userDeleted'));
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || t('common.error'));
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-foreground">{t('admin.loadingUsers')}</div>;
    }
    if (error) {
        return <div className="text-center text-destructive">{error}</div>;
    }

    return (
        <div className="p-4 mx-auto mt-8 max-w-6xl">
            <h2 className="mb-6 text-2xl font-bold text-foreground">{t('admin.userManagement')}</h2>
            {users.length === 0 ? (
                <p className="text-muted-foreground">{t('admin.noUsersFound')}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-card border border-border">
                        <thead>
                            <tr className="bg-muted">
                                <th className="px-4 py-2 border border-border text-foreground">ID</th>
                                <th className="px-4 py-2 border border-border text-foreground">{t('common.name')}</th>
                                <th className="px-4 py-2 border border-border text-foreground">{t('common.email')}</th>
                                <th className="px-4 py-2 border border-border text-foreground">{t('admin.address')}</th>
                                <th className="px-4 py-2 border border-border text-foreground">{t('common.role')}</th>
                                <th className="px-4 py-2 border border-border text-foreground">{t('admin.registrationDate')}</th>
                                <th className="px-4 py-2 border border-border text-foreground">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/50">
                                    <td className="px-4 py-2 border border-border text-foreground">{user.id}</td>
                                    <td className="px-4 py-2 border border-border text-foreground">{user.name}</td>
                                    <td className="px-4 py-2 border border-border text-foreground">{user.email}</td>
                                    <td className="px-4 py-2 border border-border text-foreground">{user.address || t('profile.notProvided')}</td>
                                    <td className="px-4 py-2 border border-border">
                                        <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                            'bg-muted text-muted-foreground'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 border border-border text-foreground">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2 border border-border">
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => updateUserRole(user.id, 'admin')}
                                                className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                                            >
                                                {t('admin.makeAdmin')}
                                            </button>
                                        )}
                                        {user.role === 'admin' && (
                                            <button
                                                onClick={() => updateUserRole(user.id, 'user')}
                                                className="bg-muted hover:bg-muted/80 text-foreground px-3 py-1 rounded text-sm"
                                            >
                                                {t('admin.removeAdmin')}
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
                        <DialogTitle>{t('admin.editUser')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">{t('common.name')}</Label>
                            <Input
                                id="edit-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                disabled={editLoading}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-email">{t('common.email')}</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                disabled={editLoading}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-address">{t('admin.address')}</Label>
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
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleUpdateUser}
                            disabled={editLoading}
                        >
                            {editLoading ? t('admin.saving') : t('common.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
