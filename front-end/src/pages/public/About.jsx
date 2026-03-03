import { Award, Leaf, Heart, Mail } from 'lucide-react';
import { useI18n } from '../../i18n';

const values = [
    { icon: Award, colorClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400', key: 'quality' },
    { icon: Leaf, colorClass: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400', key: 'sustainability' },
    { icon: Heart, colorClass: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400', key: 'customer' },
];

export default function About() {
    const { t } = useI18n();

    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <section className="relative overflow-hidden py-20 px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10" />
                <div className="container mx-auto text-center relative z-10 animate-fadeIn">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        {t('about.title')}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t('about.subtitle')}
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-3xl mx-auto text-center animate-slideUp">
                    <h2 className="text-2xl font-bold text-foreground mb-6">{t('about.mission')}</h2>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                        {t('about.missionText')}
                    </p>
                </div>
            </section>

            {/* Values */}
            <section className="bg-muted/30 py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-foreground text-center mb-12">{t('about.values')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-animation">
                        {values.map(({ icon: Icon, colorClass, key }) => (
                            <div
                                key={key}
                                className="bg-card border border-border rounded-xl p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${colorClass} mb-6`}>
                                    <Icon className="h-7 w-7" />
                                </div>
                                <h3 className="font-semibold text-foreground text-lg mb-3">{t(`about.${key}`)}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {t(`about.${key}Desc`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-6">
                        <Mail className="h-7 w-7" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">{t('about.contact')}</h2>
                    <p className="text-muted-foreground mb-4">{t('about.contactDesc')}</p>
                    <a
                        href="mailto:hello@lumo.store"
                        className="text-primary hover:underline font-medium"
                    >
                        {t('about.emailUs')} hello@lumo.store
                    </a>
                </div>
            </section>
        </div>
    );
}
