import { useEffect, useRef, useState } from 'react';
import { cmsImageFilename, hasCmsImageVariants } from '@/shared/utils/cmsImageDelivery';
import { RateLimitError, retryAfterTime } from '@/shared/utils/retryAfter';

type RequestAdmin = (path: string, options?: RequestInit) => Promise<Response>;
type Preview = { promise: Promise<string>; release: () => void };

// Only share a blob among currently mounted consumers of the same authenticated request.
const requests = new WeakMap<RequestAdmin, Map<string, {
  controller: AbortController;
  users: number;
  promise: Promise<string>;
  url?: string;
}>>();
const cooldowns = new WeakMap<RequestAdmin, number>();

function acquirePreview(request: RequestAdmin, path: string): Preview {
  const previews = requests.get(request) ?? new Map();
  requests.set(request, previews);
  let entry = previews.get(path);
  if (!entry) {
    const controller = new AbortController();
    const retryAt = cooldowns.get(request) ?? 0;
    const responsePromise = retryAt > Date.now()
      ? Promise.reject(new RateLimitError(retryAt))
      : request(path, { signal: controller.signal });
    const promise = responsePromise.then(response => {
      if (response.status === 429) {
        const deadline = Math.max(cooldowns.get(request) ?? 0, retryAfterTime(response.headers.get('Retry-After')));
        cooldowns.set(request, deadline);
        throw new RateLimitError(deadline);
      }
      if (!response.ok) throw new Error('Preview unavailable');
      return response.blob();
    }).then(blob => {
      controller.signal.throwIfAborted();
      return URL.createObjectURL(blob);
    });
    const pending = { controller, users: 0, promise, url: undefined as string | undefined };
    void promise.then(url => { pending.url = url; }, () => {
      if (previews.get(path) === pending) previews.delete(path);
    });
    previews.set(path, pending);
    entry = pending;
  }
  const current = entry!;
  current.users++;
  return {
    promise: current.promise,
    release() {
      if (--current.users !== 0) return;
      if (previews.get(path) === current) previews.delete(path);
      current.controller.abort();
      if (current.url) URL.revokeObjectURL(current.url);
    },
  };
}

export default function AdminMediaPreview({ url, base, request, alt, className, size = 256, eager = false }: {
  url: string;
  base: string;
  request: RequestAdmin;
  alt: string;
  className: string;
  size?: 256 | 640;
  eager?: boolean;
}) {
  const placeholder = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [preview, setPreview] = useState<{ url: string; src: string } | null>(null);
  const [failed, setFailed] = useState('');
  const [retryAfter, setRetryAfter] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const filename = cmsImageFilename(url, base);

  useEffect(() => {
    if (!filename || eager || visible || !placeholder.current) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) setVisible(true);
    }, { rootMargin: '200px' });
    observer.observe(placeholder.current);
    return () => observer.disconnect();
  }, [filename, visible, eager]);

  useEffect(() => {
    if (!filename || (!eager && !visible)) return;
    let mounted = true;
    const width = hasCmsImageVariants(filename) ? `?w=${size}` : '';
    const image = acquirePreview(request, `/media/${filename}${width}`);
    void image.promise.then(src => {
      if (mounted) setPreview({ url, src });
    }).catch(error => {
      if (!mounted) return;
      setFailed(url);
      setRetryAfter(error instanceof RateLimitError ? error.retryAt : 0);
    });
    return () => {
      mounted = false;
      image.release();
    };
  }, [filename, url, request, size, visible, eager, attempt]);

  useEffect(() => {
    if (!retryAfter) return;
    const timer = window.setTimeout(() => setRetryAfter(0), Math.min(2_147_483_647, Math.max(0, retryAfter - Date.now())));
    return () => window.clearTimeout(timer);
  }, [retryAfter]);

  const src = filename ? (preview?.url === url ? preview.src : null) : /^https:\/\//i.test(url) ? url : null;
  if (failed === url) {
    return <div className={`${className} flex flex-col items-center justify-center gap-1 bg-slate-100 p-3 text-xs text-slate-600`}>
      <span role="img" aria-label={`${alt}: โหลดภาพไม่สำเร็จ`}>{retryAfter ? 'ระบบได้รับคำขอรูปมากเกินไป กรุณารอสักครู่' : 'โหลดภาพไม่สำเร็จ'}</span>
      {filename && <button type="button" className="underline disabled:opacity-50" disabled={Boolean(retryAfter)} onClick={() => {
        const deadline = cooldowns.get(request) ?? 0;
        if (deadline > Date.now()) { setRetryAfter(deadline); return; }
        setFailed('');
        setPreview(null);
        setAttempt(value => value + 1);
      }}>ลองโหลดรูปใหม่</button>}
    </div>;
  }
  if (!src) return <span ref={placeholder} className={`${className} block animate-pulse bg-slate-100`} aria-label="กำลังโหลดภาพ" />;
  return <img src={src} alt={alt} className={className} width={size} height={size * 3 / 4} loading={filename ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(url)} />;
}
