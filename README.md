# PaiNaiDee - แอปพลิเคชันค้นหาสถานที่ท่องเที่ยวในประเทศไทย (Supabase Edition)

<div align="center">
  <img src="public/favicon.ico" alt="PaiNaiDee Logo" width="80" height="80">
  
  **ค้นพบสถานที่ท่องเที่ยวที่น่าทึ่งในประเทศไทย** 🇹🇭
  
  เว็บแอปพลิเคชันที่ทันสมัย สร้างขึ้นด้วย React, Vite, และ TypeScript โดยมี Supabase เป็น Backend หลัก สำหรับการสำรวจสถานที่ท่องเที่ยว, การจัดการข้อมูลส่วนตัว, และอื่นๆ อีกมากมาย
</div>

## 🌟 คุณสมบัติเด่น

### การค้นหาและสำรวจ
- **🌐 ข้อมูลจาก Supabase** - สถานที่ท่องเที่ยวทั้งหมดถูกจัดเก็บและดึงข้อมูลโดยตรงจาก Supabase Database
- **🔍 การค้นหาและกรอง** - ค้นหาสถานที่ด้วยชื่อ, หมวดหมู่, หรือจังหวัด
- **📄 Pagination** - ระบบ "Load More" ในหน้า Explore เพื่อการโหลดข้อมูลที่ราบรื่น
- **🗺️ แผนที่แบบโต้ตอบ** - สำรวจสถานที่ท่องเที่ยวด้วยแผนที่ Leaflet ที่ผสานรวมเข้าด้วยกัน

### การจัดการข้อมูลส่วนตัว (สำหรับผู้ใช้ที่ลงทะเบียน)
- **🔐 การยืนยันตัวตน** - รองรับการล็อกอินผ่าน Magic Link และ Google OAuth โดยใช้ Supabase Auth
- **❤️ ระบบรายการโปรด** - บันทึกและจัดระเบียบสถานที่ท่องเที่ยวที่คุณชื่นชอบ ข้อมูลจะถูกบันทึกไว้ในบัญชีของคุณ
- **➕ เพิ่มสถานที่ใหม่** - ผู้ใช้ที่ล็อกอินแล้วสามารถเพิ่มสถานที่ใหม่ๆ พร้อมอัปโหลดรูปภาพไปยัง Supabase Storage ได้

### ประสบการณ์ผู้ใช้
- **📱 การออกแบบที่เน้นมือถือเป็นหลัก** - ปรับให้เหมาะสมกับทุกอุปกรณ์และขนาดหน้าจอ
- **🌍 รองรับหลายภาษา** - พร้อมใช้งานในภาษาไทยและอังกฤษ
- **🎨 ส่วนติดต่อผู้ใช้ที่ทันสมัย** - อินเทอร์เฟซที่สวยงามสร้างด้วย shadcn/ui และ Tailwind CSS
- **⚡ ประสิทธิภาพที่รวดเร็ว** - สร้างด้วย Vite และใช้ TanStack Query สำหรับการจัดการข้อมูลฝั่งเซิร์ฟเวอร์

## 🚀 เริ่มต้นใช้งานอย่างรวดเร็ว

### ข้อกำหนดเบื้องต้น
- **Node.js** (เวอร์ชั่น 18 หรือสูงกว่า)
- **npm** หรือ **yarn**
- **Git**
- **Supabase Account** - สมัครใช้งานฟรีได้ที่ [supabase.com](https://supabase.com)

### การตั้งค่าโปรเจกต์

1.  **Clone Repository**
    ```bash
    git clone https://github.com/athipan1/pai-naidee-ui-spark.git
    cd pai-naidee-ui-spark
    ```

2.  **ติดตั้ง Dependencies**
    ```bash
    npm install
    ```

3.  **ตั้งค่า Supabase**
    *   ไปที่ [Supabase Dashboard](https://supabase.com/dashboard) และสร้างโปรเจกต์ใหม่
    *   ไปที่ **Settings** > **API** และคัดลอก `Project URL` และ `anon public` key
    *   สร้างไฟล์ `.env.development` จากไฟล์ `.env.example` และวางค่าที่คัดลอกมา:
        ```env
        VITE_SUPABASE_URL=https://your-project-id.supabase.co
        VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
        ```
    *   ไปที่ **SQL Editor** ใน Dashboard ของ Supabase
    *   คัดลอกเนื้อหาจากไฟล์ `supabase/sql/01_initial_schema_and_rls.sql` ไปรันเพื่อสร้างตารางและ RLS policies
    *   คัดลอกเนื้อหาจากไฟล์ `supabase/sql/02_storage_setup.sql` ไปรันเพื่อสร้าง Storage bucket และ policies
    *   คัดลอกเนื้อหาจากไฟล์ `supabase/sql/03_rpc_functions.sql` ไปรันเพื่อสร้างฟังก์ชันสำหรับนับจำนวน Category

4.  **เปิดใช้งาน Google OAuth (ทางเลือก)**
    *   ไปที่ **Authentication** > **Providers** ใน Supabase Dashboard และเปิดใช้งาน Google
    *   ทำตามคำแนะนำในเอกสารของ Supabase เพื่อตั้งค่า Google OAuth Credentials

5.  **เริ่ม Development Server**
    ```bash
    npm run dev
    ```
    แอปพลิเคชันจะพร้อมใช้งานที่ `http://localhost:8080`

## 🛠️ การพัฒนา

### คำสั่งที่มีให้ใช้งาน

| คำสั่ง             | คำอธิบาย                               |
| ------------------ | -------------------------------------- |
| `npm run dev`      | เริ่ม development server                |
| `npm run build`    | Build สำหรับ production               |
| `npm run lint`     | รัน ESLint                             |
| `npm run type-check` | รัน TypeScript type checking          |
| `npm run preview`  | ดูตัวอย่าง production build            |
| `npm test`         | รันเทสต์ด้วย Vitest                    |

### โครงสร้างโปรเจกต์ที่สำคัญ

```
pai-naidee-ui-spark/
├── supabase/
│   └── sql/                  # SQL scripts สำหรับตั้งค่า Supabase
│       ├── 01_initial_schema_and_rls.sql
│       └── 02_storage_setup.sql
├── src/
│   ├── app/                    # แอปพลิเคชันหลักและ routing
│   ├── components/             # คอมโพเนนท์ที่ใช้ซ้ำได้
│   │   ├── auth/               # คอมโพเนนท์สำหรับ Authentication
│   │   ├── discover/           # คอมโพเนนท์สำหรับหน้า Discover
│   │   └── places/             # คอมโพเนนท์เกี่ยวกับสถานที่
│   ├── services/               # Services สำหรับเชื่อมต่อภายนอก
│   │   └── supabase.service.ts # Client และฟังก์ชันสำหรับ Supabase
│   └── shared/                 # Hooks, Contexts, และ Utilities
│       └── contexts/
│           └── AuthContext.tsx # Context สำหรับจัดการ Session
└── README.md                   # เอกสารนี้
```

## 🏗️ เทคโนโลยีที่ใช้

### **Backend**
- **[Supabase](https://supabase.com/)** - แพลตฟอร์ม Backend-as-a-Service
  - **PostgreSQL Database** - สำหรับเก็บข้อมูลทั้งหมด
  - **Auth** - จัดการการยืนยันตัวตน (Magic Link, Google OAuth)
  - **Storage** - สำหรับจัดเก็บรูปภาพที่ผู้ใช้อัปโหลด
  - **Row Level Security (RLS)** - ควบคุมการเข้าถึงข้อมูลในระดับแถว

### **Frontend**
- **[React 18](https://react.dev/)** - ไลบรารีสำหรับสร้าง UI
- **[Vite](https://vitejs.dev/)** - เครื่องมือ build ที่รวดเร็ว
- **[TypeScript](https://www.typescriptlang.org/)** - เพิ่มความปลอดภัยด้วยระบบ type
- **[Tailwind CSS](https://tailwindcss.com/)** - CSS framework แบบ Utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - ไลบรารีคอมโพเนนท์ที่สร้างบน Radix UI และ Tailwind
- **[TanStack Query](https://tanstack.com/query/)** - สำหรับจัดการ Server State, Caching, และ Data Fetching
- **[React Router v6](https://reactrouter.com/)** - จัดการ Routing ฝั่ง Client

## 🤝 การร่วมพัฒนา

เรายินดีรับการมีส่วนร่วมในการพัฒนา PaiNaiDee! คุณสามารถช่วยได้โดยการ Fork repository, สร้าง feature branch, และเปิด Pull Request

---

<div align="center">
  <p>สร้างด้วย ❤️ เพื่อการท่องเที่ยวไทย</p>
</div>