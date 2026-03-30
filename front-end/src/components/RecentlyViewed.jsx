import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, getImageUrl } from '../lib/utils';
import { useI18n } from '../i18n';

const STORAGE_KEY = 'recently_viewed';

export default function RecentlyViewed({ excludeId }) {
  const { t } = useI18n();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      .filter(id => String(id) !== String(excludeId))
      .slice(0, 6);

    if (ids.length === 0) return;

    Promise.all(ids.map(id => api.get(`/products/${id}`).catch(() => null)))
      .then(results => {
        const valid = results.filter(Boolean).map(r => r.data).filter(Boolean);
        setProducts(valid);
      });
  }, [excludeId]);

  if (products.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
        <Clock className="h-5 w-5 text-primary" />
        {t('product.recentlyViewed')}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map(product => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="group flex flex-col rounded-xl border border-border/50 bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200"
          >
            <div className="aspect-square overflow-hidden bg-muted">
              <img
                src={getImageUrl(product.images?.[0] || product.main_image)}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-2">
              <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">{product.name}</p>
              <p className="text-xs font-bold text-primary mt-1">{formatCurrency(product.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
