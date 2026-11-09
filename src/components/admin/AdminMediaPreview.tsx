import { useEffect, useState } from 'react';

// Private draft media uses the existing authenticated endpoint. Tokens never enter image URLs.
export default function AdminMediaPreview({ url, base, request, alt, className }: {
  url: string; base: string; request: (path: string, options?: RequestInit) => Promise<Response>; alt: string; className: string;
}) {
  const [preview, setPreview] = useState<{url: string; src: string} | null>(null);
  const [failed, setFailed] = useState('');
  let filename: string | null = null;
  try {
    const parsed = new URL(url);
    if (parsed.origin === new URL(base, window.location.origin).origin)
      filename = /^\/api\/media\/cms\/([a-f0-9-]{36}\.(?:jpg|png|webp))$/.exec(parsed.pathname)?.[1] ?? null;
  } catch { /* Invalid URLs use the fallback below. */ }
  useEffect(() => {
    if (!filename) return;
    const controller = new AbortController(); let objectUrl: string | undefined;
    void request(`/media/${filename}`, {signal: controller.signal}).then(response => {
      if (!response.ok) throw new Error('Preview unavailable');
      return response.blob();
    }).then(blob => {
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(blob); setPreview({url, src:objectUrl});
    }).catch(() => { if (!controller.signal.aborted) setFailed(url); });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [filename, url, request]);
  const src = filename ? (preview?.url === url ? preview.src : null) : /^https:\/\//i.test(url) ? url : null;
  if (failed === url) return <span role="img" aria-label={`${alt}: โหลดภาพไม่สำเร็จ`} className={`${className} flex items-center justify-center bg-slate-100 p-3 text-xs text-slate-600`}>โหลดภาพไม่สำเร็จ</span>;
  if (!src) return <span className={`${className} block animate-pulse bg-slate-100`} aria-label="กำลังโหลดภาพ" />;
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(url)} />;
}
