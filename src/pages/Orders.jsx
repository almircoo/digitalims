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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { getOrders, createOrder, updateOrder, removeOrder, updateOrderStatus, getCustomers, getProducts } from "@/apis"
import { toast } from "sonner"

export const Orders = () => {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [statusTarget, setStatusTarget] = useState(null)
  const [newStatus, setNewStatus] = useState("")
  const [formData, setFormData] = useState({
    clienteId: "",
    productoId: "",
    cantidad: "",
    precioUnitario: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        getOrders(token),
        getCustomers(token),
        getProducts(token),
      ])
      setOrders(ordersRes.data || [])
      setCustomers(customersRes.data || [])
      setProducts(productsRes.data || [])
    } catch (error) {
      toast.error("Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (order = null) => {
    if (order) {
      setEditingOrder(order)
      setFormData({
        clienteId: order.clienteId,
        productoId: order.productoId,
        cantidad: order.cantidad,
        precioUnitario: order.precioUnitario,
      })
    } else {
      setEditingOrder(null)
      setFormData({
        clienteId: "",
        productoId: "",
        cantidad: "",
        precioUnitario: "",
      })
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, formData, token)
        toast.success("Pedido actualizado")
      } else {
        await createOrder(formData, token)
        toast.success("Pedido creado")
      }
      setModalOpen(false)
      loadData()
    } catch (error) {
      toast.error(error.message || "Error al guardar pedido")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    setFormLoading(true)
    try {
      await removeOrder(deleteTarget.id, token)
      toast.success("Pedido eliminado")
      setDeleteOpen(false)
      loadData()
    } catch (error) {
      toast.error(error.message || "Error al eliminar pedido")
    } finally {
      setFormLoading(false)
    }
  }

  const handleStatusChange = async () => {
    setFormLoading(true)
    try {
      await updateOrderStatus(statusTarget.id, newStatus, token)
      toast.success("Estado del pedido actualizado")
      setStatusModalOpen(false)
      loadData()
    } catch (error) {
      toast.error(error.message || "Error al actualizar estado")
    } finally {
      setFormLoading(false)
    }
  }

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => `#${row.id}`,
    },
    {
      key: "clienteId",
      label: "Cliente",
      render: (row) => {
        const customer = customers.find((c) => c.id === row.clienteId)
        return customer?.nombre || "N/A"
      },
    },
    {
      key: "productoId",
      label: "Producto",
      render: (row) => {
        const product = products.find((p) => p.id === row.productoId)
        return product?.nombre || "N/A"
      },
    },
    { key: "cantidad", label: "Cantidad" },
    { key: "precioUnitario", label: "Precio Unitario" },
    {
      key: "estado",
      label: "Estado",
      render: (row) => <span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800">{row.estado}</span>,
    },
  ]

  return (
    <MainLayout>
      <Sidebar />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pedidos</h1>
            <p className="text-muted-foreground mt-2">Gestiona los pedidos de clientes</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Pedido
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          onEdit={handleOpenModal}
          onDelete={(order) => {
            setDeleteTarget(order)
            setDeleteOpen(true)
          }}
        />

        <FormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={editingOrder ? "Editar Pedido" : "Nuevo Pedido"}
          onSubmit={handleSubmit}
          loading={formLoading}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="cliente">Cliente</Label>
              <Select
                value={formData.clienteId}
                onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={String(customer.id)}>
                      {customer.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="producto">Producto</Label>
              <Select
                value={formData.productoId}
                onValueChange={(value) => setFormData({ ...formData, productoId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="precio">Precio Unitario</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  value={formData.precioUnitario}
                  onChange={(e) => setFormData({ ...formData, precioUnitario: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        </FormModal>

        <DeleteConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Eliminar Pedido"
          description={`¿Estás seguro de que deseas eliminar el pedido #${deleteTarget?.id}?`}
          onConfirm={handleDelete}
          loading={formLoading}
        />
      </div>
    </MainLayout>
  )
}
