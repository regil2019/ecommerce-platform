import { useI18n } from '../../i18n';
import { FileText } from 'lucide-react';

export default function Terms() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden py-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-6">
            <FileText className="h-7 w-7" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{t('terms.title')}</h1>
          <p className="text-muted-foreground">{t('terms.lastUpdated')}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
        <div className="space-y-6">

          <section className="rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Lumo Store, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-4">2. Use of Service</h2>
            <ul className="text-muted-foreground space-y-2 leading-relaxed">
              <li>• You must be at least 18 years old to make purchases</li>
              <li>• You are responsible for maintaining the confidentiality of your account</li>
              <li>• You agree not to use the service for any unlawful purpose</li>
              <li>• We reserve the right to refuse service to anyone for any reason</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-4">3. Orders & Payment</h2>
            <p className="text-muted-foreground leading-relaxed">
              All orders are subject to product availability and acceptance. Prices are subject to change without notice. Payment is processed securely through Stripe. We accept major credit cards and other payment methods available through Stripe.
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-4">4. Shipping & Delivery</h2>
            <p className="text-muted-foreground leading-relaxed">
              Delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers or customs. Free shipping is available on orders over €100.
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-4">5. Returns & Refunds</h2>
            <p className="text-muted-foreground leading-relaxed">
              We offer free returns within 30 days of delivery. Items must be in their original condition and packaging. Refunds are processed within 5-10 business days of receiving the returned item.
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content on Lumo Store, including text, graphics, logos, and images, is the property of Lumo and is protected by applicable copyright laws.
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lumo shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services or products.
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-4">8. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any questions about these Terms, please contact us at{' '}
              <a href="mailto:hello@lumo.store" className="text-primary hover:underline font-medium">
                hello@lumo.store
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
