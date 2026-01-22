import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function NotFound() {
  const t = useTranslations('navigation');
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-ctp-text">
      <h1 className="text-6xl font-bold animated-gradient-text mb-4">404</h1>
      <p className="text-xl mb-8">Page Not Found</p>
      <Link
        href="/public"
        className="px-6 py-2 bg-ctp-lavender text-ctp-base rounded-full font-semibold hover:bg-ctp-teal transition-colors"
      >
        {t('home')}
      </Link>
    </div>
  );
}
