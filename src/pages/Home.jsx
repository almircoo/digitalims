import React from 'react'
import { useNavigate } from 'react-router'
import { MainLayout } from '@/layouts/MainLayout'
import { Button } from "@/components/ui/button"
import { ArrowRight, Package, Users, ShoppingCart, TrendingUp, BarChart3, Zap } from "lucide-react"
export const Home = () => {
  const navigate = useNavigate()
  return (
    <MainLayout>
      <div className="space-y-12 py-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold">Sistema de Gestión de Inventario</h1>
          <p className="text-xl text-muted-foreground">
            Administra tu inventario, productos, clientes y pedidos de forma profesional y eficiente
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate("/login")}>
              Iniciar Sesión
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/register")}>
              Crear Cuenta
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold">Gestión Completa</h3>
            <p className="text-muted-foreground">
              Controla productos, categorías, inventario y más desde una plataforma unificada
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold">Análisis en Tiempo Real</h3>
            <p className="text-muted-foreground">Visualiza métricas, gráficos y reportes detallados de tu negocio</p>
          </div>

          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold">Rápido y Seguro</h3>
            <p className="text-muted-foreground">Interfaz intuitiva con autenticación segura y control de permisos</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-card border rounded-lg p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">¿Listo para comenzar?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Únete a nuestro sistema de gestión de inventario y optimiza tu negocio hoy mismo
          </p>
          <Button size="lg" onClick={() => navigate("/register")}>
            Registrarse Ahora
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}
