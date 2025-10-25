import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/layouts/MainLayout";
import {
  getProducts,
  getCategories,
  getCustomers,
  getOrders,
} from "@/apis";
import { Package, FolderTree, Users, TrendingUp } from "lucide-react";
import { Sidebar } from "@/layouts/Sidebar";

export const Dashbaord = () => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    customers: 0,
    orders: 0,
  });
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, [token]);

  const loadStats = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const [productsRes, categoriesRes, customersRes, ordersRes] =
        await Promise.all([
          getProducts(token).catch(() => ({ totalElements: 0, data: [] })),
          getCategories(token).catch(() => ({ totalElements: 0, data: [] })),
          getCustomers(token).catch(() => ({ totalElements: 0, data: [] })),
          getOrders(token).catch(() => ({ totalElements: 0, data: [] })),
        ]);

      setStats({
        products: productsRes.totalElements || productsRes.datos?.length || 0,
        categories:
          categoriesRes.totalElements || categoriesRes.datos?.length || 0,
        customers:
          customersRes.totalElements || customersRes.datos?.length || 0,
        orders: ordersRes.totalElements || ordersRes.datos?.length || 0,
      });
    } catch (error) {
      console.error(" Error al cargar stats:", error);
      setError("Error al cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Productos",
      value: stats.products,
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Categorías",
      value: stats.categories,
      icon: FolderTree,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Clientes",
      value: stats.customers,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Pedidos",
      value: stats.orders,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  if (loading) {
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
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

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
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Bienvenido, {user?.nombre}
                </h1>
                <p className="text-muted-foreground mt-2">
                  Resumen general del sistema de inventario
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="bg-card border border-border rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`h-12 w-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                        >
                          <Icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">
                        {stat.value}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Información del Sistema
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado:</span>
                      <span className="font-semibold text-green-600">
                        Operativo
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Rol de Usuario:
                      </span>
                      <span className="font-semibold">
                        {user?.role === "ADMIN" ? "Administrador" : "Usuario"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Acciones Rápidas
                  </h2>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Accede a las secciones principales desde el menú lateral
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
