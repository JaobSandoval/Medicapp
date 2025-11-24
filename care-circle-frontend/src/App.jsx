import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Circles from './pages/Circles';
import CircleDetail from './pages/CircleDetail';
import Medications from './pages/Medications';
import Calendar from './pages/Calendar';
import Tasks from './pages/Tasks';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/circles" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/circles" /> : <Register />} 
        />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/circles" element={<Circles />} />
          <Route path="/circles/:circleId" element={<CircleDetail />} />
          <Route path="/circles/:circleId/medications" element={<Medications />} />
          <Route path="/circles/:circleId/calendar" element={<Calendar />} />
          <Route path="/circles/:circleId/tasks" element={<Tasks />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/circles" : "/login"} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
