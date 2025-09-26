import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../auth/AuthContext';
import { useState} from 'react'

export default function Layout() {
  const { user, logout } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const hideNavbarOnRoutes = ['/login', '/Register'];
  const shouldHideNavbar = hideNavbarOnRoutes.includes(location.pathname);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div>
      {!shouldHideNavbar && (
        <>
          <Navbar user={user} handleLogout={handleLogout} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <hr />
        </>
      )}

      <Outlet context={{ searchQuery, setSearchQuery }} />
    </div>
  );
}
