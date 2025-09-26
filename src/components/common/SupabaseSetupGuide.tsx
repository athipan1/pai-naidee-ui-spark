import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ExternalLink, Database, Key, AlertTriangle, CheckCircle } from 'lucide-react';
import { isSupabaseConfigured } from '@/services/supabase.service';

interface SupabaseSetupGuideProps {
  currentLanguage?: 'th' | 'en';
  showOnlyIfNeeded?: boolean;
}

const SupabaseSetupGuide: React.FC<SupabaseSetupGuideProps> = ({ 
  currentLanguage = 'en',
  showOnlyIfNeeded = true 
}) => {
  const isConfigured = isSupabaseConfigured();

  // If showOnlyIfNeeded is true and Supabase is already configured, don't show the guide
  if (showOnlyIfNeeded && isConfigured) {
    return (
      <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          {currentLanguage === 'th' 
            ? '✅ Supabase ได้รับการกำหนดค่าเรียบร้อยแล้ว' 
            : '✅ Supabase is properly configured'}
        </AlertDescription>
      </Alert>
    );
  }

  const content = {
    th: {
      title: 'การตั้งค่า Supabase Database',
      description: 'เพื่อให้แอปพลิเคชันสามารถเชื่อมต่อกับฐานข้อมูล Supabase ได้ คุณต้องกำหนดค่า environment variables',
      steps: [
        {
          icon: <ExternalLink className="h-4 w-4" />,
          title: '1. สร้างโปรเจกต์ Supabase',
          description: 'ไปที่ supabase.com และสร้างโปรเจกต์ใหม่ (หรือใช้โปรเจกต์ที่มีอยู่)',
          action: 'เปิด Supabase Dashboard'
        },
        {
          icon: <Key className="h-4 w-4" />,
          title: '2. คัดลอก API credentials',
          description: 'ไปที่ Settings > API และคัดลอก Project URL และ anon public key',
          action: null
        },
        {
          icon: <Database className="h-4 w-4" />,
          title: '3. อัปเดต .env.local',
          description: 'สร้างหรืออัปเดตไฟล์ .env.local ในโฟลเดอร์รูทของโปรเจกต์',
          action: null
        }
      ],
      envExample: `# เพิ่มลงในไฟล์ .env.local
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here`,
      restartNote: 'หลังจากอัปเดต environment variables แล้ว ให้รีสตาร์ท development server (npm run dev)',
      currentStatus: 'สถานะปัจจุบัน: Supabase ยังไม่ได้กำหนดค่า'
    },
    en: {
      title: 'Supabase Database Setup',
      description: 'To connect the application to Supabase database, you need to configure environment variables.',
      steps: [
        {
          icon: <ExternalLink className="h-4 w-4" />,
          title: '1. Create Supabase Project',
          description: 'Go to supabase.com and create a new project (or use existing one)',
          action: 'Open Supabase Dashboard'
        },
        {
          icon: <Key className="h-4 w-4" />,
          title: '2. Copy API Credentials',
          description: 'Go to Settings > API and copy Project URL and anon public key',
          action: null
        },
        {
          icon: <Database className="h-4 w-4" />,
          title: '3. Update .env.local',
          description: 'Create or update .env.local file in your project root',
          action: null
        }
      ],
      envExample: `# Add to .env.local file
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here`,
      restartNote: 'After updating environment variables, restart your development server (npm run dev)',
      currentStatus: 'Current Status: Supabase not configured'
    }
  };

  const t = content[currentLanguage];

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
              {t.title}
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
              {t.description}
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              {t.currentStatus}
            </p>
          </div>

          <div className="space-y-3">
            {t.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="text-orange-600 mt-0.5">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-orange-800 dark:text-orange-200 text-sm">
                    {step.title}
                  </div>
                  <div className="text-xs text-orange-700 dark:text-orange-300">
                    {step.description}
                  </div>
                  {step.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 h-7 text-xs border-orange-300 text-orange-800 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-200 dark:hover:bg-orange-900"
                      onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {step.action}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-orange-100 dark:bg-orange-900/50 p-3 rounded-md">
            <div className="text-xs font-mono text-orange-800 dark:text-orange-200 whitespace-pre-line">
              {t.envExample}
            </div>
          </div>

          <div className="text-xs text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/50 p-2 rounded border border-orange-200 dark:border-orange-800">
            <strong>📝 {currentLanguage === 'th' ? 'หมายเหตุ' : 'Note'}:</strong> {t.restartNote}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SupabaseSetupGuide;