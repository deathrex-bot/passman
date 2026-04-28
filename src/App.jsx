import { useState } from 'react'
import Navbar from './components/Navbar'
import Manager from './components/Manager'
import Footer from './components/Footer'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

function App() {

  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <>
          <Navbar />
          <Manager />
          <Footer />
        </>
      )
    },

    {
      path: '/login',
      element: <Login />
    },

    {
      path: '/signup',
      element: <Signup />
    }
  ])


  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App

// trigger review
