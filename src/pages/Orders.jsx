import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/layouts/MainLayout";
import { Sidebar } from "@/layouts/Sidebar";
import { FormModal } from "@/components/FormModal";
import { OrderForm } from "@/components/OrderForm";
import { OrderList } from "@/components/OrderList";
// import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/config/permissions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  createOrder,
  removeOrder,
  updateOrderStatus,
  getCustomers,
  getProducts,
  getOrders,
} from "@/apis";
import { toast } from "sonner";

export const Orders = () => {
  const { token, user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [customersRes, productsRes, ordersRes] = await Promise.all([
        getCustomers(token),
        getProducts(token),
        getOrders(token, page, 10),
      ]);

      console.log("Customer order data: ", customersRes);
      console.log("productos order data: ", productsRes);
      console.log("orders list data: ", ordersRes);

      setCustomers(customersRes.datos || []);
      setProducts(productsRes.datos || []);

      if (ordersRes.data && ordersRes.data.content) {
        setOrders(ordersRes.data.content)
        setTotalPages(ordersRes.data.totalPages)
      } else if (ordersRes.datos && ordersRes.datos.content) {
        setOrders(ordersRes.datos.content)
        setTotalPages(ordersRes.datos.totalPages)
      } else if (Array.isArray(ordersRes)) {
        setOrders(ordersRes)
      } else {
        console.warn("respueta inesperada, response structure:", ordersRes)
        setOrders([])
      }

    } catch (error) {
      console.error(" Error loading data:", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (orderData) => {
    setFormLoading(true);
    try {
      console.log(" Creating order with data:", orderData);
      const response = await createOrder(orderData, token)
      await loadData()

      toast.success("Pedido creado exitosamente");
      setModalOpen(false);
    } catch (error) {
      console.error(" Error creating order:", error);
      toast.error(error.message || "Error al crear pedido");
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!PERMISSIONS.ACTIONS.UPDATE_ORDER_STATUS.includes(user?.role)) {
      toast.error("No tienes permiso para cambiar el estado de pedidos");
      return;
    }

    try {
      console.log("Updating order status:", orderId, newStatus)
      await updateOrderStatus(orderId, newStatus, token)

      await loadData()

      toast.success("Estado del pedido actualizado")
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error(error.message || "Error al actualizar estado")
    }
  };

  const handleDelete = async (orderId) => {
    if (!PERMISSIONS.ACTIONS.DELETE_ORDER.includes(user?.role)) {
      toast.error("No tienes permiso para eliminar pedidos");
      return;
    }

    if (!confirm("¿Estás seguro de que deseas eliminar este pedido?")) return

    try {
      console.log("Deleting order:", orderId)
      await removeOrder(orderId, token)

      await loadData()

      toast.success("Pedido eliminado exitosamente")
    } catch (error) {
      console.error("Error deleting order:", error)
      toast.error(error.message || "Error al eliminar pedido")
    }
  };

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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Pedidos
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Crea y gestiona pedidos de clientes
                  </p>
                </div>
                <PermissionGuard action={PERMISSIONS.CREATE_ORDER}>
                  <Button onClick={() => setModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Pedido
                  </Button>
                </PermissionGuard>
              </div>

              <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700">
                <p className="font-semibold">Información:</p>
                <p>
                  Crea pedidos agregando múltiples productos al carrito. El
                  sistema calculará automáticamente el total.
                </p>
                {user?.role === "USER" && (
                  <p className="mt-2 text-xs">
                    Como usuario, puedes crear y eliminar tus pedidos, pero solo
                    administradores pueden cambiar estados.
                  </p>
                )}
              </div>

              <FormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title="Crear Nuevo Pedido"
                description="Completa el formulario para crear un nuevo pedido con múltiples productos"
                showFooter={false}
              >
                {!loading ? (
                  <OrderForm
                    customers={customers}
                    products={products}
                    onSubmit={handleSubmit}
                    loading={formLoading}
                  />
                ) : (
                  <div className="text-center py-4">Cargando datos...</div>
                )}
              </FormModal>

              <div>
                <h2 className="text-2xl font-bold mb-4">Pedidos Creados</h2>
                <OrderList
                  orders={orders}
                  onEdit={() => toast.info("Edición de pedidos próximamente")}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  loading={formLoading}
                  userRole={user?.role}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
