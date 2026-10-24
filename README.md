# PaiNaiDee - แอปพลิเคชันค้นหาสถานที่ท่องเที่ยวในประเทศไทย

<div align="center">
  <img src="public/favicon.ico" alt="PaiNaiDee Logo" width="80" height="80">
  
  **ค้นพบสถานที่ท่องเที่ยวที่น่าทึ่งในประเทศไทย** 🇹🇭
  
  เว็บแอปพลิเคชันที่ทันสมัยและตอบสนองการใช้งานบนอุปกรณ์ต่างๆ สำหรับการสำรวจสถานที่ท่องเที่ยว วัฒนธรรม และประสบการณ์ที่สวยงามของประเทศไทย
</div>

## 🌟 คุณสมบัติเด่น

### การค้นหาและสำรวจ
- **🗺️ แผนที่แบบโต้ตอบ** - สำรวจสถานที่ท่องเที่ยวด้วยแผนที่ Leaflet ที่ผสานรวมเข้าด้วยกัน พร้อมข้อมูลพิกัด GPS และการนำทาง
- **🔍 ระบบค้นหาอัจฉริยะ (Phase 2)** - ค้นหาสถานที่ด้วยชื่อ หมวดหมู่ หรือตำแหน่งที่ตั้ง พร้อมการแสดงผลแบบเรียลไทม์
  - **Semantic Search**: ค้นหาด้วยความหมายและบริบท ใช้ embedding vectors สำหรับความแม่นยำสูง
  - **Hybrid Ranking**: การจัดอันดับแบบผสมผสานที่รวม lexical, semantic, popularity, recency และ personalization scores
  - **Advanced Filters**: กรองผลลัพธ์ด้วยหมวดหมู่ ช่วงวันที่ การมีสื่อ ระยะทาง คะแนน และภาษา
  - **Feature Flags**: ระบบควบคุมฟีเจอร์เพื่อการ deploy ที่ปลอดภัย
  - **Search Metrics**: การติดตามประสิทธิภาพและการใช้งานแบบเรียลไทม์
- **🏷️ การกรองตามหมวดหมู่** - เรียกดูตามวัด ชายหาด ตลาด ภูเขา น้ำตก เกาะ และอาหารท้องถิ่น
- **🎯 ข้อมูลละเอียด** - รายละเอียดครบครันของแต่ละสถานที่ รวมถึงรีวิว คะแนน และรูปภาพ

### การจัดการข้อมูลส่วนตัว
- **❤️ ระบบรายการโปรด** - บันทึกและจัดระเบียบสถานที่ท่องเที่ยวที่คุณชื่นชอบ พร้อมการซิงค์ข้อมูล
- **📋 การวางแผนการเดินทาง** - สร้างและจัดการแผนการท่องเที่ยวส่วนตัว
- **👤 โปรไฟล์ผู้ใช้** - จัดการข้อมูลส่วนตัวและประวัติการใช้งาน

### ประสบการณ์ผู้ใช้
- **📱 การออกแบบที่เน้นมือถือเป็นหลัก** - ปรับให้เหมาะสมกับทุกอุปกรณ์และขนาดหน้าจอ
- **🌍 รองรับหลายภาษา** - พร้อมใช้งานในภาษาไทยและอังกฤษ พร้อมการเปลี่ยนภาษาแบบไดนามิก
- **🎨 ส่วนติดต่อผู้ใช้ที่ทันสมัย** - อินเทอร์เฟซที่สวยงามสร้างด้วย shadcn-ui และ Tailwind CSS
- **⚡ ประสิทธิภาพที่รวดเร็ว** - สร้างด้วย Vite เพื่อความเร็วในการโหลดที่เหมาะสม และ lazy loading สำหรับรูปภาพ

### ฟีเจอร์ขั้นสูง
- **📊 แดชบอร์ดข้อมูล** - สถิติการเข้าชมและแนวโน้มความนิยมของสถานที่ต่างๆ
- **🔗 
การแชร์ทางสังคม** - แชร์สถานที่ท่องเที่ยวผ่านโซเชียลมีเดีย
- **🛠️ เครื่องมือสำหรับนักพัฒนา** - DevTools panel สำหรับการ debug และตรวจสอบประสิทธิภาพ

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

# 4. ตั้งค่า Environment Variables
# คัดลอกไฟล์ .env.example และเปลี่ยนชื่อเป็น .env
# จากนั้นกรอกข้อมูล Supabase URL และ Anon Key ของคุณลงไป
cp .env.example .env

# 5. เริ่ม development server
npm run dev

# 6. เปิดเว็บเบราว์เซอร์และไปที่ http://localhost:8080
```

แอปพลิเคชันจะพร้อมใช้งานที่ `http://localhost:8080` พร้อมกับการ hot reload.

### การกำหนดค่าสภาพแวดล้อม

สร้างไฟล์ `.env` โดยคัดลอกมาจาก `.env.example` และกรอกข้อมูล Supabase URL และ Anon Key ของคุณ:

```bash
cp .env.example .env
```

ไฟล์ `.env` ของคุณควรมีลักษณะดังนี้:
```
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key-here"
```

## 📖 คู่มือการใช้งาน

### การเริ่มต้นใช้งาน

#### 1. หน้าแรก (Home)
![PaiNaiDee Homepage](https://github.com/user-attachments/assets/21f27c02-19c6-48ae-b886-f0c4e357ac46)

หน้าแรกประกอบด้วย:
- **แถบค้นหาหลัก**: พิมพ์ชื่อสถานที่หรือคำค้นหาที่ต้องการ
- **หมวดหมู่ยอดนิยม**: คลิกปุ่มหมวดหมู่ (Beach, Temple, Mountain, Waterfall, Island) เพื่อกรองผลลัพธ์
- **สถานที่แนะนำ**: แสดงสถานที่ท่องเที่ยวยอดนิยมพร้อมรีวิวและคะแนน

#### 2. การค้นหาสถานที่
1. ใช้แถบค้นหาพิมพ์ชื่อสถานที่ เช่น "เกาะพีพี" หรือ "Phi Phi Islands"
2. เลือกหมวดหมู่จากปุ่มด้านล่างแถบค้นหา
3. ผลลัพธ์จะแสดงแบบเรียลไทม์พร้อมคะแนนและรีวิว
4. คลิกที่การ์ดสถานที่เพื่อดูรายละเอียดเพิ่มเติม

#### 3. การใช้งานแผนที่
- **เข้าถึงแผนที่**: คลิกปุ่ม "View & Navigate" ในการ์ดสถานที่ หรือไปที่หน้า Map
- **ฟังก์ชันแผนที่**:
  - ซูมเข้า/ออกด้วยการกดปุ่ม + / - หรือใช้ scroll
  - คลิกที่ marker เพื่อดูข้อมูลสถานที่
  - ใช้ปุ่ม "Get Directions" เพื่อเปิดแอปแผนที่ภายนอก

#### 4. การจัดการรายการโปรด
1. คลิกไอคอนหัวใจ ❤️ ในการ์ดสถานที่เพื่อเพิ่มในรายการโปรด
2. ไปที่หน้า Favorites เพื่อดูสถานที่ที่บันทึกไว้
3. สามารถลบออกจากรายการโปรดได้โดยคลิกไอคอนหัวใจอีกครั้ง

#### 5. การสำรวจหมวดหมู่
- **หน้า Explore**: แสดงโพสต์และการแนะนำจากชุมชน
- **การกรองตามหมวดหมู่**: ใช้ปุ่มหมวดหมู่ในหน้าแรกเพื่อกรองตามประเภทสถานที่
- **การแสดงผล**: แต่ละหมวดหมู่จะแสดงจำนวนสถานที่ที่มีอยู่

### คุณสมบัติขั้นสูง

#### การเปลี่ยนภาษา
- คลิกปุ่ม "EN/TH" ที่มุมขวาบนเพื่อเปลี่ยนระหว่างภาษาอังกฤษและไทย
- การตั้งค่าภาษาจะถูกบันทึกไว้ในเบราว์เซอร์

#### โหมด Dark/Light
- คลิกไอคอนดวงอาทิตย์/ดวงจันทร์เพื่อเปลี่ยนโหมดการแสดงผล
- รองรับการตั้งค่าอัตโนมัติตามระบบ

## 🛠️ การพัฒนา

### คำสั่งที่มีให้ใช้งาน

| คำสั่ง | คำอธิบาย |
|---|---|
| `npm run dev` | เริ่ม development server |
| `npm run build` | Build สำหรับ production |
| `npm run lint` | รัน ESLint |
| `npm run lint:fix` | แก้ไข ESLint errors อัตโนมัติ |
| `npm run type-check`| รัน TypeScript type checking |
| `npm run preview` | ดูตัวอย่าง production build |
| `npm run test` | รัน unit tests |


### เครื่องมือการพัฒนา

เมื่อรันในโหมด development (`npm run dev`) คุณจะสามารถเข้าถึง:
- **🛠️ Dev Tools Panel** - คลิกไอคอนประแจในมุมล่างขวา (ถ้าเปิดใช้งาน)
- **ข้อมูลสภาพแวดล้อม** - ดูการตั้งค่าและการกำหนดค่าปัจจุบัน
- **การจัดการ Storage** - ล้าง localStorage และสถานะแอปพลิเคชัน
- **Console Logging** - เอาต์พุตการ debug ที่ปรับปรุงแล้ว

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
│   ├── services/             # Services (e.g., Supabase)
│   └── main.tsx              # จุดเริ่มต้นแอปพลิเคชัน
├── public/                   # ไฟล์ static
├── docs/                     # เอกสารประกอบ
├── dist/                     # เอาต์พุต production build
└── package.json              # Dependencies ของโปรเจค
```

## 🏗️ เทคโนโลยีที่ใช้

### สถาปัตยกรรมระบบ

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React SPA)                 │
├─────────────────────────────────────────────────────────┤
│  Components Layer                                       │
│  ├── Pages (Index, Explore, Map, Favorites, Profile)   │
│  ├── UI Components (shadcn/ui + Custom)                │
│  └── Common Components (Layout, Navigation)            │
├─────────────────────────────────────────────────────────┤
│  State Management                                       │
│  ├── React Query (Server State)                        │
│  ├── Context API (Global State)                        │
│  └── Local Storage (User Preferences)                  │
├─────────────────────────────────────────────────────────┤
│  Services Layer                                         │
│  ├── Supabase Service (Data Fetching)                  │
│  ├── Map Services (Leaflet Integration)                │
│  └── ...                                               │
├─────────────────────────────────────────────────────────┤
│  Backend                                                │
│  └── Supabase (Database, Auth, Storage)                │
└─────────────────────────────────────────────────────────┘
```

### เทคโนโลยีหลัก
- **[React 18](https://react.dev/)** - React สมัยใหม่พร้อม hooks และคุณสมบัติ concurrent
- **[TypeScript](https://www.typescriptlang.org/)** - การพัฒนา JavaScript ที่ปลอดภัยด้วยระบบ type
- **[Vite](https://vitejs.dev/)** - เครื่องมือ build ที่เร็วและ development server
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service (Database, Auth, Storage)

### UI และการจัดแต่ง
- **[Tailwind CSS](https://tailwindcss.com/)** - CSS framework แบบ utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - ไลบรารีคอมโพเนนท์ที่สวยงามและเข้าถึงได้
- **[Radix UI](https://www.radix-ui.com/)** - UI primitives ระดับต่ำ
- **[Lucide React](https://lucide.dev/)** - ไลบรารีไอคอนที่สวยงาม

### ฟังก์ชันการทำงาน
- **[React Router v7](https://reactrouter.com/)** - การจัดการเส้นทางฝั่งไคลเอ็นต์
- **[TanStack Query](https://tanstack.com/query/)** - การดึงข้อมูลและแคชชิ่ง
- **[React Leaflet](https://react-leaflet.js.org/)** - แผนที่แบบโต้ตอบ
- **[React Hook Form](https://react-hook-form.com/)** - การจัดการฟอร์ม

### เครื่องมือการพัฒนา
- **[ESLint](https://eslint.org/)** - การตรวจสอบและคุณภาพโค้ด
- **[Prettier](https://prettier.io/)** - การจัดรูปแบบโค้ด
- **[Vitest](https://vitest.dev/)** - Unit testing framework

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

## 📋 แผนงานและทิศทางการพัฒนา

### เสร็จสิ้นแล้ว ✅
- **Frontend Foundation**
  - การออกแบบที่ตอบสนอง (เน้นมือถือเป็นหลัก)
  - การรองรับหลายภาษา (ไทย/อังกฤษ) พร้อม i18n infrastructure
  - TypeScript integration เต็มรูปแบบ
  - Component library ด้วย shadcn/ui
- **Core Features**
  - การค้นหาสถานที่ท่องเที่ยวแบบเรียลไทม์
  - การกรองตามหมวดหมู่และแท็ก
  - ระบบรายการโปรด (Favorites) พร้อม local storage
  - การผสานรวมแผนที่แบบโต้ตอบด้วย Leaflet
  - หน้า Explore สำหรับเนื้อหาจากชุมชน
- **Developer Experience**
  - Vite build system สำหรับประสิทธิภาพสูง
  - ESLint + Prettier configuration
  - Docker support สำหรับ development และ production
  - DevTools panel สำหรับ debugging

### กำลังดำเนินการ 🚧
- **Performance Optimization**
  - Image lazy loading และ optimization
  - Code splitting สำหรับ pages หลัก
  - Bundle size analysis และ optimization
  - Service Worker สำหรับ caching
- **Search Enhancement**
  - **Phase 2 Implementation**: Semantic search with embedding vectors and hybrid ranking
  - Fuzzy search สำหรับการค้นหาที่ยืดหยุ่น
  - Search suggestions และ autocomplete
  - Advanced filters (ราคา, ระยะทาง, rating, หมวดหมู่, วันที่)
  - Search history และ recent searches
  - **Search Configuration**: Environment-based weight tuning และ feature flags
  - **Search Observability**: Performance monitoring และ usage analytics
- **Accessibility Improvements**
  - ARIA labels และ semantic HTML
  - Keyboard navigation support
  - Screen reader compatibility
  - Color contrast optimization

### แผนระยะสั้น (3-6 เดือน) 📅
- **User Authentication & Personalization**
  ```
  Priority: High | Effort: Medium
  - OAuth integration (Google, Facebook)
  - User profiles และ preferences
  - Personal travel history
  - Personalized recommendations
  ```
- **Advanced Map Features**
  ```
  Priority: High | Effort: Medium  
  - Cluster markers สำหรับสถานที่ใกล้เคียง
  - Custom map styles และ themes
  - Offline map support
  - Route planning between attractions
  ```
- **Content Management**
  ```
  Priority: Medium | Effort: High
  - Admin dashboard สำหรับจัดการเนื้อหา
  - User-generated content (reviews, photos)
  - Content moderation system
  - SEO optimization
  ```

### แผนระยะกลาง (6-12 เดือน) 🎯
- **Progressive Web App (PWA)**
  ```
  Priority: High | Effort: High
  - Service Worker สำหรับ offline functionality
  - Push notifications สำหรับข้อเสนอพิเศษ
  - App-like experience บนมือถือ
  - Background sync สำหรับข้อมูล
  ```
- **Real-time Features**
  ```
  Priority: Medium | Effort: High
  - Live chat support
  - Real-time availability updates
  - Collaborative trip planning
  - Live events และ announcements
  ```
- **Booking & Planning System**
  ```
  Priority: High | Effort: High
  - Hotel และ accommodation booking
  - Activity booking integration
  - Trip itinerary builder
  - Budget planning tools
  - Booking confirmation system
  ```

### แผนระยะยาว (1-2 ปี) 🚀
- **Mobile Applications**
  ```
  Priority: High | Effort: Very High
  - React Native app สำหรับ iOS และ Android
  - Native features (GPS, Camera, Push notifications)
  - App Store และ Google Play deployment
  - Cross-platform data synchronization
  ```
- **AI & Machine Learning**
  ```
  Priority: Medium | Effort: Very High
  - AI-powered recommendations
  - Image recognition สำหรับสถานที่
  - Natural language search
  - Predictive analytics สำหรับ travel trends
  ```
- **Enterprise Features**
  ```
  Priority: Medium | Effort: High
  - B2B dashboard สำหรับ tour operators
  - API marketplace สำหรับ third-party integrations
  - Analytics และ reporting tools
  - White-label solutions
  ```

### การพัฒนาด้านเทคนิค

#### Backend Infrastructure (Future)
```
┌─────────────────────────────────────┐
│            API Gateway              │
├─────────────────────────────────────┤
│  Microservices                      │
│  ├── User Service                   │
│  ├── Content Service                │
│  ├── Search Service                 │
│  ├── Booking Service                │
│  └── Notification Service           │
├─────────────────────────────────────┤
│  Database Layer                     │
│  ├── PostgreSQL (Primary Data)      │
│  ├── Redis (Caching)                │
│  ├── Elasticsearch (Search)         │
│  └── CDN (Static Assets)            │
└─────────────────────────────────────┘
```

#### การปรับปรุงประสิทธิภาพ
- **Frontend Optimization**
  - Virtual scrolling สำหรับรายการยาว
  - Memoization สำหรับ expensive calculations
  - Optimistic updates สำหรับ UX ที่ดีขึ้น
- **Backend Optimization**
  - Database indexing และ query optimization
  - CDN สำหรับ global content delivery
  - Rate limiting และ security measures

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

# ตรวจสอบ dependencies ที่เป็นปัญหา
npm audit
npm audit fix
```

**ข้อผิดพลาด TypeScript**
```bash
# รันการตรวจสอบ type
npm run type-check

# ตรวจสอบไฟล์ที่มีปัญหา
npx tsc --noEmit --listFiles
```

**ปัญหา Linting**
```bash
# แก้ไข linting errors อัตโนมัติ
npm run lint:fix

# ตรวจสอบการตั้งค่า ESLint
npx eslint --print-config src/main.tsx
```

**ปัญหาแผนที่ไม่แสดง**
```bash
# ตรวจสอบ console สำหรับ errors
# ตรวจสอบ network tab ใน dev tools
# ตรวจสอบว่า Leaflet CSS ถูกโหลดแล้ว

# แก้ไขปัญหา CSS
import 'leaflet/dist/leaflet.css'
```

**ปัญหาการ Hot Reload**
```bash
# รีสตาร์ท development server
npm run dev

# ล้าง browser cache
# ตรวจสอบ .env files
```

### การ Debug ขั้นสูง

**การใช้ DevTools Panel**
1. เปิดโหมด debug: `npm run dev:debug`
2. คลิกไอคอน 🛠️ ที่มุมล่างขวา
3. ใช้เครื่องมือ debug ที่มีให้:
   - Environment Inspector
   - Storage Manager
   - Performance Monitor
   - Console Logger

**การตรวจสอบ Network Issues**
```javascript
// ใน browser console
// ตรวจสอบ failed requests
performance.getEntriesByType('navigation')
performance.getEntriesByType('resource')

// ตรวจสอบ WebSocket connections
// ดูใน Network tab > WS
```

**การวิเคราะห์ Bundle Size**
```bash
# วิเคราะห์ build output
npm run build -- --mode analyze

# ใช้ webpack-bundle-analyzer (หากต้องการ)
npx webpack-bundle-analyzer dist/static/js/*.js
```

## 📊 การปรับปรุงประสิทธิภาพ

### การปรับแต่ง Frontend

#### การจัดการ Images
```typescript
// ใช้ lazy loading สำหรับรูปภาพ
const LazyImage = ({ src, alt, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <img
      src={loaded ? src : 'data:image/svg+xml;base64,...'} // placeholder
      alt={alt}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      {...props}
    />
  );
};
```

#### Code Splitting
```typescript
// Lazy load pages
const Explore = lazy(() => import('./pages/Explore'));
const MapPage = lazy(() => import('./pages/MapPage'));

// ใน App.tsx
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/explore" element={<Explore />} />
    <Route path="/map" element={<MapPage />} />
  </Routes>
</Suspense>
```

#### การจัดการ State
```typescript
// ใช้ React.memo สำหรับ components ที่ไม่ต้องการ re-render บ่อย
const AttractionCard = React.memo(({ attraction }) => {
  // component logic
});

// ใช้ useMemo สำหรับ expensive calculations
const filteredAttractions = useMemo(() => {
  return attractions.filter(/* filter logic */);
}, [attractions, filters]);
```

### การปรับแต่ง Build

#### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          map: ['leaflet', 'react-leaflet'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['leaflet'],
  },
});
```

### การตรวจสอบประสิทธิภาพ

#### Performance Metrics
```bash
# รัน Lighthouse audit
npx lighthouse http://localhost:8081 --output html

# ตรวจสอบ Core Web Vitals
# - First Contentful Paint (FCP)
# - Largest Contentful Paint (LCP)  
# - Cumulative Layout Shift (CLS)
# - First Input Delay (FID)
```

#### การใช้ React DevTools
```javascript
// Profile component performance
// 1. เปิด React DevTools
// 2. ไปที่ Profiler tab
// 3. กด Record และใช้งานแอป
// 4. วิเคราะห์ render times
```

## 🔒 ข้อพิจารณาด้านความปลอดภัย

### Client-Side Security

#### การตรวจสอบ Input
```typescript
// ใช้ Zod สำหรับ validation
const searchSchema = z.object({
  query: z.string().max(100).regex(/^[a-zA-Zก-๙\s]+$/),
  category: z.enum(['beach', 'temple', 'mountain', 'food']),
});

// Sanitize user input
const sanitizeInput = (input: string) => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};
```

#### การจัดการ Secrets
```bash
# ไม่เก็บ secrets ใน code
# ใช้ environment variables

# .env.example
VITE_API_BASE_URL=https://api.example.com
VITE_MAP_API_KEY=your_map_api_key_here
# ห้าม commit .env files จริง
```

#### Content Security Policy
```html
<!-- ใน index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               img-src 'self' data: https:;
               connect-src 'self' https: wss:;">
```

### การตรวจสอบความปลอดภัย

```bash
# ตรวจสอบ vulnerabilities ใน dependencies
npm audit

# แก้ไขปัญหาความปลอดภัย
npm audit fix

# ตรวจสอบรายละเอียด
npm audit --audit-level high
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
