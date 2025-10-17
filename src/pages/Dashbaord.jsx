import React from 'react'
import { MainLayout } from '@/layouts/MainLayout'
import { Package, FolderTree, Users, TrendingUp } from "lucide-react"
import { getCategories, getProducts, getCustomers } from '@/apis'
export const Dashbaord = () => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    customers: 0,
    lowStock: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [productsRes, categoriesRes, customersRes] = await Promise.all([
        getProducts(),
        getCategories(),
        getCustomers(),
      ])

      setStats({
        products: productsRes.totalElements || 0,
        categories: categoriesRes.totalElements || 0,
        customers: customersRes.totalElements || 0,
        lowStock: 0,
      })
    } catch (error) {
      console.error("Error al cargar stats:", error)
    } finally {
      setLoading(false)
    }
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
      title: "Stock Bajo",
      value: stats.lowStock,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ]

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Resumen general del sistema de inventario</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Actividad Reciente</h2>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">No hay actividad reciente</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Productos con Stock Bajo</h2>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Todos los productos tienen stock suficiente</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
