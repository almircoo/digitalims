import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RoleGuard } from "@/components/RoleGuard";
import { PermissionGuard } from "@/components/PermissionGuard";
import { MainLayout } from "@/layouts/MainLayout";
import { Sidebar } from "@/layouts/Sidebar";
import { DataTable } from "@/components/DataTable";
import { FormModal } from "@/components/FormModal";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import {
  getCategories,
  addCategory,
  updateCategory,
  removeCategory,
} from "@/apis";
import { PERMISSIONS } from "@/config/permissions";
import { toast } from "sonner";

export const Categories = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });

  useEffect(() => {
    loadCategories();
  }, [token]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log(
        "Loading categories with token:",
        token ? "present" : "missing",
      );
      const response = await getCategories(token);
      console.log("Categories response:", response);
      setCategories(response.datos || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        nombre: category.nombre,
        descripcion: category.descripcion || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({ nombre: "", descripcion: "" });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.idCategoria, formData, token);
        toast.success("Categoría actualizada");
      } else {
        await addCategory(formData, token);
        toast.success("Categoría creada");
      }
      setModalOpen(false);
      loadCategories();
    } catch (error) {
      toast.error(error.message || "Error al guardar categoría");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await removeCategory(deleteTarget.idCategoria, token);
      toast.success("Categoría eliminada");
      setDeleteOpen(false);
      loadCategories();
    } catch (error) {
      toast.error(error.message || "Error al eliminar categoría");
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [{ key: "nombre", label: "Nombre" }];

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
            <RoleGuard requiredRole="ADMIN">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">
                      Categorías
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      Gestiona las categorías de productos
                    </p>
                  </div>
                  <PermissionGuard action={PERMISSIONS.CREATE_CATEGORY}>
                    <Button onClick={() => handleOpenModal()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva Categoría
                    </Button>
                  </PermissionGuard>
                </div>

                <DataTable
                  columns={columns}
                  data={categories}
                  loading={loading}
                  onEdit={handleOpenModal}
                  onDelete={(category) => {
                    setDeleteTarget(category);
                    setDeleteOpen(true);
                  }}
                />

                <FormModal
                  open={modalOpen}
                  onOpenChange={setModalOpen}
                  title={
                    editingCategory ? "Editar Categoría" : "Nueva Categoría"
                  }
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
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descripcion: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </FormModal>

                <DeleteConfirmDialog
                  open={deleteOpen}
                  onOpenChange={setDeleteOpen}
                  title="Eliminar Categoría"
                  description={`¿Estás seguro de que deseas eliminar "${deleteTarget?.nombre}"?`}
                  onConfirm={handleDelete}
                  loading={formLoading}
                />
              </div>
            </RoleGuard>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
