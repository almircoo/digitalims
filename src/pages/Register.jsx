import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth} from '@/contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card"
import { LoaderIcon} from "lucide-react"
import { MainLayout } from '@/layouts/MainLayout'
import { toast } from 'sonner'

export const Register = () => {
  const [formData, setFormData] = useState({
    dni: "",
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    role: "USER",
  })

  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await register(formData)

    if (result.success) {
      toast.success("Registro exitoso. Revisa tu email para verificar tu cuenta.")
      console.log("register object: ", result)
      navigate("/login")
    } else {
      toast.error(result.error)
    }

    setIsLoading(false)
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Register</CardTitle>
            <CardDescription className="text-center">Create a new account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  type="text"
                  name="nombre"
                  placeholder="Ingrese nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellidos</Label>
                <Input
                  id="apellido"
                  type="text"
                  name="apellido"
                  placeholder="Ingrese apellidos"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  type="text"
                  name="dni"
                  placeholder="Ingrese D.N.I"
                  value={formData.dni}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Ingrese email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contrasena</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Ingrese contrasena"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4" />
                    Creando ...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Y atienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-primary hover:underline font-medium"
                >
                 Iniciar Session
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
