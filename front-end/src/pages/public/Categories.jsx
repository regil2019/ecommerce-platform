import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useI18n } from '../../i18n';
import { Skeleton } from '../../components/ui/skeleton';
import { getImageUrl } from '../../lib/utils';


const Categories = () => {
    const { t } = useI18n();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                if (Array.isArray(response.data)) {
                    setCategories(response.data);
                } else {
                    // Handle pagination wrapper if exists, though controller returns array directly
                    setCategories(response.data.data || []);
                }
            } catch (err) {
                console.error("Error loading categories:", err);
                setError(t('common.errorLoad'));
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [t]);

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <h1 className="text-3xl font-bold mb-8">{t('home.categories')}</h1>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-48 w-full rounded-xl" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-xl">
                    <p className="text-muted-foreground text-lg">{t('admin.noCategories')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <Link
                            to={`/products?category=${encodeURIComponent(category.name)}`}
                            key={category.id}
                            className="group block space-y-3"
                        >
                            <div className="overflow-hidden rounded-xl bg-muted aspect-square relative">
                                {category.image ? (
                                    <img
                                        src={getImageUrl(category.image)}
                                        alt={category.name}
                                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
                                        <span className="text-2xl font-bold opacity-30">{category.name?.[0] || '?'}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white font-medium px-4 py-2 bg-black/50 rounded-full backdrop-blur-sm">Ver Produtos</span>
                                </div>
                            </div>
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors text-center">
                                {category.name}
                            </h3>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Categories;
