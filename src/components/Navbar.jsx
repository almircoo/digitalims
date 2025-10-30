import React, {useState } from "react"
import { Link, useNavigate } from "react-router"
import {
  LogOut,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  ShoppingCart,
  BarChart3,
  Search,
  User,
  ChevronDown,
  Menu,
  X,
  Bell,
  MoreHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import { PERMISSIONS } from "@/config/permissions"
import { toast } from "sonner"

export const Navbar = () => {
  const navigate = useNavigate()
  const { token, user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    toast.success("Cierre de sesión exitoso")
    navigate("/login")
  }

  const baseNavigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: PERMISSIONS.PAGES.DASHBOARD,
    },
  ]

  const mainNavigation = [
    {
      name: "Productos",
      href: "/products",
      icon: Package,
      roles: PERMISSIONS.PAGES.PRODUCTS,
    },
    {
      name: "Clientes",
      href: "/customers",
      icon: Users,
      roles: PERMISSIONS.PAGES.CUSTOMERS,
    },
    {
      name: "Pedidos",
      href: "/orders",
      icon: ShoppingCart,
      roles: PERMISSIONS.PAGES.ORDERS,
    },
  ]

  const moreNavigation = [
    {
      name: "Categorías",
      href: "/categories",
      icon: FolderTree,
      roles: PERMISSIONS.PAGES.CATEGORIES,
    },
    {
      name: "Reportes",
      href: "/reports",
      icon: BarChart3,
      roles: ["ADMIN"],
    },
  ]

  const navigation = [
    ...baseNavigation,
    ...mainNavigation.filter((item) => {
      const rolesArray = Array.isArray(item.roles) ? item.roles : [item.roles]
      return rolesArray.includes(user?.role)
    }),
  ]

  const moreItems = moreNavigation.filter((item) => {
    const rolesArray = Array.isArray(item.roles) ? item.roles : [item.roles]
    return rolesArray.includes(user?.role)
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold whitespace-nowrap flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">D</span>
          </div>
          <span className="hidden sm:inline">Digital IMS</span>
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        {token && (
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-muted text-foreground border-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}

            {moreItems.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border-2">
                    <MoreHorizontal className="h-4 w-4" />
                    Más
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {moreItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link to={item.href} className="flex items-center gap-2 cursor-pointer">
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        )}

        {/* Search Bar - Visible on desktop */}
        {/* <div className="flex-1 max-w-lg hidden sm:block">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-full rounded-full pl-10 pr-4 h-10 text-sm"
            />
          </div>
        </div> */}

        {/* Desktop Right Section */}
        <div className="hidden lg:flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full bg-primary">
            <Bell className="h-5 w-5" />
          </Button>
          {token ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 rounded-full bg-transparent">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user?.nombre || "Usuario"}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-semibold">{user?.nombre}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Rol: {user?.role === "ADMIN" ? "Administrador" : "Usuario"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>Perfil</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-full bg-transparent" onClick={() => navigate("/login")}>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
              <Button
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => navigate("/register")}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Registrarse
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <Button variant="ghost" size="icon" className="lg:hidden ml-auto" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Search Bar */}
      {token && (
        <div className="w-full px-4 pb-3 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              className="w-full rounded-full pl-10 pr-4 h-10 text-sm"
            />
          </div>
        </div>
      )}

      {/* Mobile Menu Content */}
      {isMenuOpen && (
        <div className="absolute top-[59px] left-0 w-full bg-background border-b shadow-md lg:hidden">
          <div className="container flex flex-col gap-2 py-4 px-4">
            {token ? (
              <>
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted text-foreground"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}

                {moreItems.length > 0 && (
                  <>
                    <div className="border-t my-2 pt-2">
                      <p className="text-xs font-semibold text-muted-foreground px-3 py-1">Más</p>
                      {moreItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted text-foreground"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Icon className="h-4 w-4" />
                            {item.name}
                          </Link>
                        )
                      })}
                    </div>
                  </>
                )}

                <div className="border-t my-2 pt-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => {
                      navigate("/profile")
                      setIsMenuOpen(false)
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => {
                    navigate("/login")
                    setIsMenuOpen(false)
                  }}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button
                  className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    navigate("/register")
                    setIsMenuOpen(false)
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrarse
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
