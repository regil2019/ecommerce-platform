import React, { useState, useEffect, useCallback } from "react";
import { Plus, MoreHorizontal, Image as ImageIcon } from "lucide-react";
import { Button } from "../../components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/badge";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "../../services/categoryApi";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import { getImageUrl } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

const CATEGORY_TYPES = [
  { value: "other", icon: "📦" },
  { value: "clothing", icon: "👕" },
  { value: "shoes", icon: "👟" },
  { value: "accessories", icon: "💍" },
  { value: "electronics", icon: "📱" },
  { value: "home_decor", icon: "🏠" },
  { value: "beauty", icon: "💄" },
  { value: "sports", icon: "⚽" },
  { value: "books", icon: "📚" },
  { value: "food", icon: "🍎" },
];


const CategoryCard = ({ category, onEdit, onDelete, t }) => {
  const typeIcon = CATEGORY_TYPES.find(ct => ct.value === category.categoryType)?.icon || "📦";
  return (
  <Card className="overflow-hidden transition-all hover:shadow-lg">
    <div className="relative aspect-video">
      {getImageUrl(category.image) ? (
        <img
          src={getImageUrl(category.image)}
          alt={category.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
          <span className="text-5xl">{typeIcon}</span>
        </div>
      )}
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(category)}>
              {t("common.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(category.id)}
              className="text-destructive"
            >
              {t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
        <Badge variant={category.isActive ? "default" : "secondary"}>
          {category.isActive ? t("common.active") : t("common.inactive")}
        </Badge>
      </div>
      {category.categoryType && category.categoryType !== 'other' && (
        <p className="text-xs text-primary font-medium mb-1">
          {typeIcon} {t(`categoryTypes.${category.categoryType}`) || category.categoryType}
        </p>
      )}
      <p className="text-sm text-muted-foreground line-clamp-2">
        {category.description}
      </p>
    </CardContent>
  </Card>
);};

const CategoryForm = ({
  isOpen,
  setIsOpen,
  editingCategory,
  onSave,
  categories,
  t,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
    parentId: null,
    categoryType: "other",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || "",
        slug: editingCategory.slug || "",
        description: editingCategory.description || "",
        image: editingCategory.image || "",
        isActive: editingCategory.isActive ?? true,
        parentId: editingCategory.parentId || null,
        categoryType: editingCategory.categoryType || "other",
      });
      setImagePreview(editingCategory.image || "");
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        image: "",
        isActive: true,
        parentId: null,
        categoryType: "other",
      });
      setImagePreview("");
      setFile(null);
    }
  }, [editingCategory, isOpen]);

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData((prev) => ({ ...prev, name, slug }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t("admin.categoryRequired"));
      return;
    }

    setLoading(true);

    try {
      const dataToSend = new FormData();

      dataToSend.append("name", formData.name.trim());
      dataToSend.append("slug", formData.slug.trim() || formData.name.trim()
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, ""));
      dataToSend.append("description", formData.description || "");
      dataToSend.append("isActive", formData.isActive.toString());
      dataToSend.append("categoryType", formData.categoryType || "other");

      if (file) {
        dataToSend.append("image", file);
      } else if (formData.image && !editingCategory) {
        dataToSend.append("image", formData.image);
      }

      await onSave(dataToSend, editingCategory?.id);
    } catch (error) {
      console.error(error);
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? t("admin.editCategory") : t("admin.newCategory")}
          </DialogTitle>
          <DialogDescription>
            {editingCategory ? t("admin.editCategoryDetails") : t("admin.createCategoryDesc")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("admin.fieldNameRequired")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">{t("admin.slugUrl")}</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryType">{t("admin.categoryType")}</Label>
            <Select
              value={formData.categoryType || "other"}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, categoryType: val }))}
              disabled={loading}
            >
              <SelectTrigger id="categoryType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_TYPES.map((ct) => (
                  <SelectItem key={ct.value} value={ct.value}>
                    {ct.icon} {t(`categoryTypes.${ct.value}`) || ct.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t("admin.categoryTypeDesc")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("admin.description")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("admin.formImage")}</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted hover:bg-muted/80 p-4 text-center"
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-24 w-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setFile(null);
                        setImagePreview("");
                        setFormData(prev => ({ ...prev, image: "" }));
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">{t("admin.clickToUpload")}</span> {t("admin.orDrag")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{t("admin.maxFileInfo")}</p>
                  </>
                )}
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={loading}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-1 bg-muted rounded-md">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
              disabled={loading}
            />
            <Label htmlFor="isActive" className="text-sm font-normal">
              {t("admin.categoryActive")}
            </Label>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? t("admin.saving") : (editingCategory ? t("admin.saveChanges") : t("admin.newCategory"))}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function Categories() {
  const { t } = useI18n();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchCategories();
      const fetchedCategories = Array.isArray(response.data) ? response.data : [];
      setCategories(fetchedCategories);
    } catch (err) {
      toast.error(t("common.errorLoad"));
      console.error(err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSave = async (data, id) => {
    try {
      if (id) {
        await updateCategory(id, data);
        toast.success(t("admin.categoryUpdated"));
      } else {
        await createCategory(data);
        toast.success(t("admin.categoryCreated"));
      }
      setIsFormOpen(false);
      setEditingCategory(null);
      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || t("common.error"));
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("admin.confirmDelete"))) {
      try {
        await deleteCategory(id);
        toast.success(t("admin.categoryDeleted"));
        loadCategories();
      } catch (err) {
        toast.error(err.message || t("common.error"));
        console.error(err);
      }
    }
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 lg:px-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("admin.categories")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("admin.categoriesCount", { count: categories.length })}
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> {t("admin.newCategory")}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-muted-foreground">{t("common.loadingCategories")}</div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">{t("admin.noCategoryYet")}</h3>
          <p className="text-muted-foreground mb-6">{t("admin.createFirstCategoryDesc")}</p>
          <Button onClick={handleAddNew}>{t("admin.createFirstCategory")}</Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDelete}
              t={t}
            />
          ))}
        </div>
      )}

      <CategoryForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        editingCategory={editingCategory}
        onSave={handleSave}
        categories={categories}
        t={t}
      />
    </div>
  );
}
