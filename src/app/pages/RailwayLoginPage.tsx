import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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

  return <div className="flex min-h-screen items-center justify-center bg-background p-4">
    <Card className="w-full max-w-md"><CardHeader>
      <CardTitle>เข้าสู่ระบบผู้ดูแล PaiNaiDee</CardTitle>
      <CardDescription>ระบบแอดมิน Railway · กรุณาใช้บัญชีที่ได้รับอนุญาต</CardDescription>
    </CardHeader><CardContent>
      <form onSubmit={handleLogin} className="space-y-4">
        <Label htmlFor="admin-email">อีเมล</Label>
        <Input id="admin-email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} />
        <Label htmlFor="admin-password">รหัสผ่าน</Label>
        <Input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} />
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={isLoading} className="w-full">{isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}</Button>
      </form>
    </CardContent></Card>
  </div>;
}
