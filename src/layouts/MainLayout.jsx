import React from 'react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export const MainLayout = ({children}) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
      <Footer />
    </div>
  )
}