import Navbar from './components/Navbar'
import Manager from './components/Manager'
import Footer from './components/Footer'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Create a ProtectedRoute component to act as a guard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

 const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <Navbar />
          <Manager />
          <Footer />
        </ProtectedRoute>
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

function App() {

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <RouterProvider router={router} />
    </>
  )
}

export default App
