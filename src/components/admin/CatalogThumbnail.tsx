import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import OptimizedImage from '@/components/common/OptimizedImage';

export default function CatalogThumbnail({ src }: { src?: string | null }) {
  const element = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!src || visible || !element.current) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '64px 0px' });
    observer.observe(element.current);
    return () => observer.disconnect();
  }, [src, visible]);

  if (src && visible) {
    return <OptimizedImage src={src} alt="" width={56} height={56} loading="lazy" fetchPriority="low" className="h-14 w-14 shrink-0 rounded-xl object-cover" />;
  }

  return <span ref={element} aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100"><MapPin className="text-slate-400" /></span>;
}
