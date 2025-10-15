import React from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { Routes, Route, BrowserRouter } from 'react-router'
import { Toaster } from 'sonner'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'

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
            
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </>
  )
}

export default App
