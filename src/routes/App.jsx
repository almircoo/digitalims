import React from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { Routes, Route, BrowserRouter } from 'react-router'
import { ProtectedRoute } from './ProtectedRoute'
import { Toaster } from 'sonner'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Dashbaord } from '@/pages/Dashbaord'
import { Home } from '@/pages/Home'

function App() {

  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Home/>} /> 
            <Route path='/login' element={<Login/>} />
            <Route path='/register' element={<Register/>} />
            
            {/* privaite routes */}
            <Route path='/dashboard' element={<ProtectedRoute><Dashbaord/></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </>
  )
}

export default App
