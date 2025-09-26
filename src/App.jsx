// web/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layouts/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './auth/AuthContext';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Loader from './components/Loader';
import ThemeLoader from './components/dashboard/ThemeLoader';
import { SettingsProvider } from './context/settingsContext';
import { CartProvider } from './context/cartContext';
import LandPage from './pages/LandPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

export default function App() {
  const { user, loading } = useAuth();



  return (
    
    <SettingsProvider>
      
      {loading ? (
        <Loader />
      ) : (
      <ThemeLoader>
        
        <CartProvider>


        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              
              <Route index element={<LandPage />} />
              <Route path="/products" element={<Home />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route
                path="/profile"
                element={
                  user
                    ? <Profile />
                    : <Navigate to="/login" replace />
                }
              />
              <Route
                path="/dashboard"
                element={
                  user?.role === 'admin'
                    ? <Dashboard />
                    : <Navigate to="/" replace />
                }
              />
              <Route
                path="/cart"
                element={
                  user
                    ? <Cart />
                    : <Navigate to="/login" replace />
                }
              />
              <Route path="/checkout" element={user ? <Checkout /> : <Navigate to="/login" replace />} />
              
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>    
        </Router>
        </CartProvider>
      </ThemeLoader>)}
    </SettingsProvider>
  );
}
