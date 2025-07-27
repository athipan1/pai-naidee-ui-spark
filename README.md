# PaiNaiDee - แอปพลิเคชันค้นหาสถานที่ท่องเที่ยวในประเทศไทย

<div align="center">
  <img src="public/favicon.ico" alt="PaiNaiDee Logo" width="80" height="80">
  
  **ค้นพบสถานที่ท่องเที่ยวที่น่าทึ่งในประเทศไทย** 🇹🇭
  
  เว็บแอปพลิเคชันที่ทันสมัยและตอบสนองการใช้งานบนอุปกรณ์ต่างๆ สำหรับการสำรวจสถานที่ท่องเที่ยว วัฒนธรรม และประสบการณ์ที่สวยงามของประเทศไทย
</div>

## 🌟 คุณสมบัติเด่น

- **🗺️ แผนที่แบบโต้ตอบ** - สำรวจสถานที่ท่องเที่ยวด้วยแผนที่ Leaflet ที่ผสานรวมเข้าด้วยกัน
- **🔍 ระบบค้นหาอัจฉริยะ** - ค้นหาสถานที่ด้วยชื่อ หมวดหมู่ หรือตำแหน่งที่ตั้ง
- **❤️ ระบบรายการโปรด** - บันทึกและจัดระเบียบสถานที่ท่องเที่ยวที่คุณชื่นชอบ
- **🏷️ การกรองตามหมวดหมู่** - เรียกดูตามวัด ชายหาด ตลาด ภูเขา และอื่นๆ อีกมากมาย
- **📱 การออกแบบที่เน้นมือถือเป็นหลัก** - ปรับให้เหมาะสมกับทุกอุปกรณ์และขนาดหน้าจอ
- **🌍 รองรับหลายภาษา** - พร้อมใช้งานในภาษาไทยและอังกฤษ
- **🎨 ส่วนติดต่อผู้ใช้ที่ทันสมัย** - อินเทอร์เฟซที่สวยงามสร้างด้วย shadcn-ui และ Tailwind CSS
- **⚡ ประสิทธิภาพที่รวดเร็ว** - สร้างด้วย Vite เพื่อความเร็วในการโหลดที่เหมาะสม

## 🚀 เริ่มต้นใช้งานอย่างรวดเร็ว

### ข้อกำหนดเบื้องต้น

- **Node.js** (เวอร์ชั่น 18 หรือสูงกว่า)
- **npm** หรือ **yarn** package manager
- **Git**

### การติดตั้ง

```bash
# 1. Clone repository
git clone https://github.com/athipan1/pai-naidee-ui-spark.git

# 2. ไปยังโฟลเดอร์โปรเจค
cd pai-naidee-ui-spark

# 3. ติดตั้ง dependencies
npm install

# 4. เริ่ม development server
npm run dev

# 5. เปิดเว็บเบราว์เซอร์และไปที่ http://localhost:8080
```

แอปพลิเคชันจะพร้อมใช้งานที่ `http://localhost:8080` พร้อมกับการ hot reload

## 🛠️ การพัฒนา

### คำสั่งที่มีให้ใช้งาน

| คำสั่ง | คำอธิบาย |
|---------|-------------|
| `npm run dev` | เริ่ม development server |
| `npm run dev:debug` | เริ่ม server พร้อมเครื่องมือ debug |
| `npm run build` | Build สำหรับ production |
| `npm run build:dev` | Build สำหรับ development |
| `npm run lint` | รัน ESLint |
| `npm run lint:fix` | แก้ไข ESLint errors อัตโนมัติ |
| `npm run type-check` | รัน TypeScript type checking |
| `npm run preview` | ดูตัวอย่าง production build |

### เครื่องมือการพัฒนา

เมื่อรันในโหมด debug (`npm run dev:debug`) คุณจะสามารถเข้าถึง:
- **🛠️ Dev Tools Panel** - คลิกไอคอนประแจในมุมล่างขวา
- **ข้อมูลสภาพแวดล้อม** - ดูการตั้งค่าและการกำหนดค่าปัจจุบัน
- **การจัดการ Storage** - ล้าง localStorage และสถานะแอปพลิเคชัน
- **Console Logging** - เอาต์พุตการ debug ที่ปรับปรุงแล้ว

### การกำหนดค่าสภาพแวดล้อม

สร้างไฟล์ `.env.development` สำหรับการพัฒนาในเครื่อง:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_TITLE=PaiNaiDee - Development
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
```

## 📁 โครงสร้างโปรเจค

```
pai-naidee-ui-spark/
├── src/
│   ├── app/                    # แอปพลิเคชันหลัก
│   │   ├── pages/             # คอมโพเนนท์เส้นทาง
│   │   │   ├── Index.tsx      # หน้าหลัก
│   │   │   ├── Explore.tsx    # หน้าสำรวจ
│   │   │   ├── Favorites.tsx  # จัดการรายการโปรด
│   │   │   ├── MapPage.tsx    # มุมมองแผนที่แบบโต้ตอบ
│   │   │   └── ...           # หน้าอื่นๆ
│   │   └── App.tsx            # คอมโพเนนท์แอปหลัก
│   ├── components/            # คอมโพเนนท์ที่ใช้ซ้ำได้
│   │   ├── common/           # คอมโพเนนท์ UI ทั่วไป
│   │   ├── attraction/       # คอมโพเนนท์เฉพาะสถานที่ท่องเที่ยว
│   │   ├── ui/               # คอมโพเนนท์ shadcn-ui
│   │   └── dev/              # เครื่องมือการพัฒนา
│   ├── shared/               # ยูทิลิตี้ที่ใช้ร่วมกัน
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # ฟังก์ชันยูทิลิตี้
│   │   └── assets/           # ไฟล์ static
│   └── main.tsx              # จุดเริ่มต้นแอปพลิเคชัน
├── public/                   # ไฟล์ static
├── docs/                     # เอกสารประกอบ
├── build/                    # เอาต์พุต production build
└── package.json              # Dependencies ของโปรเจค
```

## 🏗️ เทคโนโลยีที่ใช้

### เทคโนโลยีหลัก
- **[React 18](https://react.dev/)** - React สมัยใหม่พร้อม hooks และคุณสมบัติ concurrent
- **[TypeScript](https://www.typescriptlang.org/)** - การพัฒนา JavaScript ที่ปลอดภัยด้วยระบบ type
- **[Vite](https://vitejs.dev/)** - เครื่องมือ build ที่เร็วและ development server

### UI และการจัดแต่ง
- **[Tailwind CSS](https://tailwindcss.com/)** - CSS framework แบบ utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - ไลบรารีคอมโพเนนท์ที่สวยงามและเข้าถึงได้
- **[Radix UI](https://www.radix-ui.com/)** - UI primitives ระดับต่ำ
- **[Lucide React](https://lucide.dev/)** - ไลบรารีไอคอนที่สวยงาม

### ฟังก์ชันการทำงาน
- **[React Router v6](https://reactrouter.com/)** - การจัดการเส้นทางฝั่งไคลเอ็นต์
- **[TanStack Query](https://tanstack.com/query/)** - การดึงข้อมูลและแคชชิ่ง
- **[React Leaflet](https://react-leaflet.js.org/)** - แผนที่แบบโต้ตอบ
- **[React Hook Form](https://react-hook-form.com/)** - การจัดการฟอร์ม
- **[Zod](https://zod.dev/)** - การตรวจสอบ schema

### เครื่องมือการพัฒนา
- **[ESLint](https://eslint.org/)** - การตรวจสอบและคุณภาพโค้ด
- **[Prettier](https://prettier.io/)** - การจัดรูปแบบโค้ด
- **[TypeScript](https://www.typescriptlang.org/)** - การตรวจสอบ type แบบ static

## 🐳 การพัฒนาด้วย Docker

PaiNaiDee รองรับ Docker สำหรับทั้งสภาพแวดล้อมการพัฒนาและ production ดูรายละเอียดการใช้งาน Docker ได้ที่ [DOCKER_README.md](./DOCKER_README.md)

**เริ่มต้นอย่างรวดเร็วด้วย Docker:**

```bash
# Development พร้อม hot reload
docker compose up dev

# Production build
docker compose up app
```

## 🌍 การรองรับหลายภาษา

แอปพลิเคชันรองรับหลายภาษา:

- **ภาษาอังกฤษ (en)** - ภาษาหลัก
- **ภาษาไทย (th)** - การรองรับภาษาท้องถิ่น

การเปลี่ยนภาษาสามารถทำได้ในส่วนติดต่อผู้ใช้ และแอปพลิเคชันจะตรวจจับการตั้งค่าของผู้ใช้โดยอัตโนมัติ

## 🚀 การ Deploy

### Production Build

```bash
# สร้าง production build ที่ปรับแต่งแล้ว
npm run build

# ดูตัวอย่าง production build ในเครื่อง
npm run preview
```

### ตัวเลือกการ Deploy

1. **Static Hosting** - Deploy โฟลเดอร์ `build/` ไปยังบริการ static hosting ใดๆ
2. **Docker** - ใช้ Dockerfile ที่มีให้สำหรับ deployment แบบ containerized
3. **Lovable Platform** - Deploy โดยตรงผ่าน Lovable (ดูการตั้งค่าเดิม)

### ตัวแปรสภาพแวดล้อมสำหรับ Production

```bash
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_APP_TITLE=PaiNaiDee
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

## 🤝 การร่วมพัฒนา

เรายินดีรับการมีส่วนร่วมในการพัฒนา PaiNaiDee! คุณสามารถช่วยได้ดังนี้:

### เริ่มต้น
1. Fork repository
2. สร้าง feature branch: `git checkout -b feature/amazing-feature`
3. ทำการเปลี่ยนแปลงตามมาตรฐานการเขียนโค้ดของเรา
4. รันการทดสอบและ linting: `npm run lint && npm run type-check`
5. Commit การเปลี่ยนแปลง: `git commit -m 'Add amazing feature'`
6. Push ไปยัง branch ของคุณ: `git push origin feature/amazing-feature`
7. เปิด Pull Request

### แนวทางการพัฒนา
- ปฏิบัติตามรูปแบบและแพทเทิร์นโค้ดที่มีอยู่
- เขียนข้อความ commit ที่มีความหมาย
- เพิ่ม TypeScript types สำหรับโค้ดใหม่
- ทดสอบการเปลี่ยนแปลงของคุณในขนาดหน้าจอต่างๆ
- อัพเดตเอกสารหากจำเป็น

### รูปแบบโค้ด
- ใช้ TypeScript สำหรับโค้ดใหม่ทั้งหมด
- ปฏิบัติตามโครงสร้างคอมโพเนนท์ที่มีอยู่
- ใช้ Tailwind CSS สำหรับการจัดแต่ง
- ทำให้คอมโพเนนท์มีขนาดเล็กและมีจุดเน้นชัดเจน
- เขียนชื่อตัวแปรและฟังก์ชันที่อธิบายได้

## 📋 แผนงาน

### เสร็จสิ้นแล้ว ✅
- การออกแบบที่ตอบสนอง (เน้นมือถือเป็นหลัก)
- การรองรับหลายภาษา (ไทย/อังกฤษ)
- การค้นหาสถานที่ท่องเที่ยว
- การกรองตามหมวดหมู่
- ฟังก์ชันการค้นหา
- ระบบรายการโปรด
- การผสานรวมแผนที่แบบโต้ตอบ
- UI ที่ทันสมัยด้วย shadcn-ui

### กำลังดำเนินการ 🚧
- การค้นหาที่ปรับปรุงแล้วพร้อมตัวกรองขั้นสูง
- การปรับปรุงประสิทธิภาพ
- การปรับปรุงการเข้าถึง

### ที่วางแผนไว้ 📅
- ระบบการยืนยันตัวตนผู้ใช้
- คุณสมบัติการจองและการวางแผน
- การรองรับออฟไลน์ (PWA)
- ความสามารถในการแชร์ทางสังคม
- แดชบอร์ดผู้ดูแลระบบ
- การผสานรวม API สำหรับข้อมูลแบบเรียลไทม์
- แอปมือถือ (React Native)

## 🔧 การแก้ปัญหา

### ปัญหาทั่วไป

**Port ถูกใช้งานอยู่แล้ว**
```bash
# ฆ่าโปรเซสที่ใช้ port 8080
lsof -ti:8080 | xargs kill -9
# หรือใช้ port อื่น
npm run dev -- --port 3000
```

**ข้อผิดพลาดการ Build**
```bash
# ล้าง node_modules และติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install
```

**ข้อผิดพลาด TypeScript**
```bash
# รันการตรวจสอบ type
npm run type-check
```

**ปัญหา Linting**
```bash
# แก้ไข linting errors อัตโนมัติ
npm run lint:fix
```

### การขอความช่วยเหลือ

- 📖 ตรวจสอบ [DEV_README.md](./DEV_README.md) สำหรับคู่มือการพัฒนาโดยละเอียด
- 🐳 ดู [DOCKER_README.md](./DOCKER_README.md) สำหรับความช่วยเหลือเฉพาะ Docker
- 🐛 เปิด issue สำหรับรายงานบั๊กหรือขอคุณสมบัติใหม่
- 💡 เริ่มการสนทนาสำหรับคำถามและไอเดีย

## 📄 ใบอนุญาต

โปรเจคนี้อยู่ภายใต้ใบอนุญาต MIT License - ดูรายละเอียดในไฟล์ [LICENSE](LICENSE)

## 🙏 กิตติกรรมประกาศ

- **[Lovable](https://lovable.dev/)** - การสร้างโครงสร้างโปรเจคเริ่มต้นและแพลตฟอร์ม deployment
- **[shadcn/ui](https://ui.shadcn.com/)** - ไลบรารีคอมโพเนนท์ที่สวยงาม
- **[Radix UI](https://www.radix-ui.com/)** - UI primitives ที่เข้าถึงได้
- **การท่องเที่ยวแห่งประเทศไทย** - แรงบันดาลใจในการส่งเสริมการท่องเที่ยวไทย

---

<div align="center">
  <p>สร้างด้วย ❤️ เพื่อการท่องเที่ยวไทย</p>
  <p>
    <a href="#-คุณสมบัติเด่น">คุณสมบัติเด่น</a> •
    <a href="#-เริ่มต้นใช้งานอย่างรวดเร็ว">เริ่มต้นใช้งาน</a> •
    <a href="#-การพัฒนา">การพัฒนา</a> •
    <a href="#-การร่วมพัฒนา">การร่วมพัฒนา</a>
  </p>
</div>
