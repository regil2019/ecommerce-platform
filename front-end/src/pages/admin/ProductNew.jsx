import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { toast } from "sonner";
import { createProduct } from "@/services/productApi";
import { fetchCategories } from "@/services/categoryApi";
import ImageUpload from "@/components/admin/ImageUpload";
import { AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const productSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
  price: z.coerce.number().positive("Preço deve ser positivo"),
  stock: z.coerce.number().int().min(0, "Estoque não pode ser negativo"),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  description: z.string().optional(),
});

export default function ProductNew({ onClose }) {
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showTips, setShowTips] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      price: "",
      stock: 0,
      categoryId: "",
      description: "",
    },
  });

  const watchedName = watch("name");
  useEffect(() => {
    if (watchedName) {
      const slug = watchedName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug);
    }
  }, [watchedName, setValue]);

  useEffect(() => {
    setLoadingCategories(true);
    fetchCategories()
      .then((response) => {
        console.log("🔥 CATEGORIAS BRUTAS:", response);
        // Processa os dados para garantir que seja um array de categorias
        // The API returns the array directly in response.data
        const categoriesArray = Array.isArray(response.data) ? response.data : [];
        setCategories(categoriesArray);
        console.log("✅ CATEGORIAS PROCESSADAS:", categoriesArray);
      })
      .catch((error) => {
        console.error("Erro ao carregar categorias:", error);
        toast.error("Erro ao carregar categorias");
      })
      .finally(() => setLoadingCategories(false));
  }, []);

  const onSubmit = async (data) => {
    console.log("🔥 SUBMIT DISPARADO - DADOS:", data);
    console.log("🔥 IMAGENS:", images);
    
    if (images.length === 0) {
      toast.error("Por favor, envie pelo menos uma imagem do produto.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: data.name,
        slug: data.slug,
        price: Number(data.price),
        stock: Number(data.stock),
        categoryId: Number(data.categoryId),
        description: data.description || "",
        images: images.map(url => url.trim()) // Clean URLs and ensure array format
      };

      console.log("PAYLOAD FINAL:", payload);
      await createProduct(payload);
      toast.success("Produto criado com sucesso!");
      // Força recarregamento da lista de produtos
      window.location.href = "/admin/products";
    } catch (error) {
      toast.error(error.message || "Erro ao criar produto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">📦 Novo Produto</CardTitle>
          <CardDescription className="text-muted-foreground">
            Preencha os detalhes do produto para adicioná-lo ao catálogo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showTips && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Dicas para criar um bom produto</AlertTitle>
              <AlertDescription className="text-blue-700 text-sm">
                 Use nomes claros e descritivos<br />
                 Adicione imagens de alta qualidade<br />
                 Seja detalhado na descrição<br />
                 Defina um preço competitivo
              </AlertDescription>
              <div className="mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 p-1 text-blue-600 hover:text-blue-800"
                  onClick={() => setShowTips(false)}
                >
                  <span className="text-xs">Ocultar dicas</span>
                </Button>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
            {/* Nome e Slug */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                  placeholder="Ex: iPhone 15 Pro Max"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  {...register("slug")}
                  className={errors.slug ? "border-red-500" : ""}
                  placeholder="iphone-15-pro-max"
                />
                {errors.slug && (
                  <p className="text-sm text-red-500">{errors.slug.message}</p>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                {...register("description")}
                rows={4}
                placeholder="Descreva as características do produto..."
              />
            </div>

            {/* Preço, Estoque e Categoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  className={errors.price ? "border-red-500" : ""}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Estoque *</Label>
                <Input
                  id="stock"
                  type="number"
                  {...register("stock", { valueAsNumber: true })}
                  className={errors.stock ? "border-red-500" : ""}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="text-sm text-red-500">{errors.stock.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoria *</Label>
                {loadingCategories ? (
                  <p className="text-sm text-muted-foreground">Carregando categorias...</p>
                ) : !Array.isArray(categories) || categories.length === 0 ? (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <p className="text-sm text-orange-800">
                      ⚠️ Nenhuma categoria encontrada. 
                      <Button 
                        type="button" 
                        variant="link" 
                        size="sm"
                        onClick={() => window.open('/admin/categories', '_blank')}
                        className="h-auto p-0 ml-1 text-orange-700 hover:text-orange-900"
                      >
                        Criar categorias
                      </Button>
                    </p>
                  </div>
                ) : (
                  <Select
                    onValueChange={(value) => setValue("categoryId", value)}
                    value={watch("categoryId") || ""}
                  >
                    <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent className="z-[10003]">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent >
                  </Select>
                )}
                {errors.categoryId && (
                  <p className="text-sm text-red-500">{errors.categoryId.message}</p>
                )}
              </div>
            </div>

            {/* Upload de Imagens */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <span className="text-lg">📸</span> Imagens do Produto *
                </Label>
                {images.length > 0 && (
                  <span className="text-sm text-green-600 font-medium">
                    ✅ {images.length} imagem(ns) selecionada(s)
                  </span>
                )}
              </div>

              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700 text-sm ml-2">
                  💡 <strong>Dica:</strong> Adicione pelo menos 3-5 imagens de alta qualidade para mostrar diferentes ângulos do produto.
                </AlertDescription>
              </Alert>

              <ImageUpload onUpload={(files) => setImages(files)} />

              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {images.slice(0, 3).map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-md border-2 border-primary"
                      />
                    </div>
                  ))}
                  {images.length > 3 && (
                    <div className="w-20 h-20 bg-gray-100 rounded-md border-2 border-gray-300 flex items-center justify-center">
                      <span className="text-sm text-gray-600">+{images.length - 3} mais</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                Cancelar
              </Button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="mr-2">🕒</span> Criando...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✨</span> Criar Produto
                  </>
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
