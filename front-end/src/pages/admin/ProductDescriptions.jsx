import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'react-toastify';
import { FiRefreshCw, FiCheck, FiX, FiSparkles } from 'react-icons/fi';

export default function ProductDescriptions() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [generatedDescription, setGeneratedDescription] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const generateDescription = async (productId) => {
    try {
      setGenerating(productId);
      setSelectedProduct(productId);
      setGeneratedDescription('');

      const response = await api.post(`/recommendations/generate-description/${productId}`);

      if (response.data.success) {
        setGeneratedDescription(response.data.data.description);
        toast.success('Descrição gerada com sucesso!');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Erro ao gerar descrição');
    } finally {
      setGenerating(null);
    }
  };

  const updateProductDescription = async (productId, newDescription) => {
    try {
      await api.put(`/products/${productId}`, {
        description: newDescription
      });

      // Update local state
      setProducts(products.map(product =>
        product.id === productId
          ? { ...product, description: newDescription }
          : product
      ));

      setSelectedProduct(null);
      setGeneratedDescription('');
      toast.success('Descrição atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Erro ao atualizar produto');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Gerar Descrições com IA</h2>
        <div className="grid gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FiSparkles className="text-purple-600" size={24} />
        <h2 className="text-2xl font-bold">Gerar Descrições com IA</h2>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Sobre esta funcionalidade:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Usa IA (DeepSeek) para gerar descrições otimizadas para SEO</li>
          <li>• Analisa preço, categoria e características do produto</li>
          <li>• Cria descrições persuasivas que aumentam conversões</li>
          <li>• Somente administradores podem gerar e atualizar descrições</li>
        </ul>
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="font-semibold text-green-600">
                      $ {product.price?.toFixed(2)}
                    </span>
                    <Badge variant="outline">{product.category?.name}</Badge>
                    <span>Estoque: {product.stock}</span>
                  </div>
                </div>
                <Button
                  onClick={() => generateDescription(product.id)}
                  disabled={generating === product.id}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {generating === product.id ? (
                    <FiRefreshCw className="animate-spin" size={16} />
                  ) : (
                    <FiSparkles size={16} />
                  )}
                  {generating === product.id ? 'Gerando...' : 'Gerar IA'}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {product.description && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Descrição Atual:</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                    {product.description}
                  </p>
                </div>
              )}

              {selectedProduct === product.id && generatedDescription && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                    <FiSparkles className="text-purple-600" size={16} />
                    Descrição Gerada por IA:
                  </h4>

                  <Textarea
                    value={generatedDescription}
                    onChange={(e) => setGeneratedDescription(e.target.value)}
                    className="min-h-[100px] mb-3 border-purple-200 focus:border-purple-400"
                    placeholder="Edite a descrição gerada se necessário..."
                  />

                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateProductDescription(product.id, generatedDescription)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <FiCheck size={16} />
                      Salvar Descrição
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedProduct(null);
                        setGeneratedDescription('');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <FiX size={16} />
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <FiSparkles className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-600">Adicione produtos primeiro para gerar descrições com IA.</p>
        </div>
      )}
    </div>
  );
}