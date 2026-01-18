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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "../../services/categoryApi";
import { toast } from "sonner";

const CategoryCard = ({ category, onEdit, onDelete }) => (
  <Card className="overflow-hidden transition-all hover:shadow-lg">
    <div className="relative aspect-video">
      <img
        src={category.image || "/images/placeholder.jpg"}
        alt={category.name}
        className="h-full w-full object-cover"
      />
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(category)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(category.id)}
              className="text-red-600"
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{category.name}</h3>
        <Badge variant={category.isActive ? "default" : "secondary"}>
          {category.isActive ? "Ativa" : "Inativa"}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {category.productCount || 0} produtos
      </p>
      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
        {category.description}
      </p>
    </CardContent>
  </Card>
);

const CategoryForm = ({
  isOpen,
  setIsOpen,
  editingCategory,
  onSave,
  categories,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
    parentId: null,
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
    
    // ✅ VALIDAÇÃO OBRIGATÓRIA
    if (!formData.name.trim()) {
      toast.error("Nome da categoria é obrigatório!");
      return;
    }

    setLoading(true);
    
    try {
      const dataToSend = new FormData();
      
      // ✅ ADICIONA CAMPOS COM VALORES VÁLIDOS
      dataToSend.append("name", formData.name.trim());
      dataToSend.append("slug", formData.slug.trim() || formData.name.trim()
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, ""));
      dataToSend.append("description", formData.description || "");
      dataToSend.append("isActive", formData.isActive.toString());

      // ✅ ADICIONA IMAGEM SE existir
      if (file) {
        dataToSend.append("image", file);
      } else if (formData.image && !editingCategory) {
        dataToSend.append("image", formData.image);
      }

      console.log("📤 Enviando:", {
        name: formData.name,
        slug: formData.slug,
        hasImage: !!file
      });

      await onSave(dataToSend, editingCategory?.id);
    } catch (error) {
      console.error("❌ Erro no submit:", error);
      toast.error("Erro ao salvar categoria");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory ? "Edite os detalhes da categoria existente" : "Crie uma nova categoria para organizar seus produtos"}
              </DialogDescription>
            </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
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
            <Label htmlFor="description">Descrição</Label>
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
            <Label>Imagem</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 p-4 text-center"
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
                    <ImageIcon className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Clique para enviar</span> ou arraste
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG (máx 2MB)</p>
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
              Categoria ativa
            </Label>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : (editingCategory ? "Salvar Alterações" : "Criar Categoria")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchCategories();
      // The API returns response.data as an array
      const fetchedCategories = Array.isArray(response.data) ? response.data : [];
      setCategories(fetchedCategories);
    } catch (err) {
      toast.error("Erro ao carregar categorias.");
      console.error(err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSave = async (data, id) => {
    console.log("🔥 handleSave chamado:", { 
      id, 
      dataEntries: Array.from(data.entries()).map(([k,v]) => [k, v instanceof File ? `${v.name} (${v.size}B)` : v]) 
    });
    
    try {
      if (id) {
        await updateCategory(id, data);
        toast.success("Categoria atualizada com sucesso!");
      } else {
        await createCategory(data);
        toast.success("Categoria criada com sucesso!");
      }
      setIsFormOpen(false);
      setEditingCategory(null);
      loadCategories();
    } catch (err) {
      console.error("❌ ERRO:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || err.message || "Erro ao salvar categoria.");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      try {
        await deleteCategory(id);
        toast.success("Categoria excluída com sucesso!");
        loadCategories();
      } catch (err) {
        toast.error(err.message || "Erro ao excluir categoria.");
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
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground mt-1">
            {categories.length} categorias {categories.length === 1 ? 'cadastrada' : 'cadastradas'}
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-muted-foreground">Carregando categorias...</div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma categoria</h3>
          <p className="text-muted-foreground mb-6">Crie sua primeira categoria para começar.</p>
          <Button onClick={handleAddNew}>Criar primeira categoria</Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
      />
    </div>
  );
}
