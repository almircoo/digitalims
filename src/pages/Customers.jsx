import React, { useState, useEffect } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/layouts/MainLayout";
import { Sidebar } from "@/layouts/Sidebar";
import { DataTable } from "@/components/DataTable";
import { FormModal } from "@/components/FormModal";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import {
  getCustomers,
  addCustomer,
  updateCustomer,
  removeCustomer,
} from "@/apis";
import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/config/permissions";
import { normalizeCustomer, normalizeArray } from "@/lib/dataMapper";
import { toast } from "sonner";

export const Customers = () => {
  const { token, user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    dni: "",
    direccion: "",
  });

  useEffect(() => {
    loadCustomers();
  }, [token]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      // Backend allows GET for ADMIN/USER
      const response = await getCustomers(token);
      setCustomers(normalizeArray(response.datos || [], normalizeCustomer));
    } catch (error) {
      console.error(" Error loading customers:", error);
      toast.error("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        nombre: customer.nombre,
        apellido: customer.apellido || "",
        email: customer.email,
        telefono: customer.telefono || "",
        dni: customer.dni || "",
        direccion: customer.direccion || "",
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        dni: "",
        direccion: "",
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData, token);
        toast.success("Cliente actualizado");
      } else {
        await addCustomer(formData, token);
        toast.success("Cliente creado");
      }
      setModalOpen(false);
      loadCustomers();
    } catch (error) {
      toast.error(error.message || "Error al guardar cliente");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await removeCustomer(deleteTarget.id, token);
      toast.success("Cliente eliminado");
      setDeleteOpen(false);
      loadCustomers();
    } catch (error) {
      toast.error(error.message || "Error al eliminar cliente");
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "email", label: "Email" },
    { key: "dni", label: "DNI" },
    { key: "telefono", label: "Teléfono" },
    { key: "direccion", label: "Dirección" },
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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Clientes
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Gestiona la base de datos de clientes
                  </p>
                </div>
                <PermissionGuard action={PERMISSIONS.CREATE_CUSTOMER}>
                  <Button onClick={() => handleOpenModal()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Cliente
                  </Button>
                </PermissionGuard>
              </div>

              {user?.role === "USER" && (
                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                  Como usuario, puedes crear, editar y eliminar clientes. Solo
                  administradores pueden ver la lista completa.
                </div>
              )}

              <DataTable
                columns={columns}
                data={customers}
                loading={loading}
                onEdit={(customer) => {
                  if (
                    !PERMISSIONS.ACTIONS.UPDATE_CUSTOMER.includes(user?.role)
                  ) {
                    toast.error("No tienes permiso para editar clientes");
                    return;
                  }
                  handleOpenModal(customer);
                }}
                onDelete={(customer) => {
                  if (
                    !PERMISSIONS.ACTIONS.DELETE_CUSTOMER.includes(user?.role)
                  ) {
                    toast.error("No tienes permiso para eliminar clientes");
                    return;
                  }
                  setDeleteTarget(customer);
                  setDeleteOpen(true);
                }}
              />

              <FormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={editingCustomer ? "Editar Cliente" : "Nuevo Cliente"}
                onSubmit={handleSubmit}
                loading={formLoading}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="apellido">Apellido</Label>
                      <Input
                        id="apellido"
                        value={formData.apellido}
                        onChange={(e) =>
                          setFormData({ ...formData, apellido: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dni">DNI</Label>
                      <Input
                        id="dni"
                        value={formData.dni}
                        onChange={(e) =>
                          setFormData({ ...formData, dni: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={formData.telefono}
                        onChange={(e) =>
                          setFormData({ ...formData, telefono: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) =>
                        setFormData({ ...formData, direccion: e.target.value })
                      }
                    />
                  </div>
                </div>
              </FormModal>

              <DeleteConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Eliminar Cliente"
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
