import { Link } from 'react-router-dom';
import { CheckCircle, Package, ShoppingBag } from 'lucide-react';
import { useI18n } from '../../i18n';
import { Button } from '../../components/ui/Button';

export default function OrderSuccess() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center bg-card border border-border rounded-xl shadow-card p-10 animate-bounceIn">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
          <CheckCircle className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('orderSuccess.title')}</h1>
        <p className="text-lg text-primary mb-2">{t('orderSuccess.thankYou')}</p>
        <p className="text-muted-foreground mb-8">{t('orderSuccess.desc')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/orders" className="inline-flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t('orderSuccess.viewOrders')}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/" className="inline-flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              {t('orderSuccess.continueShopping')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
