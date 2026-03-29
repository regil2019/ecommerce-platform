import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useI18n } from '../../i18n';
import { Skeleton } from '../../components/ui/skeleton';
import { getImageUrl } from '../../lib/utils';
import { ArrowRight, Tag } from 'lucide-react';


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
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('home.categories')}</h1>
                <p className="text-muted-foreground mt-2">{t('home.categoriesDesc')}</p>
            </div>

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
                            className="group block rounded-2xl overflow-hidden border border-border/50 bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="overflow-hidden bg-muted aspect-[4/3] relative">
                                {category.image ? (
                                    <img
                                        src={getImageUrl(category.image)}
                                        alt={category.name}
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                        <Tag className="h-12 w-12 text-primary/30" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                    <span className="text-white text-sm font-semibold px-4 py-1.5 bg-white/20 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                                        {t('home.viewAll')} <ArrowRight className="h-3.5 w-3.5" />
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-base group-hover:text-primary transition-colors text-foreground line-clamp-1">
                                    {category.name}
                                </h3>
                                {category.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Categories;
