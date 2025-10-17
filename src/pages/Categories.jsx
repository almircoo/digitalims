import React, { useEffect, useState } from 'react'
import { useAuth } from "@/contexts/AuthContext"
import { MainLayout } from "@/layouts/MainLayout"
import { Sidebar } from "@/layouts/Sidebar"
import { DataTable } from "@/components/DataTable"
import { FormModal } from "@/components/FormModal"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { getCategories, addCategory, updateCategory, removeCategory } from "@/apis"
import { toast } from "sonner"

export const Categories = () => {
  const { token } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await getCategories(token)
      setCategories(response.data || [])
    } catch (error) {
      toast.error("Error al cargar categorías")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category)
      setFormData({ nombre: category.nombre })
    } else {
      setEditingCategory(null)
      setFormData({ nombre: "" })
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData, token)
        toast.success("Categoría actualizada")
      } else {
        await addCategory(formData, token)
        toast.success("Categoría creada")
      }
      setModalOpen(false)
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
      await removeCategory(deleteTarget.id, token)
      toast.success("Categoría eliminada")
      setDeleteOpen(false)
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
      <Sidebar />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Categorías</h1>
            <p className="text-muted-foreground mt-2">Gestiona las categorías de productos</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Categoría
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={categories}
          loading={loading}
          onEdit={handleOpenModal}
          onDelete={(category) => {
            setDeleteTarget(category)
            setDeleteOpen(true)
          }}
        />

        <FormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={editingCategory ? "Editar Categoría" : "Nueva Categoría"}
          onSubmit={handleSubmit}
          loading={formLoading}
        >
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
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
    </MainLayout>
  )
}
