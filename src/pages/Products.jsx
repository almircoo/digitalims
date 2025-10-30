import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext"
import { MainLayout } from "@/layouts/MainLayout"
import { DataTable } from "@/components/DataTable"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { PermissionGuard } from "@/components/PermissionGuard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getProducts, addProduct, updateProduct, removeProduct, getCategories } from "@/apis"
import { PERMISSIONS } from "@/config/permissions"
import { normalizeArray, normalizeProduct, normalizeCategory } from "@/lib/dataMapper"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const Products = () => {
  const { token, user } = useAuth()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoriaId: "",
    modelo: "",
    marca: "",
    color: "",
  })

  useEffect(() => {
    loadData()
  }, [token])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = products.filter(
        (product) =>
          product.nombre.toLowerCase().includes(term) ||
          product.descripcion.toLowerCase().includes(term) ||
          product.marca.toLowerCase().includes(term) ||
          product.modelo.toLowerCase().includes(term),
      )
      setFilteredProducts(filtered)
    }
  }, [searchTerm, products])

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsResult, categoriesResult] = await Promise.allSettled([getProducts(token), getCategories(token)])

      if (productsResult.status === "fulfilled") {
        const productsRes = productsResult.value
        console.log("Datos de producto: ", productsRes)
        setProducts(normalizeArray(productsRes.datos || productsRes.data || [], normalizeProduct))
      } else {
        console.error("Error al cargar productos:", productsResult.reason)
      }

      if (categoriesResult.status === "fulfilled") {
        const categoriesRes = categoriesResult.value
        console.log("Datos de categoria: ", categoriesRes)
        setCategories(normalizeArray(categoriesRes.datos || categoriesRes.data || [], normalizeCategory))
      } else {
        console.error("Error al cargar categorías:", categoriesResult.reason)
      }
    } catch (error) {
      console.error("Error general:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: product.precio,
        stock: product.stock,
        categoriaId: product.categoriaId,
        modelo: product.modelo,
        marca: product.marca,
        color: product.color,
      })
    } else {
      setEditingProduct(null)
      setFormData({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        categoriaId: "",
        modelo: "",
        marca: "",
        color: "",
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.categoriaId) {
      toast.error("Debes seleccionar una categoría")
      return
    }
    setFormLoading(true)
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
      }
      if (editingProduct) {
        await updateProduct(editingProduct.id, submitData, token)
        toast.success("Producto actualizado")
      } else {
        await addProduct(submitData, token)
        toast.success("Producto creado")
      }
      setEditingProduct(null)
      setFormData({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        categoriaId: "",
        modelo: "",
        marca: "",
        color: "",
      })
      loadData()
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
      loadData()
    } catch (error) {
      toast.error(error.message || "Error al eliminar producto")
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground mt-2">Gestiona tu catálogo de productos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-1">
            <PermissionGuard action={PERMISSIONS.CREATE_PRODUCT}>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                  </CardTitle>
                  <CardDescription>
                    {editingProduct
                      ? "Actualiza los datos del producto"
                      : "Completa el formulario para crear un nuevo producto"}
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
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="descripcion">Descripción *</Label>
                      <Textarea
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        required
                        className="min-h-24"
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoria">Categoría *</Label>
                      <Select
                        value={formData.categoriaId}
                        onValueChange={(value) => setFormData({ ...formData, categoriaId: value })}
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
                          onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">Stock *</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="marca" className="text-xs">
                          Marca
                        </Label>
                        <Input
                          id="marca"
                          value={formData.marca}
                          onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="modelo" className="text-xs">
                          Modelo
                        </Label>
                        <Input
                          id="modelo"
                          value={formData.modelo}
                          onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="color" className="text-xs">
                          Color
                        </Label>
                        <Input
                          id="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={formLoading} className="flex-1">
                        {formLoading ? "Guardando..." : editingProduct ? "Actualizar" : "Crear"}
                      </Button>
                      {editingProduct && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingProduct(null)
                            setFormData({
                              nombre: "",
                              descripcion: "",
                              precio: "",
                              stock: "",
                              categoriaId: "",
                              modelo: "",
                              marca: "",
                              color: "",
                            })
                          }}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </PermissionGuard>
          </div>

          {/* Right Column - List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Productos</CardTitle>
                <CardDescription>Total: {filteredProducts.length} productos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nombre, descripción, marca o modelo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {searchTerm && (
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {filteredProducts.length} resultado{filteredProducts.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {user?.role === "USER" && (
                    <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                      Puedes ver productos. Solo administradores pueden crear, editar o eliminar.
                    </div>
                  )}

                  {/* Data Table */}
                  <DataTable
                    columns={[
                      { key: "nombre", label: "Nombre" },
                      { key: "descripcion", label: "Descripción" },
                      { key: "categoria.nombre", label: "Categoría" },
                      { key: "precio", label: "Precio" },
                      { key: "stock", label: "Stock" },
                      { key: "marca", label: "Marca" },
                    ]}
                    data={filteredProducts}
                    loading={loading}
                    onEdit={(product) => {
                      if (!PERMISSIONS.ACTIONS.UPDATE_PRODUCT.includes(user?.role)) {
                        toast.error("No tienes permiso para editar productos")
                        return
                      }
                      setEditingProduct(product)
                      setFormData({
                        nombre: product.nombre,
                        descripcion: product.descripcion,
                        precio: product.precio,
                        stock: product.stock,
                        categoriaId: product.categoriaId,
                        modelo: product.modelo,
                        marca: product.marca,
                        color: product.color,
                      })
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    onDelete={(product) => {
                      if (!PERMISSIONS.ACTIONS.DELETE_PRODUCT.includes(user?.role)) {
                        toast.error("No tienes permiso para eliminar productos")
                        return
                      }
                      setDeleteTarget(product)
                      setDeleteOpen(true)
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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
};
