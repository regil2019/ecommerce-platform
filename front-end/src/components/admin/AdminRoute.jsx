// src/components/AdminRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  if (loading) {
    return <div className='text-center p-4'>Carregando...</div>;
  }

  return children;
}
