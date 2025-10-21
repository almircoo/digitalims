import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { Routes, Route, BrowserRouter } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import { Toaster } from "sonner";
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Dashbaord } from "@/pages/Dashbaord";
import { Categories } from "@/pages/Categories";
import { Products } from "@/pages/Products";
import { Customers } from "@/pages/Customers";
import { Orders } from "@/pages/Orders";
import { Reports } from "@/pages/Reports";

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* privaite routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole={["ADMIN", "USER"]}>
                  <Dashbaord />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute requiredRole={["ADMIN", "USER"]}>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute requiredRole={["ADMIN", "USER"]}>
                  <Customers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute requiredRole={["ADMIN", "USER"]}>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Reports />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </>
  );
}

export default App;
