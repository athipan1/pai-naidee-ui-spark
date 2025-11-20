import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContentManagement from '@/components/dashboard/ContentManagement';

interface AdminPanelProps {
  currentLanguage: 'th' | 'en';
}

const AdminPanel = ({ currentLanguage }: AdminPanelProps) => {
  const navigate = useNavigate();

  const content = {
    th: {
      title: 'แผงควบคุมผู้ดูแลระบบ',
      subtitle: 'จัดการสื่อและฐานข้อมูล Timeline สำหรับสถานที่ท่องเที่ยว',
      backToHome: 'กลับหน้าแรก',
      adminAccess: 'การเข้าถึงสำหรับผู้ดูแลระบบและนักพัฒนา'
    },
    en: {
      title: 'Admin Control Panel',
      subtitle: 'Manage media and timeline database for tourist attractions',
      backToHome: 'Back to Home',
      adminAccess: 'Access for administrators and developers'
    }
  };

  const t = content[currentLanguage];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 mobile-touch-target"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t.backToHome}</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="text-sm text-muted-foreground hidden md:inline">
                {t.adminAccess}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <Settings className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{t.title}</h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Media Management Interface */}
        <ContentManagement currentLanguage={currentLanguage} />
      </div>
    </div>
  );
};

export default AdminPanel;