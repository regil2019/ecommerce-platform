import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '@/i18n';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const { t } = useI18n();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  if (loading) {
    return <div className='text-center p-4 text-foreground'>{t("common.loading")}</div>;
  }

  return children;
}
