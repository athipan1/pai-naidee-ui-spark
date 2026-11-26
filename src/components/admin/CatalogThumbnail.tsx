import { useEffect, useRef, useState } from 'react';
import { MapPin, RotateCcw } from 'lucide-react';
import OptimizedImage from '@/components/common/OptimizedImage';
import { cmsImageFilename, hasCmsImageVariants } from '@/shared/utils/cmsImageDelivery';
import { queueCatalogMedia } from '@/shared/utils/catalogMediaQueue';
import { RateLimitError } from '@/shared/utils/retryAfter';

const frame = 'relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground';

function Thumbnail({ src }: { src: string }) {
  const element = useRef<HTMLSpanElement>(null);
  const objectUrl = useRef('');
  const [visible, setVisible] = useState(false);
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const filename = cmsImageFilename(src);

  useEffect(() => {
    if (!element.current) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    // A jump to the bottom paginator must not enqueue intervening rows.
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(element.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = '';
  }, []);

  useEffect(() => {
    if (!filename || !visible || error || objectUrl.current) return;
    let mounted = true;
    const lease = queueCatalogMedia(hasCmsImageVariants(filename) ? src + '?w=256' : src);
    void lease.promise.then(blob => {
      if (!mounted) return;
      objectUrl.current = URL.createObjectURL(blob);
      setImage(objectUrl.current);
    }).catch(reason => {
      if (!mounted) return;
      setError(reason instanceof RateLimitError ? 'คำขอรูปมากเกินไป (HTTP 429) · ลองใหม่เมื่อพร้อม' : 'รูปภาพไม่พร้อมใช้งาน');
    });
    return () => { mounted = false; lease.release(); };
  }, [filename, src, visible, error]);

  function retry() {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = '';
    setImage('');
    setError('');
  }

  return <span ref={element} className={frame}>
    {error ? (
      <button type="button" aria-label="ลองโหลดรูปใหม่" title={error} onClick={retry}
        className="flex h-11 w-11 items-center justify-center rounded-lg focus-visible:outline focus-visible:outline-2">
        <RotateCcw size={16} />
        <span role="status" className="sr-only">{error}</span>
      </button>
    ) : image ? (
      <img src={image} alt="" width={56} height={56} decoding="async" className="h-full w-full rounded-xl object-cover"
        onError={() => setError('รูปภาพไม่พร้อมใช้งาน')} />
    ) : !filename && visible ? (
      <OptimizedImage src={src} alt="" width={56} height={56} loading="lazy" fetchPriority="low" className="h-14 w-14 rounded-xl object-cover" />
    ) : <MapPin aria-hidden="true" />}
  </span>;
}

export default function CatalogThumbnail({ src }: { src?: string | null }) {
  return src ? <Thumbnail key={src} src={src} /> : <span aria-hidden="true" className={frame}><MapPin /></span>;
}
