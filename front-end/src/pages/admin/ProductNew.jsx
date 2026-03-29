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
import { createProduct, updateProduct } from "@/services/productApi";
import { fetchCategories } from "@/services/categoryApi";
import ImageUpload from "@/components/admin/ImageUpload";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useI18n } from "@/i18n";
import { getImageUrl } from "@/lib/utils";

const SIZE_OPTIONS = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  shoes: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"],
  accessories: ["One Size", "S/M", "M/L"],
  sports: ["XS", "S", "M", "L", "XL", "XXL"],
  other: [],
  electronics: [],
  home_decor: [],
  beauty: [],
  books: [],
  food: [],
};


export default function ProductNew({ onClose, editingProduct = null }) {
  const { t } = useI18n();
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showTips, setShowTips] = useState(true);

  const productSchema = z.object({
    name: z.string().min(3, t("common.minLength", { count: 3 })),
    slug: z.string().min(3, t("common.minLength", { count: 3 })),
    price: z.coerce.number().positive(t("common.error")),
    stock: z.coerce.number().int().min(0, t("common.error")),
    categoryId: z.string().min(1, t("common.error")),
    description: z.string().optional(),
  });

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
  const watchedCategoryId = watch("categoryId");
  const selectedCategory = categories.find(c => String(c.id) === String(watchedCategoryId));
  const availableSizes = SIZE_OPTIONS[selectedCategory?.categoryType] || [];

  // Pre-fill form when editing
  useEffect(() => {
    if (editingProduct) {
      setValue("name", editingProduct.name || "");
      setValue("slug", editingProduct.slug || "");
      setValue("price", editingProduct.price || "");
      setValue("stock", editingProduct.stock ?? 0);
      setValue("categoryId", String(editingProduct.categoryId || ""));
      setValue("description", editingProduct.description || "");
      if (editingProduct.images?.length) setImages(editingProduct.images);
      if (editingProduct.sizes?.length) setSelectedSizes(editingProduct.sizes);
    }
  }, [editingProduct, setValue]);

  useEffect(() => {
    if (watchedName && !editingProduct) {
      const slug = watchedName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug);
    }
  }, [watchedName, setValue, editingProduct]);

  useEffect(() => {
    setLoadingCategories(true);
    fetchCategories()
      .then((response) => {
        const categoriesArray = Array.isArray(response.data) ? response.data : [];
        setCategories(categoriesArray);
      })
      .catch((error) => {
        console.error("Categories load error:", error);
        toast.error(t("common.errorLoad"));
      })
      .finally(() => setLoadingCategories(false));
  }, []);

  const onSubmit = async (data) => {
    if (images.length === 0 && !editingProduct) {
      toast.error(t("admin.imageRequired"));
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
        images: images.map((url) => url.trim()),
        sizes: selectedSizes.length > 0 ? selectedSizes : null,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        toast.success(t("admin.productUpdated"));
        onClose();
      } else {
        await createProduct(payload);
        toast.success(t("admin.productCreated"));
        window.location.href = "/admin/products";
      }
    } catch (error) {
      toast.error(error.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            {editingProduct ? t("admin.editProductTitle") : t("admin.newProduct")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("admin.newProductDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showTips && (
            <Alert className="border-primary/20 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary">{t("admin.productTips")}</AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground">
                {t("admin.productTipsDesc")}
              </AlertDescription>
              <div className="mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 p-1 text-primary hover:text-primary/80"
                  onClick={() => setShowTips(false)}
                >
                  <span className="text-xs">{t("common.hide")}</span>
                </Button>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t("common.name")} *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  className={errors.name ? "border-destructive" : ""}
                  placeholder="Ex: iPhone 15 Pro Max"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  {...register("slug")}
                  className={errors.slug ? "border-destructive" : ""}
                  placeholder="iphone-15-pro-max"
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("admin.description")}</Label>
              <Textarea
                id="description"
                {...register("description")}
                rows={4}
                placeholder={t("admin.descriptionPlaceholder")}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">{t("admin.price")} *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  className={errors.price ? "border-destructive" : ""}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">{t("admin.stock")} *</Label>
                <Input
                  id="stock"
                  type="number"
                  {...register("stock", { valueAsNumber: true })}
                  className={errors.stock ? "border-destructive" : ""}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="text-sm text-destructive">{errors.stock.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">{t("admin.category")} *</Label>
                {loadingCategories ? (
                  <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
                ) : !Array.isArray(categories) || categories.length === 0 ? (
                  <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      ⚠️ {t("admin.noCategories")}{" "}
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => window.open("/admin/categories", "_blank")}
                        className="ml-1 h-auto p-0"
                      >
                        {t("admin.createCategory")}
                      </Button>
                    </p>
                  </div>
                ) : (
                  <Select
                    onValueChange={(value) => setValue("categoryId", value)}
                    value={watch("categoryId") || ""}
                  >
                    <SelectTrigger className={errors.categoryId ? "border-destructive" : ""}>
                      <SelectValue placeholder={t("common.selectOption")} />
                    </SelectTrigger>
                    <SelectContent className="z-[10003]">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.categoryId && (
                  <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                )}
              </div>
            </div>

            {/* Size selector - shown when category type has sizes */}
            {availableSizes.length > 0 && (
              <div className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-4">
                <div>
                  <Label className="text-sm font-semibold">{t("admin.productSizes")}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("admin.productSizesDesc")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() =>
                        setSelectedSizes((prev) =>
                          prev.includes(size)
                            ? prev.filter((s) => s !== size)
                            : [...prev, size]
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedSizes.includes(size)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-primary/50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSizes.length > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ✓ {selectedSizes.length} size(s) selected: {selectedSizes.join(", ")}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  {t("admin.productImages")} *
                </Label>
                {images.length > 0 && (
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    ✅ {t("admin.imagesSelected", { count: images.length })}
                  </span>
                )}
              </div>

              <Alert className="border-yellow-500/30 bg-yellow-500/10">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="ml-2 text-sm text-yellow-700 dark:text-yellow-400">
                  {t("admin.imageTip")}
                </AlertDescription>
              </Alert>

              <ImageUpload onUpload={(files) => setImages(files)} />

              {images.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {images.slice(0, 3).map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={getImageUrl(image)}
                        alt={`Preview ${index + 1}`}
                        className="h-20 w-20 rounded-md border-2 border-primary object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                  {images.length > 3 && (
                    <div className="flex h-20 w-20 items-center justify-center rounded-md border-2 border-border bg-muted">
                      <span className="text-sm text-muted-foreground">+{images.length - 3}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? t("common.loading") : (editingProduct ? t("admin.updateProduct") : t("admin.createProduct"))}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
