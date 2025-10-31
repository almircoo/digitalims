import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext"
import { MainLayout } from "@/layouts/MainLayout"
import { FormModal } from "@/components/FormModal"
import { OrderForm } from "@/components/OrderForm"
import { OrderList } from "@/components/OrderList"
import { PermissionGuard } from "@/components/PermissionGuard"
import { PERMISSIONS } from "@/config/permissions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Filter, X } from "lucide-react"
import {
  createOrder,
  removeOrder,
  updateOrderStatus,
  getCustomers,
  getProducts,
  getOrders,
  getBuscarBoletaPorDni,
} from "@/apis"
import { toast } from "sonner"

export const Orders = () => {
  const { token, user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Filter states
  const [searchDni, setSearchDni] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [filterApplied, setFilterApplied] = useState(false)

  useEffect(() => {
    loadData()
  }, [token])

  const loadData = async () => {
    try {
      setLoading(true)
      const [customersRes, productsRes, ordersRes] = await Promise.all([
        getCustomers(token),
        getProducts(token),
        getOrders(token, page, 10),
      ])

      setCustomers(customersRes.datos || [])
      setProducts(productsRes.datos || [])

      if (ordersRes.data && ordersRes.data.content) {
        const sortedOrders = [...ordersRes.data.content].sort((a, b) => b.idPedido - a.idPedido)
        setOrders(sortedOrders)
        setTotalPages(ordersRes.data.totalPages)
      } else if (ordersRes.datos && ordersRes.datos.content) {
        const sortedOrders = [...ordersRes.datos.content].sort((a, b) => b.idPedido - a.idPedido)
        setOrders(sortedOrders)
        setTotalPages(ordersRes.datos.totalPages)
      } else if (Array.isArray(ordersRes)) {
        const sortedOrders = [...ordersRes].sort((a, b) => b.idPedido - a.idPedido)
        setOrders(sortedOrders)
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchDni && !startDate && !endDate) {
      toast.error("Por favor ingresa al menos un criterio de búsqueda")
      return
    }

    try {
      setLoading(true)
      const response = await getBuscarBoletaPorDni(
        searchDni || null,
        null,
        startDate || null,
        endDate || null,
        0,
        10,
        token,
      )

      if (response.content && Array.isArray(response.content)) {
        const sortedOrders = [...response.content].sort((a, b) => b.idPedido - a.idPedido)
        setOrders(sortedOrders)
      } else if (response.data && response.data.content) {
        const sortedOrders = [...response.data.content].sort((a, b) => b.idPedido - a.idPedido)
        setOrders(sortedOrders)
        setTotalPages(response.data.totalPages)
      } else if (Array.isArray(response)) {
        const sortedOrders = [...response].sort((a, b) => b.idPedido - a.idPedido)
        setOrders(sortedOrders)
      }

      setFilterApplied(true)
      toast.success("Búsqueda completada")
    } catch (error) {
      console.error("Error searching orders:", error)
      toast.error(error.message || "Error en la búsqueda")
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    setSearchDni("")
    setStartDate("")
    setEndDate("")
    setFilterApplied(false)
    loadData()
  }

  const handleSubmit = async (orderData) => {
    setFormLoading(true)
    try {
      await createOrder(orderData, token)
      await loadData()
      toast.success("Pedido creado exitosamente")
      setModalOpen(false)
    } catch (error) {
      console.error("Error creating order:", error)
      toast.error(error.message || "Error al crear pedido")
    } finally {
      setFormLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    if (!PERMISSIONS.ACTIONS.UPDATE_ORDER_STATUS.includes(user?.role)) {
      toast.error("No tienes permiso para cambiar el estado de pedidos")
      return
    }

    try {
      await updateOrderStatus(orderId, newStatus, token)
      await loadData()
      toast.success("Estado del pedido actualizado")
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error(error.message || "Error al actualizar estado")
    }
  }

  const handleDelete = async (orderId) => {
    if (!PERMISSIONS.ACTIONS.DELETE_ORDER.includes(user?.role)) {
      toast.error("No tienes permiso para eliminar pedidos")
      return
    }

    if (!confirm("¿Estás seguro de que deseas eliminar este pedido?")) return

    try {
      await removeOrder(orderId, token)
      await loadData()
      toast.success("Pedido eliminado exitosamente")
    } catch (error) {
      console.error("Error deleting order:", error)
      toast.error(error.message || "Error al eliminar pedido")
    }
  }

  return (
    <MainLayout>
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground mt-2">Crea y gestiona pedidos de clientes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Search and Filters */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Buscar Pedidos
                </CardTitle>
                <CardDescription>Filtra por DNI o rango de fechas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* DNI Search */}
                  <div>
                    <Label className="text-sm font-medium">DNI del Cliente</Label>
                    <div className="relative mt-2">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Ingresa DNI..."
                        value={searchDni}
                        onChange={(e) => setSearchDni(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Start Date */}
                  <div>
                    <Label className="text-sm font-medium">Fecha Inicio</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <Label className="text-sm font-medium">Fecha Fin</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-2" />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-4">
                    <Button onClick={handleSearch} disabled={loading} className="w-full">
                      <Search className="mr-2 h-4 w-4" />
                      Buscar
                    </Button>
                    {filterApplied && (
                      <Button
                        variant="outline"
                        onClick={handleClearFilters}
                        disabled={loading}
                        className="w-full bg-transparent"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Limpiar
                      </Button>
                    )}
                  </div>

                  {/* Create Order Button */}
                  <PermissionGuard action={PERMISSIONS.CREATE_ORDER}>
                    <Button onClick={() => setModalOpen(true)} variant="secondary" className="w-full mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Nuevo Pedido
                    </Button>
                  </PermissionGuard>

                  {/* Info Box */}
                  <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-200 mt-4">
                    <p className="font-semibold mb-1">Información:</p>
                    <p>Crea pedidos agregando múltiples productos al carrito.</p>
                    {user?.role === "USER" && (
                      <p className="mt-1">Como usuario, puedes crear y listar tus pedidos (solo lectura).</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Orders List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{filterApplied ? "Resultados de Búsqueda" : "Pedidos Creados"}</CardTitle>
                <CardDescription>Total: {orders.length} pedidos</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <OrderList
                    orders={orders}
                    onEdit={() => toast.info("Edición de pedidos próximamente")}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                    loading={formLoading}
                    userRole={user?.role}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Order Modal */}
        <FormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title="Crear Nuevo Pedido"
          description="Completa el formulario para crear un nuevo pedido con múltiples productos"
          showFooter={false}
        >
          {!loading ? (
            <OrderForm customers={customers} products={products} onSubmit={handleSubmit} loading={formLoading} />
          ) : (
            <div className="text-center py-4">Cargando datos...</div>
          )}
        </FormModal>
      </div>
    </MainLayout>
  );
};
