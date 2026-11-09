import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from '@/services/railway-api.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function RailwayLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || typeof data?.token !== 'string' || data.role !== 'admin') {
        setError(data?.error || 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่');
        return;
      }
      window.sessionStorage.setItem('painaidee.admin.token', data.token);
      navigate('/admin', { replace: true });
    } catch { setError('ไม่สามารถเริ่มเซสชันได้ กรุณาลองใหม่'); }
    finally { setIsLoading(false); setPassword(''); }
  }

  return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-slate-900">
    <Card className="w-full max-w-md rounded-2xl border-slate-200 shadow-xl shadow-slate-200/50"><CardHeader>
      <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-teal-800">PaiNaiDee · Content Studio</p><CardTitle className="text-2xl leading-relaxed">เข้าสู่ระบบผู้ดูแล PaiNaiDee</CardTitle>
      <CardDescription>ระบบแอดมิน Railway · กรุณาใช้บัญชีที่ได้รับอนุญาต</CardDescription>
    </CardHeader><CardContent>
      <form onSubmit={handleLogin} className="space-y-4">
        <Label htmlFor="admin-email">อีเมล</Label>
        <Input id="admin-email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} />
        <Label htmlFor="admin-password">รหัสผ่าน</Label>
        <Input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} />
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={isLoading} className="min-h-12 w-full bg-teal-800 hover:bg-teal-900">{isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}</Button>
      </form><Link to="/" className="mt-6 block py-2 text-center text-sm text-teal-800 underline">กลับไปหน้าเว็บไซต์</Link>
    </CardContent></Card>
  </div>;
}
