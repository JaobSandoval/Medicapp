import { Link, useNavigate } from 'react-router-dom';
import { IoPersonCircle, IoLogOut, IoHome } from 'react-icons/io5';
import { useAuthStore } from '../store/authStore';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/circles" className="navbar-brand">
          <span className="navbar-logo">🏥</span>
          <span className="navbar-title">Care Circle</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/circles" className="navbar-link">
            <IoHome />
            <span>Mis Círculos</span>
          </Link>

          <div className="navbar-user">
            <IoPersonCircle className="navbar-avatar" />
            <span className="navbar-username">{user?.name}</span>
          </div>

          <button className="navbar-logout" onClick={handleLogout}>
            <IoLogOut />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
