import type { StrapiApp } from '@strapi/strapi/admin';
import './custom-admin.css';

export default {
  config: {
    locales: [],
    translations: {
      en: {
        'app.components.LeftMenu.navbrand.title': 'Wincore',
        'app.components.LeftMenu.navbrand.workplace': 'The Safe Space Global',
      },
    },
    theme: {
      light: {
        colors: {
          primary100: '#f0f4ff',
          primary200: '#d0dcff',
          primary500: '#4f46e5',
          primary600: '#4338ca',
          primary700: '#3730a3',
          buttonPrimary500: '#4f46e5',
          buttonPrimary600: '#4338ca',
        },
      },
    },
    head: {
      favicon: '/favicon.png',
    },
  },
  bootstrap(_app: StrapiApp) {
    // Hide Marketplace, Cloud plugin, and purchase-* nav entries.
    const hideNavItems = () => {
      const links = Array.from(document.querySelectorAll('a[href]')) as HTMLAnchorElement[];
      for (const link of links) {
        const href = link.getAttribute('href') || '';
        const text = (link.textContent || '').toLowerCase();
        
        const shouldHide =
          href.includes('marketplace') || text.trim() === 'marketplace' ||
          href.includes('cloud') || text.trim() === 'cloud' ||
          href.includes('purchase-content-releases') ||
          href.includes('purchase-review-workflows') ||
          href.includes('purchase-single-sign-on') ||
          href.includes('purchase-audit-logs') ||
          href.includes('purchase-content-history') ||
          text.includes('purchase') ||
          text.includes('content history') ||
          text.includes('review workflow') ||
          text.includes('single sign-on') ||
          text.includes('audit log');
        
        if (!shouldHide) continue;

        const navItem =
          link.closest('li') ||
          link.closest('[role="listitem"]') ||
          link.closest('[data-strapi-header-nav]');
        if (navItem instanceof HTMLElement) {
          navItem.style.display = 'none';
        } else if (link instanceof HTMLElement) {
          link.style.display = 'none';
        }
      }
    };

    hideNavItems();
    const observer = new MutationObserver(() => hideNavItems());
    observer.observe(document.body, { childList: true, subtree: true });
  },
};
