import { useI18n } from '../../i18n';
import { Shield } from 'lucide-react';

export default function Privacy() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden py-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-6">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{t('privacy.title')}</h1>
          <p className="text-muted-foreground">{t('privacy.lastUpdated')}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">

          <section className="rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly, such as when you create an account, place an order, or contact us. This includes your name, email address, shipping address, and payment details (processed securely via Stripe).
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
            <ul className="text-muted-foreground space-y-2 leading-relaxed">
              <li>• Process and fulfill your orders</li>
              <li>• Send order confirmation and shipping updates</li>
              <li>• Provide customer support</li>
              <li>• Improve our services and personalize your experience</li>
              <li>• Send promotional communications (you may opt out at any time)</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-4">3. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures including SSL encryption (256-bit) to protect your personal information. Payment data is processed by Stripe and is never stored on our servers.
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-4">4. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies to maintain your session, remember your preferences, and analyze site traffic. By using our website, you consent to our use of cookies.
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-4">5. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use trusted third-party services including Stripe for payments and Cloudinary for image hosting. These services have their own privacy policies.
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to access, update, or delete your personal data at any time. Contact us at <a href="mailto:hello@lumo.store" className="text-primary hover:underline">hello@lumo.store</a> for any privacy-related requests.
            </p>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-4">7. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy questions or concerns, please contact us at{' '}
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
