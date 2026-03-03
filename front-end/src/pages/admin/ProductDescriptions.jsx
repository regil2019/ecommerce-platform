import React, { useState, useEffect } from "react";
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'react-toastify';
import { RefreshCw, Check, X, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n';

export default function ProductDescriptions() {
  const { t } = useI18n();
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
      toast.error(t('common.errorLoad'));
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
        toast.success(t('admin.descriptionGenerated'));
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error(t('common.error'));
    } finally {
      setGenerating(null);
    }
  };

  const updateProductDescription = async (productId, newDescription) => {
    try {
      await api.put(`/products/${productId}`, {
        description: newDescription
      });

      setProducts(products.map(product =>
        product.id === productId
          ? { ...product, description: newDescription }
          : product
      ));

      setSelectedProduct(null);
      setGeneratedDescription('');
      toast.success(t('admin.descriptionUpdated'));
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(t('common.error'));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">{t('admin.aiDescriptions')}</h2>
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
        <Sparkles className="text-purple-600" size={24} />
        <h2 className="text-2xl font-bold text-foreground">{t('admin.aiDescriptions')}</h2>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">{t('admin.aboutFeature')}</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• {t('admin.aiFeature1')}</li>
          <li>• {t('admin.aiFeature2')}</li>
          <li>• {t('admin.aiFeature3')}</li>
          <li>• {t('admin.aiFeature4')}</li>
        </ul>
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-semibold text-green-600">
                      $ {product.price?.toFixed(2)}
                    </span>
                    <Badge variant="outline">{product.category?.name}</Badge>
                    <span>{t('admin.stock')}: {product.stock}</span>
                  </div>
                </div>
                <Button
                  onClick={() => generateDescription(product.id)}
                  disabled={generating === product.id}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {generating === product.id ? (
                    <RefreshCw className="animate-spin mr-1" size={16} />
                  ) : (
                    <Sparkles className="mr-1" size={16} />
                  )}
                  {generating === product.id ? t('admin.generating') : t('admin.generateAI')}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {product.description && (
                <div className="mb-4">
                  <h4 className="font-medium text-foreground mb-2">{t('admin.currentDescription')}</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded border border-border">
                    {product.description}
                  </p>
                </div>
              )}

              {selectedProduct === product.id && generatedDescription && (
                <div className="border-t border-border pt-4">
                  <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                    <Sparkles className="text-purple-600" size={16} />
                    {t('admin.aiGenerated')}
                  </h4>

                  <Textarea
                    value={generatedDescription}
                    onChange={(e) => setGeneratedDescription(e.target.value)}
                    className="min-h-[100px] mb-3 border-purple-200 focus:border-purple-400"
                    placeholder={t('admin.editDescription')}
                  />

                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateProductDescription(product.id, generatedDescription)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="mr-1" size={16} />
                      {t('admin.saveDescription')}
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedProduct(null);
                        setGeneratedDescription('');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <X className="mr-1" size={16} />
                      {t('common.cancel')}
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
          <Sparkles className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="text-lg font-medium text-foreground mb-2">{t('admin.noProductsFound')}</h3>
          <p className="text-muted-foreground">{t('admin.addProductsFirst')}</p>
        </div>
      )}
    </div>
  );
}