import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext"
import { MainLayout } from "@/layouts/MainLayout"
import { DataTable } from "@/components/DataTable"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { getCustomers, addCustomer, updateCustomer, removeCustomer } from "@/apis"
import { PermissionGuard } from "@/components/PermissionGuard"
import { PERMISSIONS } from "@/config/permissions"
import { normalizeCustomer, normalizeArray } from "@/lib/dataMapper"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const Customers = () => {
  const { token, user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    dni: "",
    direccion: "",
  })

  useEffect(() => {
    loadCustomers()
  }, [token])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const response = await getCustomers(token)
      setCustomers(normalizeArray(response.datos || [], normalizeCustomer))
    } catch (error) {
      console.error(" Error loading customers:", error)
      toast.error("Error al cargar clientes")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer)
      setFormData({
        nombre: customer.nombre,
        apellido: customer.apellido || "",
        email: customer.email,
        telefono: customer.telefono || "",
        dni: customer.dni || "",
        direccion: customer.direccion || "",
      })
    } else {
      setEditingCustomer(null)
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        dni: "",
        direccion: "",
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData, token)
        toast.success("Cliente actualizado")
      } else {
        await addCustomer(formData, token)
        toast.success("Cliente creado")
      }
      setEditingCustomer(null)
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        dni: "",
        direccion: "",
      })
      loadCustomers()
    } catch (error) {
      toast.error(error.message || "Error al guardar cliente")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    setFormLoading(true)
    try {
      await removeCustomer(deleteTarget.id, token)
      toast.success("Cliente eliminado")
      setDeleteOpen(false)
      loadCustomers()
    } catch (error) {
      toast.error(error.message || "Error al eliminar cliente")
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground mt-2">Gestiona tu base de datos de clientes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-1">
            <PermissionGuard action={PERMISSIONS.CREATE_CUSTOMER}>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    {editingCustomer ? "Editar Cliente" : "Nuevo Cliente"}
                  </CardTitle>
                  <CardDescription>
                    {editingCustomer
                      ? "Actualiza los datos del cliente"
                      : "Completa el formulario para crear un nuevo cliente"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="apellido">Apellido</Label>
                        <Input
                          id="apellido"
                          value={formData.apellido}
                          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dni">DNI</Label>
                        <Input
                          id="dni"
                          value={formData.dni}
                          onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                          id="telefono"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="direccion">Dirección</Label>
                      <Input
                        id="direccion"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={formLoading} className="flex-1">
                        {formLoading ? "Guardando..." : editingCustomer ? "Actualizar" : "Crear"}
                      </Button>
                      {editingCustomer && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingCustomer(null)
                            setFormData({
                              nombre: "",
                              apellido: "",
                              email: "",
                              telefono: "",
                              dni: "",
                              direccion: "",
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
                <CardTitle>Lista de Clientes</CardTitle>
                <CardDescription>Total: {customers.length} clientes</CardDescription>
              </CardHeader>
              <CardContent>
                {user?.role === "USER" && (
                  <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-200 mb-4">
                    Como usuario, puedes crear, editar y eliminar clientes. Solo administradores pueden ver la lista
                    completa.
                  </div>
                )}

                <DataTable
                  columns={[
                    { key: "nombre", label: "Nombre" },
                    { key: "apellido", label: "Apellido" },
                    { key: "email", label: "Email" },
                    { key: "dni", label: "DNI" },
                    { key: "telefono", label: "Teléfono" },
                    { key: "direccion", label: "Dirección" },
                  ]}
                  data={customers}
                  loading={loading}
                  onEdit={(customer) => {
                    if (!PERMISSIONS.ACTIONS.UPDATE_CUSTOMER.includes(user?.role)) {
                      toast.error("No tienes permiso para editar clientes")
                      return
                    }
                    setEditingCustomer(customer)
                    setFormData({
                      nombre: customer.nombre,
                      apellido: customer.apellido || "",
                      email: customer.email,
                      telefono: customer.telefono || "",
                      dni: customer.dni || "",
                      direccion: customer.direccion || "",
                    })
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  onDelete={(customer) => {
                    if (!PERMISSIONS.ACTIONS.DELETE_CUSTOMER.includes(user?.role)) {
                      toast.error("No tienes permiso para eliminar clientes")
                      return
                    }
                    setDeleteTarget(customer)
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
          title="Eliminar Cliente"
          description={`¿Estás seguro de que deseas eliminar "${deleteTarget?.nombre}"?`}
          onConfirm={handleDelete}
          loading={formLoading}
        />
      </div>
    </MainLayout>
  );
};
