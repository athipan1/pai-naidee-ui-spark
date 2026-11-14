import { useEffect, useRef, useState } from 'react';
import { cmsImageFilename, hasCmsImageVariants } from '@/shared/utils/cmsImageDelivery';

type RequestAdmin = (path: string, options?: RequestInit) => Promise<Response>;
type Preview = { promise: Promise<string>; release: () => void };

// Only share a blob among currently mounted consumers of the same authenticated request.
const requests = new WeakMap<RequestAdmin, Map<string, {
  controller: AbortController;
  users: number;
  promise: Promise<string>;
  url?: string;
}>>();

function acquirePreview(request: RequestAdmin, path: string): Preview {
  const previews = requests.get(request) ?? new Map();
  requests.set(request, previews);
  let entry = previews.get(path);
  if (!entry) {
    const controller = new AbortController();
    const promise = request(path, { signal: controller.signal }).then(response => {
      if (!response.ok) throw new Error('Preview unavailable');
      return response.blob();
    }).then(blob => {
      controller.signal.throwIfAborted();
      return URL.createObjectURL(blob);
    });
    const pending = { controller, users: 0, promise, url: undefined as string | undefined };
    void promise.then(url => { pending.url = url; }, () => {});
    previews.set(path, pending);
    entry = pending;
  }
  const current = entry!;
  current.users++;
  return {
    promise: current.promise,
    release() {
      if (--current.users !== 0) return;
      previews.delete(path);
      current.controller.abort();
      if (current.url) URL.revokeObjectURL(current.url);
    },
  };
}

export default function AdminMediaPreview({ url, base, request, alt, className, size = 256 }: {
  url: string;
  base: string;
  request: RequestAdmin;
  alt: string;
  className: string;
  size?: 256 | 640;
}) {
  const placeholder = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [preview, setPreview] = useState<{ url: string; src: string } | null>(null);
  const [failed, setFailed] = useState('');
  const filename = cmsImageFilename(url, base);

  useEffect(() => {
    if (!filename || visible || !placeholder.current) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) setVisible(true);
    }, { rootMargin: '200px' });
    observer.observe(placeholder.current);
    return () => observer.disconnect();
  }, [filename, visible]);

  useEffect(() => {
    if (!filename || !visible) return;
    let mounted = true;
    const width = hasCmsImageVariants(filename) ? `?w=${size}` : '';
    const image = acquirePreview(request, `/media/${filename}${width}`);
    void image.promise.then(src => {
      if (mounted) setPreview({ url, src });
    }).catch(() => { if (mounted) setFailed(url); });
    return () => {
      mounted = false;
      image.release();
    };
  }, [filename, url, request, size, visible]);

  const src = filename ? (preview?.url === url ? preview.src : null) : /^https:\/\//i.test(url) ? url : null;
  if (failed === url) return <span role="img" aria-label={`${alt}: โหลดภาพไม่สำเร็จ`} className={`${className} flex items-center justify-center bg-slate-100 p-3 text-xs text-slate-600`}>โหลดภาพไม่สำเร็จ</span>;
  if (!src) return <span ref={placeholder} className={`${className} block animate-pulse bg-slate-100`} aria-label="กำลังโหลดภาพ" />;
  return <img src={src} alt={alt} className={className} width={size} height={size * 3 / 4} loading={filename ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(url)} />;
}
