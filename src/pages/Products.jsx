import React from 'react'
import { useAuth } from "@/contexts/AuthContext"
import { MainLayout } from "@/layouts/MainLayout"
import { Sidebar } from "@/layouts/Sidebar"
import { DataTable } from "@/components/DataTable"
import { FormModal } from "@/components/FormModal"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { getProducts, addProduct, updateProduct, removeProduct } from "@/apis"
import { toast } from "sonner"

export const Products = () => {
  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoriaId: "",
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await getProducts(token)
      setProducts(response.data || [])
    } catch (error) {
      toast.error("Error al cargar productos")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: product.precio,
        stock: product.stock,
        categoriaId: product.categoriaId,
      })
    } else {
      setEditingProduct(null)
      setFormData({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        categoriaId: "",
      })
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData, token)
        toast.success("Producto actualizado")
      } else {
        await addProduct(formData, token)
        toast.success("Producto creado")
      }
      setModalOpen(false)
      loadProducts()
    } catch (error) {
      toast.error(error.message || "Error al guardar producto")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    setFormLoading(true)
    try {
      await removeProduct(deleteTarget.id, token)
      toast.success("Producto eliminado")
      setDeleteOpen(false)
      loadProducts()
    } catch (error) {
      toast.error(error.message || "Error al eliminar producto")
    } finally {
      setFormLoading(false)
    }
  }

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "descripcion", label: "Descripción" },
    { key: "precio", label: "Precio" },
    { key: "stock", label: "Stock" },
  ]

  return (
    <MainLayout>
      <Sidebar />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Productos</h1>
            <p className="text-muted-foreground mt-2">Gestiona el catálogo de productos</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          onEdit={handleOpenModal}
          onDelete={(product) => {
            setDeleteTarget(product)
            setDeleteOpen(true)
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
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
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
    </MainLayout>
  )
}