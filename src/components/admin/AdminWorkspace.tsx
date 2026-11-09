import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Compass, LayoutDashboard, MapPin, Plus, FilePenLine, Clock3, ShieldCheck, Settings2, Menu, PanelLeftClose, PanelLeftOpen, LogOut, ArrowUpRight } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import './admin-workspace.css';

export type AdminView = 'overview' | 'new' | 'existing' | 'drafts' | 'history' | 'quality' | 'settings';
const groups = [
  { label: 'พื้นที่ทำงาน', items: [{ id: 'overview', label: 'ภาพรวมข้อมูล', Icon: LayoutDashboard }] },
  { label: 'จัดการสถานที่', items: [{ id: 'existing', label: 'สถานที่ทั้งหมด', Icon: MapPin }, { id: 'new', label: 'เพิ่ม / แก้ไข', Icon: Plus }, { id: 'drafts', label: 'ฉบับร่าง', Icon: FilePenLine }, { id: 'history', label: 'ประวัติการเผยแพร่', Icon: Clock3 }, { id: 'quality', label: 'คุณภาพรายจังหวัด', Icon: ShieldCheck }] },
  { label: 'ระบบ', items: [{ id: 'settings', label: 'การตั้งค่า AI', Icon: Settings2 }] },
] as const;
export default function AdminWorkspace({ view, onNavigate, onSignOut, busy, children }: { view: AdminView; onNavigate: (view: AdminView) => void; onSignOut: () => void; busy: boolean; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const navigation = (compact = false) => <nav aria-label="ส่วนจัดการสถานที่" className="space-y-6">
    {groups.map(group => <div key={group.label}><p className={`mb-2 px-3 text-xs font-semibold tracking-wide text-slate-500 ${compact ? 'sr-only' : ''}`}>{group.label}</p><div className="space-y-1">
      {group.items.map(({ id, label, Icon }) => <button key={id} type="button" title={label} aria-label={label} aria-current={view === id ? 'page' : undefined} disabled={busy} onClick={() => { onNavigate(id); setDrawer(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${view === id ? 'bg-teal-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}><Icon size={19} className="shrink-0" /><span className={compact ? 'sr-only' : 'break-words'}>{label}</span></button>)}
    </div></div>)}
    <Link to="/" className="flex items-center gap-3 px-3 py-3 text-sm text-slate-600"><ArrowUpRight size={19} /><span className={compact ? 'sr-only' : ''}>ดูเว็บไซต์</span></Link>
    <button type="button" disabled={busy} onClick={onSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-600 hover:bg-slate-100"><LogOut size={19} /><span className={compact ? 'sr-only' : ''}>ออกจากระบบ</span></button>
  </nav>;
  return <div className="admin-workspace min-h-screen bg-slate-50 text-slate-900">
    <a href="#admin-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:p-3">ข้ามไปเนื้อหา</a>
    <aside className={`fixed inset-y-0 left-0 z-30 hidden overflow-y-auto border-r border-slate-200 bg-white p-4 lg:block ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="mb-10 flex items-center gap-3 px-2 pt-3"><Compass className="shrink-0 text-teal-800" size={28} />{!collapsed && <div><p className="font-bold tracking-tight">ไปไหนดี<span className="text-teal-700">.</span></p><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-slate-500">Content Studio</p></div>}</div>
      {navigation(collapsed)}
      <button type="button" aria-label={collapsed ? 'ขยายเมนู' : 'ย่อเมนู'} onClick={() => setCollapsed(!collapsed)} className="mt-8 rounded-lg border p-3">{collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button>
    </aside>
    <div className={collapsed ? 'lg:pl-20' : 'lg:pl-64'}>
      <header className="sticky top-0 z-20 flex min-w-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-8">
        <div className="flex min-w-0 items-center gap-3"><Sheet open={drawer} onOpenChange={setDrawer}><SheetTrigger asChild><button type="button" aria-label="เปิดเมนูแอดมิน" className="rounded-xl border p-3 lg:hidden"><Menu size={20} /></button></SheetTrigger><SheetContent side="left" className="admin-workspace w-[min(20rem,90vw)] overflow-y-auto"><SheetTitle>ไปไหนดี · Content Studio</SheetTitle><SheetDescription className="mb-6">จัดการข้อมูลสถานที่ท่องเที่ยว</SheetDescription>{navigation()}</SheetContent></Sheet><div><p className="text-xs text-slate-500">พื้นที่ผู้ดูแลระบบ</p><p className="text-sm font-semibold">PaiNaiDee CMS</p></div></div>
        <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800"><span className="h-2 w-2 rounded-full bg-emerald-600" />Admin</span>
      </header>
      <main id="admin-content" className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-24 sm:px-8 sm:py-8">{children}</main>
    </div>
  </div>;
}
