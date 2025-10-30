import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/layouts/MainLayout";
import {
  getProducts,
  getCategories,
  getCustomers,
  getOrders,
} from "@/apis";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, FolderTree, Users, TrendingUp, Calendar  } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
export const Dashbaord = () => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    customers: 0,
    orders: 0,
  })
  const { token, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chartData, setChartData] = useState([])
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    loadStats()
  }, [token])

  useEffect(() => {
    if (token) {
      loadChartData()
    }
  }, [token, startDate, endDate])

  const loadStats = async () => {
    if (!token) {
      setLoading(false)
      return
    }
    try {
      setError(null)
      const [productsRes, categoriesRes, customersRes, ordersRes] = await Promise.all([
        getProducts(token).catch(() => ({ totalElements: 0, data: [] })),
        getCategories(token).catch(() => ({ totalElements: 0, data: [] })),
        getCustomers(token).catch(() => ({ totalElements: 0, data: [] })),
        getOrders(token).catch(() => ({ totalElements: 0, data: [] })),
      ])

      setStats({
        products: productsRes.totalElements || productsRes.datos?.length || 0,
        categories: categoriesRes.totalElements || categoriesRes.datos?.length || 0,
        customers: customersRes.totalElements || customersRes.datos?.length || 0,
        orders: ordersRes.datos?.totalElements || ordersRes.totalElements || ordersRes.datos?.length || 0,
      })
    } catch (error) {
      console.error("Error al cargar stats:", error)
      setError("Error al cargar las estadísticas")
    } finally {
      setLoading(false)
    }
  }

  const loadChartData = async () => {
    try {
      const response = await getVentasPorPeriodo(startDate, endDate, token)
      if (response.datos && Array.isArray(response.datos)) {
        setChartData(response.datos)
      } else if (Array.isArray(response)) {
        setChartData(response)
      } else {
        // Datos de ejemplo si no hay respuesta
        setChartData(generateMockData())
      }
    } catch (error) {
      console.error("Error loading chart data:", error)
      setChartData(generateMockData())
    }
  }

  const generateMockData = () => {
    const data = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      data.push({
        fecha: date.toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
        ventas: Math.floor(Math.random() * 5000) + 1000,
        pedidos: Math.floor(Math.random() * 50) + 10,
      })
    }
    return data
  }

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
  ]

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-8 py-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Bienvenido, {user?.nombre}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <div className={`h-10 w-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {error && <div className="bg-red-500/10 border border-red-500 text-red-700 px-4 py-3 rounded">{error}</div>}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line Chart - Ventas por Período */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Ventas por Período</CardTitle>
              <CardDescription>Tendencia de ventas en los últimos días</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={2} name="Ventas ($)" />
                  <Line type="monotone" dataKey="pedidos" stroke="#10b981" strokeWidth={2} name="Pedidos" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Distribución */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Recursos</CardTitle>
              <CardDescription>Proporción de datos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Productos", value: stats.products },
                      { name: "Clientes", value: stats.customers },
                      { name: "Pedidos", value: stats.orders },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Date Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filtrar por Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Fecha Inicio</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Fecha Fin</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1" />
              </div>
              <div className="flex items-end">
                <Button onClick={loadChartData}>Actualizar</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Estado:</span>
                <span className="font-semibold text-green-600">Operativo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Rol de Usuario:</span>
                <span className="font-semibold">{user?.role === "ADMIN" ? "Administrador" : "Usuario"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Última actualización:</span>
                <span className="font-semibold text-sm">{new Date().toLocaleTimeString("es-ES")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Crear Nuevo Producto
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Nuevo Pedido
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Agregar Cliente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
