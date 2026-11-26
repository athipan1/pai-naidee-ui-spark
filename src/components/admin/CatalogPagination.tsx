const pageSize = 30;

export default function CatalogPagination({ position, page, total, disabled, onPage }: {
  position: 'top' | 'bottom';
  page: number;
  total: number;
  disabled: boolean;
  onPage: (page: number) => void;
}) {
  const pageCount = Math.ceil(total / pageSize);
  if (pageCount < 2) return null;

  return <nav aria-label={position === 'top' ? 'หน้าผลค้นหาด้านบน' : 'หน้าผลค้นหาด้านล่าง'}
    className={'flex flex-wrap items-center justify-between gap-2 border-t pt-3 ' + (position === 'top' ? 'scroll-mt-24' : '')}>
    <p className="text-sm text-muted-foreground">
      หน้า {page} / {pageCount} <span className="whitespace-nowrap">· {total.toLocaleString('th-TH')} สถานที่</span>
    </p>
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" disabled={disabled || page === 1} className="min-h-11 rounded-lg border px-3 text-sm disabled:opacity-40" onClick={() => onPage(page - 1)}>ก่อนหน้า</button>
      <select aria-label="เลือกหน้า" disabled={disabled} value={page}
        className="min-h-11 rounded-lg border bg-background px-2 text-sm text-foreground"
        onChange={event => onPage(Number(event.target.value))}>
        {Array.from({ length: pageCount }, (_, i) => <option key={i + 1} value={i + 1}>หน้า {i + 1}</option>)}
      </select>
      <button type="button" disabled={disabled || page === pageCount} className="min-h-11 rounded-lg border px-3 text-sm disabled:opacity-40" onClick={() => onPage(page + 1)}>ถัดไป</button>
    </div>
  </nav>;
}
