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
import { SettingsProvider } from './context/settingsContext';
import { CartProvider } from './context/cartContext';
import LandPage from './pages/LandPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import VerifyEmail from './pages/VerifyEmail';
import GuestRoute from './auth/GuestRoute';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentPending from './pages/PaymentPending';
import PaymentFailure from './pages/PaymentFailure';
import Pedidos from './pages/Pedidos';
import Seguimiento from './pages/Seguimiento';
import OrderDetail from './pages/OrderDetail';

export default function App() {
  const { user, loading } = useAuth();

  return (
    <SettingsProvider>
      {loading ? (
        <Loader />
      ) : (
          <CartProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Layout />}>
                  {/* Públicas */}
                  <Route index element={<LandPage />} />
                  <Route path="products" element={<Home />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="payment/success" element={<PaymentSuccess />} />
                  <Route path="payment/pending" element={<PaymentPending />} />
                  <Route path="payment/failure" element={<PaymentFailure />} />
                  <Route path="verify-email" element={<VerifyEmail />} />

                  {/* Solo para no logueados */}
                  <Route
                    path="login"
                    element={
                      <GuestRoute>
                        <Login />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="register"
                    element={
                      <GuestRoute>
                        <Register />
                      </GuestRoute>
                    }
                  />

                  {/* Privadas usuario */}
                  <Route
                    path="profile"
                    element={user ? <Profile /> : <Navigate to="/login" replace />}
                  />
                  <Route
                    path="checkout"
                    element={user ? <Checkout /> : <Navigate to="/login" replace />}
                  />
                  <Route
                    path="pedidos"
                    element={user ? <Pedidos /> : <Navigate to="/login" replace />}
                  />
                  <Route
                    path="seguimiento"
                    element={user ? <Seguimiento /> : <Navigate to="/login" replace />}
                  />
                  <Route
                    path="pedidos/:id"
                    element={user ? <OrderDetail /> : <Navigate to="/login" replace />}
                  />

                  {/* Admin */}
                  <Route
                    path="dashboard"
                    element={
                      user?.role === 'admin'
                        ? <Dashboard />
                        : <Navigate to="/" replace />
                    }
                  />

                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Router>
          </CartProvider>
      )}
    </SettingsProvider>
  );
}