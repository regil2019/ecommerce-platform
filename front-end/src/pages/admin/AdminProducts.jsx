import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import ImageUpload from '../../components/admin/ImageUpload.jsx'; // Atualização da importação
import { Table, TableHead, TableRow, TableCell, TableBody } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    stock: 0,
    description: '',
    categoryId: null,
    images: [], // array de URLs
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
        ]);
        setProducts(productsRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Falha ao carregar dados');
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        price: formData.price,
        stock: formData.stock,
        description: formData.description,
        categoryId: formData.categoryId,
        images: formData.images,
      };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success('Produto atualizado!');
      } else {
        await api.post('/products', payload);
        toast.success('Produto criado!');
      }
      const { data: productsData } = await api.get('/products');
      setProducts(productsData);
      setShowForm(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
      toast.success('Produto excluído!');
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao excluir produto';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      categoryId: product.categoryId,
      images: product.images || [],
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  return (
    <div className="p-3 max-w-7xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestão de Produtos</h1>
        <Button onClick={() => setShowForm(true)} variant="success" className="mb-4">
          + Novo Produto
        </Button>
      </div>

      {/* Lista de produtos */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded">
              <Skeleton className="w-12 h-12 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="space-x-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Table className="border rounded-lg overflow-hidden">
        <TableHead className="bg-gray-100 sticky top-0">
          <TableRow>
            <TableCell className="w-[100px]">Imagem</TableCell>
            <TableCell>Nome</TableCell>
            <TableCell>Preço</TableCell>
            <TableCell>Estoque</TableCell>
            <TableCell>Categoria</TableCell>
            <TableCell className="text-right">Ações</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {products?.length > 0 ? (
            products.map((product) => (
              <TableRow key={product.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex gap-1">
                    {(product.images?.length ? product.images : [product.image || '/images/placeholder-product.jpg']).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={product.name}
                        className="object-cover w-12 h-12 rounded border"
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.category?.name || product.category}</TableCell>
                <TableCell>
                  <Button variant="primary" onClick={() => handleEdit(product)} className="mr-2">Editar</Button>
                  <Button variant="destructive" onClick={() => { setDeleteId(product.id); setShowDeleteModal(true); }}>
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Nenhum produto encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      )}

      {/* Modal do formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-xl">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? 'Editar Produto' : 'Novo Produto'}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Nome do produto"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {formData.name === '' && <p className="text-red-500 text-sm mt-1">Nome é obrigatório</p>}
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Preço"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
                {formData.price <= 0 && <p className="text-red-500 text-sm mt-1">Preço deve ser maior que 0</p>}
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Estoque"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
                {formData.stock < 0 && <p className="text-red-500 text-sm mt-1">Estoque não pode ser negativo</p>}
              </div>
              <div>
                <select
                  value={formData.categoryId || ""}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {!formData.categoryId && <p className="text-red-500 text-sm mt-1">Categoria é obrigatória</p>}
              </div>
              {/* Preview das imagens e upload */}
              {formData.images && formData.images.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {formData.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Preview ${idx + 1}`} className="w-24 h-24 object-cover rounded" />
                  ))}
                </div>
              )}
              <ImageUpload onUpload={(urls) => setFormData({ ...formData, images: urls })} />
              <div className="flex gap-4 mt-6">
                <Button type="button" onClick={() => setShowForm(false)} variant="secondary" className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                  {editingId ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Confirmar exclusão?</h2>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => { handleDelete(deleteId); setShowDeleteModal(false); }}>Excluir</Button>
          </div>
        </div>
      </Modal>

      {/* Adicione paginação no final */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Mostrando {products.length} de {totalProducts} produtos
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Anterior
          </Button>
          <Button variant="outline" onClick={() => setPage(p => p + 1)}>
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
