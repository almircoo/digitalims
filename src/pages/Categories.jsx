import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RoleGuard } from "@/components/RoleGuard";
import { PermissionGuard } from "@/components/PermissionGuard";
import { MainLayout } from "@/layouts/MainLayout";
import { DataTable } from "@/components/DataTable";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  const { token } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  })

  useEffect(() => {
    loadCategories()
  }, [token])

  const loadCategories = async () => {
    try {
      setLoading(true)
      console.log("Loading categories with token:", token ? "present" : "missing")
      const response = await getCategories(token)
      console.log("Categories response:", response)
      setCategories(response.datos || [])
    } catch (error) {
      console.error("Error loading categories:", error)
      toast.error("Error al cargar categorías")
    } finally {
      setLoading(false)
    }
  }

  const handleNewCategory = () => {
    setEditingCategory(null)
    setFormData({ nombre: "", descripcion: "" })
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      nombre: category.nombre,
      descripcion: category.descripcion || "",
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nombre.trim()) {
      toast.error("El nombre es requerido")
      return
    }
    setFormLoading(true)
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.idCategoria, formData, token)
        toast.success("Categoría actualizada")
      } else {
        await addCategory(formData, token)
        toast.success("Categoría creada")
      }
      handleNewCategory()
      loadCategories()
    } catch (error) {
      toast.error(error.message || "Error al guardar categoría")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    setFormLoading(true)
    try {
      await removeCategory(deleteTarget.idCategoria, token)
      toast.success("Categoría eliminada")
      setDeleteOpen(false)
      handleNewCategory()
      loadCategories()
    } catch (error) {
      toast.error(error.message || "Error al eliminar categoría")
    } finally {
      setFormLoading(false)
    }
  }

  const columns = [{ key: "nombre", label: "Nombre" }]

  return (
    <MainLayout>
      <div className="container py-6">
        <RoleGuard requiredRole="ADMIN">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Categorías</h1>
              <p className="text-muted-foreground mt-2">Gestiona las categorías de productos</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Formulario */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
                    </CardTitle>
                    <CardDescription>
                      {editingCategory
                        ? "Actualiza los datos de la categoría"
                        : "Crea una nueva categoría de productos"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input
                          id="nombre"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          placeholder="Ej: Electrónica"
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
                          placeholder="Describe esta categoría..."
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <PermissionGuard action={PERMISSIONS.CREATE_CATEGORY}>
                          <Button type="submit" disabled={formLoading} className="flex-1">
                            {editingCategory ? "Actualizar" : "Crear"}
                          </Button>
                        </PermissionGuard>
                        {editingCategory && (
                          <Button type="button" variant="outline" onClick={handleNewCategory} disabled={formLoading}>
                            Limpiar
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de categorías */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Categorías Registradas</CardTitle>
                    <CardDescription>
                      Total: {categories.length} categoría{categories.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={columns}
                      data={categories}
                      loading={loading}
                      onEdit={handleEdit}
                      onDelete={(category) => {
                        setDeleteTarget(category)
                        setDeleteOpen(true)
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

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
    </MainLayout>
  );
};
