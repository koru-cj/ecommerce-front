import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function GuestRoute({ children }) {
  const { token } = useAuth();

  // 🔒 Si hay token → redirige al home
  if (token) return <Navigate to="/" replace />;

  return children;
}
