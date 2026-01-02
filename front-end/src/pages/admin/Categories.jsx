import React, { useState, useEffect } from "react";
import api from "../../services/api";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/api/admin/categories');
            console.log('Categories data:', response.data);
            setCategories(response.data.data || []);
        } catch(err) {
            setError("Erro ao carregar categorias");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await api.put(`/api/admin/categories/${editingCategory.id}`, formData);
                alert('Categoria atualizada com sucesso!');
            } else {
                await api.post('/api/admin/categories', formData);
                alert('Categoria criada com sucesso!');
            }
            setFormData({ name: '' });
            setShowCreateForm(false);
            setEditingCategory(null);
            fetchCategories();
        } catch(err) {
            console.error('Erro ao salvar categoria:', err);
            alert(err.response?.data?.error || 'Erro ao salvar categoria');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({ name: category.name });
        setShowCreateForm(true);
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) {
            return;
        }

        try {
            await api.delete(`/api/admin/categories/${categoryId}`);
            alert('Categoria excluída com sucesso!');
            fetchCategories();
        } catch(err) {
            console.error('Erro ao excluir categoria:', err);
            alert(err.response?.data?.error || 'Erro ao excluir categoria');
        }
    };

    const resetForm = () => {
        setFormData({ name: '' });
        setShowCreateForm(false);
        setEditingCategory(null);
    };

    if (loading) {
        return <div className="p-8 text-center">Carregando categorias...</div>;
    }
    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 mx-auto mt-8 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gerenciamento de Categorias</h2>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Nova Categoria
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                        {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome da Categoria
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Digite o nome da categoria"
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                {editingCategory ? 'Atualizar' : 'Criar'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {categories.length === 0 ? (
                <p>Nenhuma categoria encontrada.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-2 border">ID</th>
                                <th className="px-4 py-2 border">Nome</th>
                                <th className="px-4 py-2 border">Data de Criação</th>
                                <th className="px-4 py-2 border">Última Atualização</th>
                                <th className="px-4 py-2 border">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border">{category.id}</td>
                                    <td className="px-4 py-2 border">{category.name}</td>
                                    <td className="px-4 py-2 border">
                                        {new Date(category.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {new Date(category.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 sm:px-3 sm:py-1 rounded text-sm sm:text-sm"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 sm:px-3 sm:py-1 rounded text-sm sm:text-sm"
                                            >
                                                Excluir
                                            </button>
                                        </div>
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
