import { supabase } from '@/services/supabase.service';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useTranslation } from 'react-i18next';

// A map for Supabase localization
const localization = {
  'th': {
    sign_in: {
      email_label: 'ที่อยู่อีเมล',
      password_label: 'รหัสผ่าน',
      email_input_placeholder: 'ที่อยู่อีเมลของคุณ',
      password_input_placeholder: 'รหัสผ่านของคุณ',
      button_label: 'เข้าสู่ระบบ',
      loading_button_label: 'กำลังเข้าสู่ระบบ...',
      social_provider_text: 'เข้าสู่ระบบด้วย',
      link_text: 'ยังไม่มีบัญชี? สมัครสมาชิก',
      magic_link_text: 'ส่งลิงก์เข้าสู่ระบบทางอีเมล',
    },
    sign_up: {
      email_label: 'ที่อยู่อีเมล',
      password_label: 'สร้างรหัสผ่าน',
      email_input_placeholder: 'ที่อยู่อีเมลของคุณ',
      password_input_placeholder: 'รหัสผ่านของคุณ',
      button_label: 'สมัครสมาชิก',
      loading_button_label: 'กำลังสมัครสมาชิก...',
      social_provider_text: 'สมัครสมาชิกด้วย',
      link_text: 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ',
    },
    magic_link: {
      header_text: 'ส่งลิงก์เพื่อเข้าสู่ระบบ',
      email_input_label: 'ที่อยู่อีเมล',
      email_input_placeholder: 'ที่อยู่อีเมลของคุณ',
      button_label: 'ส่งลิงก์',
      loading_button_label: 'กำลังส่งลิงก์...',
      link_text: 'หรือกลับไปหน้าเข้าสู่ระบบ',
      confirmation_text: 'โปรดตรวจสอบอีเมลของคุณเพื่อรับลิงก์สำหรับเข้าสู่ระบบ',
    },
    forgotten_password: {
      header_text: 'ลืมรหัสผ่าน',
      email_label: 'ที่อยู่อีเมล',
      password_label: 'รหัสผ่านใหม่ของคุณ',
      button_label: 'ส่งคำแนะนำในการรีเซ็ต',
      loading_button_label: 'กำลังส่งคำแนะนำ...',
      link_text: 'กลับไปหน้าเข้าสู่ระบบ',
      confirmation_text: 'โปรดตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน',
    },
    update_password: {
      header_text: 'อัปเดตรหัสผ่าน',
      password_label: 'รหัสผ่านใหม่',
      password_input_placeholder: 'รหัสผ่านใหม่ของคุณ',
      button_label: 'อัปเดตรหัสผ่าน',
      loading_button_label: 'กำลังอัปเดต...',
      confirmation_text: 'รหัสผ่านของคุณถูกอัปเดตเรียบร้อยแล้ว',
    },
  },
};


export const Auth = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.startsWith('th') ? 'th' : 'en';

  return (
    <div className="w-full max-w-md mx-auto">
      <SupabaseAuth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google']}
        providerScopes={{
          google: 'email profile',
        }}
        socialLayout="horizontal"
        localization={{
          variables: localization[currentLang]
        }}
        theme="dark"
        view="magic_link"
        showLinks={true}
      />
    </div>
  );
};