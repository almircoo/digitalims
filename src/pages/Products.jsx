import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/layouts/MainLayout";
import { Sidebar } from "@/layouts/Sidebar";
import { DataTable } from "@/components/DataTable";
import { FormModal } from "@/components/FormModal";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { PermissionGuard } from "@/components/PermissionGuard";
import { RoleGuard } from "@/components/RoleGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getProducts,
  addProduct,
  updateProduct,
  removeProduct,
  getCategories,
} from "@/apis";
import { PERMISSIONS } from "@/config/permissions";
import {
  normalizeArray,
  normalizeProduct,
  normalizeCategory,
} from "@/lib/dataMapper";
import { toast } from "sonner";

export const Products = () => {
  const { token, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoriaId: "",
    modelo: "",
    marca: "",
    color: "",
  });

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsResult, categoriesResult] = await Promise.allSettled([
        getProducts(token),
        getCategories(token),
      ]);

      // Manejar Productos
      if (productsResult.status === "fulfilled") {
        const productsRes = productsResult.value;
        console.log("Datos de producto: ", productsRes);
        setProducts(normalizeArray(productsRes.datos || [], normalizeProduct));
      } else {
        // Error solo en la carga de productos
        console.error("Error al cargar productos:", productsResult.reason);
        toast.warning("Advertencia: No se pudieron cargar los productos.");
      }

      // Manejar Categorías
      if (categoriesResult.status === "fulfilled") {
        const categoriesRes = categoriesResult.value;
        console.log("Datos de categoria: ", categoriesRes);
        setCategories(
          normalizeArray(
            categoriesRes.datos || categoriesRes.data || [],
            normalizeCategory,
          ),
        );
      } else {
        // Error solo en la carga de categorías
        console.error("Error al cargar categorías:", categoriesResult.reason);
        toast.error("Advertencia: No se pudieron cargar las categorías.");
      }
    } catch (error) {
      console.error("Error general:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: product.precio,
        stock: product.stock,
        categoriaId: product.categoriaId,
        modelo: product.modelo,
        marca: product.marca,
        color: product.color,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        categoriaId: "",
        modelo: "",
        marca: "",
        color: "",
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoriaId) {
      toast.error("Debes seleccionar una categoría");
      return;
    }
    setFormLoading(true);
    try {
      const submitData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: Number.parseFloat(formData.precio),
        stock: Number.parseInt(formData.stock),
        categoriaId: Number.parseInt(formData.categoriaId),
        modelo: formData.modelo,
        marca: formData.marca,
        color: formData.color,
      };
      if (editingProduct) {
        await updateProduct(editingProduct.id, submitData, token);
        toast.success("Producto actualizado");
      } else {
        await addProduct(submitData, token);
        toast.success("Producto creado");
      }
      setModalOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.message || "Error al guardar producto");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await removeProduct(deleteTarget.id, token);
      toast.success("Producto eliminado");
      setDeleteOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.message || "Error al eliminar producto");
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "descripcion", label: "Descripción" },
    { key: "categoria.nombre", label: "Categoría" },
    { key: "precio", label: "Precio" },
    { key: "stock", label: "Stock" },
    { key: "marca", label: "Marca" },
  ];

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="sticky top-20">
              <Sidebar />
            </div>
          </div>
          <div className="md:col-span-3">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Productos</h1>
                <PermissionGuard action={PERMISSIONS.CREATE_PRODUCT}>
                  <Button onClick={() => handleOpenModal()} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Producto
                  </Button>
                </PermissionGuard>
              </div>

              {user?.role === "USER" && (
                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                  Puedes ver productos. Solo administradores pueden crear,
                  editar o eliminar.
                </div>
              )}

              <DataTable
                columns={columns}
                data={products}
                loading={loading}
                onEdit={(product) => {
                  if (
                    !PERMISSIONS.ACTIONS.UPDATE_PRODUCT.includes(user?.role)
                  ) {
                    toast.error("No tienes permiso para editar productos");
                    return;
                  }
                  handleOpenModal(product);
                }}
                onDelete={(product) => {
                  if (
                    !PERMISSIONS.ACTIONS.DELETE_PRODUCT.includes(user?.role)
                  ) {
                    toast.error("No tienes permiso para eliminar productos");
                    return;
                  }
                  setDeleteTarget(product);
                  setDeleteOpen(true);
                }}
              />

              <FormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
                onSubmit={handleSubmit}
                loading={formLoading}
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="descripcion">Descripción *</Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          descripcion: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select
                      value={formData.categoriaId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, categoriaId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="precio">Precio *</Label>
                      <Input
                        id="precio"
                        type="number"
                        step="0.01"
                        value={formData.precio}
                        onChange={(e) =>
                          setFormData({ ...formData, precio: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock *</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({ ...formData, stock: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="marca">Marca</Label>
                      <Input
                        id="marca"
                        value={formData.marca}
                        onChange={(e) =>
                          setFormData({ ...formData, marca: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="modelo">Modelo</Label>
                      <Input
                        id="modelo"
                        value={formData.modelo}
                        onChange={(e) =>
                          setFormData({ ...formData, modelo: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) =>
                          setFormData({ ...formData, color: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </FormModal>

              <DeleteConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Eliminar Producto"
                description={`¿Estás seguro de que deseas eliminar "${deleteTarget?.nombre}"?`}
                onConfirm={handleDelete}
                loading={formLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
