import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { LumoLogo } from './LumoLogo';

import { SubscribeButton } from './magicui/SubscribeButton';

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-8 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Brand */}
          <div className="space-y-3">
            <Link to="/">
              <LumoLogo 
                width={120} 
                height={40} 
                className="dark:brightness-110" 
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t('about.subtitle')}
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.shop')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.allProducts')}
                </Link>
              </li>
              <li>
                <Link to="/products?sort=newest" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.newArrivals')}
                </Link>
              </li>
              <li>
                <Link to="/products?sort=popular" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.bestSellers')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.support')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.helpCenter')}
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground">{t('footer.shippingInfo')}</span>
              </li>
              <li>
                <span className="text-muted-foreground">{t('footer.returns')}</span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground">{t('footer.privacy')}</span>
              </li>
              <li>
                <span className="text-muted-foreground">{t('footer.terms')}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.newsletter')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('footer.newsletterDesc')}</p>
            <SubscribeButton
              buttonColor="hsl(var(--primary))"
              buttonTextColor="hsl(var(--primary-foreground))"
              initialText={t('footer.subscribe')}
              changeText={t('footer.subscribed')}
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {t('footer.rights', { year: String(year) })}
          </p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="GitHub">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
