import { Link } from 'react-router-dom';
import { XCircle, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useI18n } from '../../i18n';
import { Button } from '../../components/ui/Button';

export default function OrderCancel() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center bg-card border border-border rounded-xl shadow-card p-10 animate-fadeIn">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 text-destructive mb-6">
          <XCircle className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('orderCancel.title')}</h1>
        <p className="text-muted-foreground mb-8">{t('orderCancel.desc')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/cart" className="inline-flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              {t('orderCancel.backToCart')}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('nav.home')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
