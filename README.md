# PaiNaiDee - แอปพลิเคชันค้นหาสถานที่ท่องเที่ยวในประเทศไทย

<div align="center">
  <img src="public/favicon.ico" alt="PaiNaiDee Logo" width="80" height="80">
  
  **ค้นพบสถานที่ท่องเที่ยวที่น่าทึ่งในประเทศไทย** 🇹🇭
  
  [![CI](https://github.com/athipan1/pai-naidee-ui-spark/actions/workflows/ci.yml/badge.svg)](https://github.com/athipan1/pai-naidee-ui-spark/actions/workflows/ci.yml)
  
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

# 4. เริ่ม development server
npm run dev

# 5. เปิดเว็บเบราว์เซอร์และไปที่ http://localhost:8080
```

แอปพลิเคชันจะพร้อมใช้งานที่ `http://localhost:8080` พร้อมกับการ hot reload

## 🐳 การติดตั้งด้วย Docker

### ใช้งานบน Production ด้วย Docker

```bash
# 1. Build Docker image
docker build -t pai-naidee-ui:latest .

# 2. Run container
docker run -d \
  --name pai-naidee-ui \
  -p 80:80 \
  pai-naidee-ui:latest

# 3. เข้าถึงแอปพลิเคชันได้ที่ http://localhost
```

### Development ด้วย Docker Compose

```bash
# 1. สร้างและรัน development environment
docker-compose up -d

# 2. ตรวจสอบ logs
docker-compose logs -f

# 3. หยุด services
docker-compose down
```

### Environment Variables สำหรับ Docker

สร้างไฟล์ `.env` โดยคัดลอกจาก `.env.example`:

```bash
cp .env.example .env
# แก้ไขไฟล์ .env ตามความต้องการ
```

**สำคัญ**: ไม่ใส่ secrets หรือ sensitive data ใน Docker image

### ⚙️ การกำหนดค่า Phase 2 Search (ขั้นสูง)

Phase 2 มาพร้อมกับระบบค้นหาที่ขั้นสูงที่สามารถปรับแต่งได้:

#### การสร้าง Semantic Index

```bash
# สร้าง semantic index สำหรับการค้นหาด้วยความหมาย
npm run build:semantic-index
```

#### การกำหนดค่าผ่าน Environment Variables

```bash
# Feature Flags - เปิด/ปิดฟีเจอร์ต่างๆ
ENABLE_SEMANTIC=true              # เปิดใช้งาน semantic search
ENABLE_PERSONALIZATION=false     # เปิดใช้งาน personalization
ENABLE_ADV_FILTERS=true          # เปิดใช้งาน advanced filters

# Search Weights - ปรับน้ำหนักการจัดอันดับ (ผลรวมต้องเท่ากับ 1.0)
SEARCH_WEIGHT_LEXICAL=0.45       # น้ำหนัก keyword matching
SEARCH_WEIGHT_SEMANTIC=0.25      # น้ำหนัก semantic similarity
SEARCH_WEIGHT_POPULARITY=0.15    # น้ำหนัก popularity score
SEARCH_WEIGHT_RECENCY=0.10       # น้ำหนัก recency score
SEARCH_WEIGHT_PERSONALIZATION=0.05 # น้ำหนัก personalization
```

#### การรันเทส

```bash
# รันเทสสำหรับ Phase 2 components
npm run test

# รันเทสแบบ watch mode
npm run test:ui
```

#### เอกสารเพิ่มเติม

📚 **[Phase 2 Search Architecture](docs/search-architecture-phase2.md)** - เอกสารโครงสร้างและการทำงานของระบบค้นหาแบบละเอียด

## 📖 คู่มือการใช้งาน

### การเริ่มต้นใช้งาน

#### 1. หน้าแรก (Home)
![PaiNaiDee Homepage](https://github.com/user-attachments/assets/21f27c02-19c6-48ae-b886-f0c4e357ac46)

หน้าแรกประกอบด้วย:
- **แถบค้นหาหลัก**: พิมพ์ชื่อสถานที่หรือคำค้นหาที่ต้องการ
- **หมวดหมู่ยอดนิยม**: คลิกปุ่มหมวดหมู่ (Beach, Temple, Mountain, Waterfall, Island) เพื่อกรองผลลัพธ์
- **สถานที่แนะนำ**: แสดงสถานที่ท่องเที่ยวยอดนิยมพร้อมรีวิวและคะแนน

#### 2. การค้นหาสถานที่
```
1. ใช้แถบค้นหาพิมพ์ชื่อสถานที่ เช่น "เกาะพีพี" หรือ "Phi Phi Islands"
2. เลือกหมวดหมู่จากปุ่มด้านล่างแถบค้นหา
3. ผลลัพธ์จะแสดงแบบเรียลไทม์พร้อมคะแนนและรีวิว
4. คลิกที่การ์ดสถานที่เพื่อดูรายละเอียดเพิ่มเติม
```

#### 3. การใช้งานแผนที่
- **เข้าถึงแผนที่**: คลิกปุ่ม "View & Navigate" ในการ์ดสถานที่ หรือไปที่หน้า Map
- **ฟังก์ชันแผนที่**:
  - ซูมเข้า/ออกด้วยการกดปุ่ม + / - หรือใช้ scroll
  - คลิกที่ marker เพื่อดูข้อมูลสถานที่
  - ใช้ปุ่ม "Get Directions" เพื่อเปิดแอปแผนที่ภายนอก

#### 4. การจัดการรายการโปรด
```
1. คลิกไอคอนหัวใจ ❤️ ในการ์ดสถานที่เพื่อเพิ่มในรายการโปรด
2. ไปที่หน้า Favorites เพื่อดูสถานที่ที่บันทึกไว้
3. สามารถลบออกจากรายการโปรดได้โดยคลิกไอคอนหัวใจอีกครั้ง
```

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

#### เครื่องมือ Developer
- ในโหมด development จะมีปุ่ม 🛠️ ที่มุมล่างขวา
- คลิกเพื่อเข้าถึง DevTools panel สำหรับการ debug

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
| `npm run test` | รัน tests ด้วย Vitest |
| `npm run test:run` | รัน tests แบบ single run |
| `npm run test:ui` | รัน tests พร้อม UI |
| `npm run format` | จัดรูปแบบโค้ดด้วย Prettier |
| `npm run format:check` | ตรวจสอบรูปแบบโค้ด |
| `npm run preview` | ดูตัวอย่าง production build |

### 🚀 CI/CD Pipeline

โปรเจคมี GitHub Actions CI pipeline ที่ทำงาน:

```yaml
# Triggered บน push/PR ไปยัง main branch
- Lint และ Type Check
- รัน Tests 
- Build Application
- Security Audit
- Docker Build Test
```

**การทดสอบ Local CI**:
```bash
# รันตามลำดับที่ CI ทำ
npm run lint
npm run type-check  
npm run test:run
npm run build

# ตรวจสอบ security
npm audit

# ทดสอบ Docker build
docker build -t pai-naidee-test .
```

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
│  ├── API Services (Search, Attractions)                │
│  ├── Map Services (Leaflet Integration)                │
│  └── Queue Service (WebSocket, Optional)               │
├─────────────────────────────────────────────────────────┤
│  Data Layer                                             │
│  ├── Mock Data (Development)                           │
│  ├── Static Assets (Images, Icons)                     │
│  └── External APIs (Maps, Tourism Data)                │
└─────────────────────────────────────────────────────────┘
```

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

### Deploy บน Vercel 🚀

Deploy โปรเจคนี้บน Vercel ได้อย่างง่ายดายด้วยปุ่มด้านล่าง:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A//github.com/athipan1/pai-naidee-ui-spark)

#### การตั้งค่า Environment Variables

หลังจาก deploy แล้ว ให้ตั้งค่า environment variables ต่อไปนี้ใน Vercel dashboard:

**ตัวแปรที่จำเป็น / Required Variables:**
```bash
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=your_database_connection_string
VITE_API_BASE_URL=https://your-api-domain.com/api
```

**ตัวแปรเสริม / Optional Variables:**
```bash
VITE_APP_TITLE=PaiNaiDee
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
VERCEL_PROJECT_NAME=pai-naidee-ui-spark
```

#### ขั้นตอนการ Deploy

1. คลิกปุ่ม "Deploy with Vercel" ด้านบน
2. เชื่อมต่อ GitHub account และเลือก repository
3. ตั้งค่า environment variables ในหน้า settings
4. รอ build process เสร็จสิ้น
5. เข้าถึงแอปผ่าน URL ที่ Vercel สร้างให้

### Deploy บน Hugging Face Spaces 🤗

Deploy แอปพลิเคชันบน Hugging Face Spaces สำหรับการใช้งานและสาธิต:

[![Deploy on HF Spaces](https://huggingface.co/datasets/huggingface/badges/resolve/main/deploy-on-spaces-md.svg)](https://huggingface.co/spaces/new?template=https://github.com/athipan1/pai-naidee-ui-spark)

#### การตั้งค่าสำหรับ Hugging Face Spaces

1. **สร้างไฟล์ `requirements.txt`** (หากต้องการ Python backend):
```txt
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
requests==2.31.0
```

2. **สร้างไฟล์ `app.py`** (สำหรับ demo backend):
```python
import gradio as gr
import requests

def predict(message):
    # ใส่ logic สำหรับ API calls ที่นี่
    return f"Response: {message}"

iface = gr.Interface(fn=predict, inputs="text", outputs="text")
iface.launch()
```

3. **โครงสร้างสำหรับ Spaces**:
```
pai-naidee-ui-spark/
├── app.py              # Gradio/Streamlit app (ถ้าต้องการ)
├── requirements.txt    # Python dependencies
├── README.md          # จะแสดงใน Spaces
├── src/               # Frontend code
└── package.json       # Node.js dependencies
```

#### หมายเหตุสำหรับ Hugging Face Spaces

- **Framework**: รองรับ Gradio, Streamlit หรือ Static HTML
- **API Demo**: สามารถใช้ Gradio สร้าง interactive demo
- **Frontend**: Static files จะถูกให้บริการ automatically
- **Python Backend**: เหมาะสำหรับ AI/ML features

### ทดลองใช้งานบน Google Colab ⚗️

#### 🧪 ทดลอง API ทั้งหมดใน Google Colab

ทดสอบการทำงานของ API ทั้งหมดได้ทันทีผ่าน Google Colab โดยไม่ต้องติดตั้งอะไรเพิ่มเติม

Test all API functionality instantly through Google Colab without any additional installation required

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/athipan1/pai-naidee-ui-spark/blob/main/tests/test_all_apis.ipynb)

#### รายการ API ที่ทดสอบ / Tested API Endpoints:

- ✅ `/api/talk` - AI Chat API สำหรับสนทนากับ AI
- ✅ `/api/attractions` - ค้นหาและแสดงสถานที่ท่องเที่ยว
- ✅ `/api/attractions/<id>` - รายละเอียดของสถานที่ท่องเที่ยวเฉพาะ
- ✅ `/api/videos` - จัดการและแสดงวิดีโอ
- ✅ `/api/videos/upload` - อัปโหลดวิดีโอใหม่
- ✅ `/api/user/profile` - จัดการโปรไฟล์ผู้ใช้
- ✅ `/api/user/favorites` - จัดการรายการโปรดของผู้ใช้

#### การตั้งค่าใน Google Colab:

1. **ติดตั้ง dependencies**:
```python
!pip install requests pandas json5 tabulate
```

2. **ตั้งค่า API endpoint URL**:
```python
API_BASE_URL = "https://your-vercel-app.vercel.app/api"  # เปลี่ยนเป็น URL ของคุณ
```

3. **ใช้ helper function สำหรับเรียก API**:
```python
def call_api(method, url, payload=None, headers=None):
    # ฟังก์ชันสำหรับเรียก API แบบง่ายๆ
    # Simple function to call API endpoints
    pass
```

#### คุณสมบัติของ Notebook:

- 🐍 **ใช้ Python** สำหรับการทดสอบที่ยืดหยุ่น
- 🌏 **แสดงผลเป็นภาษาไทย/อังกฤษ** เพื่อความชัดเจน
- 📊 **แสดงผลแบบตาราง** สำหรับข้อมูลที่อ่านง่าย
- 🔧 **ฟังก์ชันช่วยเหลือ** สำหรับการเรียก API
- ✅ **ทดสอบครบถ้วน** ทุก endpoint ที่สำคัญ

### ตัวเลือกการ Deploy อื่นๆ

1. **Static Hosting** - Deploy โฟลเดอร์ `build/` ไปยังบริการ static hosting ใดๆ
2. **Docker** - ใช้ Dockerfile ที่มีให้สำหรับ deployment แบบ containerized  
3. **Lovable Platform** - Deploy โดยตรงผ่าน Lovable (ดูการตั้งค่าเดิม)
4. **GitHub Pages** - ใช้ GitHub Actions workflow ที่มีอยู่แล้ว

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
npx webpack-bundle-analyzer build/static/js/*.js
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

## 📡 API Documentation

### การจัดการข้อมูล (Current Implementation)

ปัจจุบันแอปพลิเคชันใช้ข้อมูล mock ที่เก็บในไฟล์ `src/shared/data/mockData.ts` สำหรับการพัฒนาและทดสอบ

#### ข้อมูลสถานที่ท่องเที่ยว
```typescript
interface Attraction {
  id: string;
  name: string;           // ชื่อภาษาอังกฤษ
  nameLocal: string;      // ชื่อภาษาไทย
  province: string;       // จังหวัด
  category: string;       // หมวดหมู่
  tags: string[];         // แท็กสำหรับการค้นหา
  rating: number;         // คะแนนรีวิว (0-5)
  reviewCount: number;    // จำนวนรีวิว
  image: string;          // URL รูปภาพ
  description: string;    // คำอธิบาย
  location: {
    lat: number;          // พิกัด GPS
    lng: number;
  };
  amenities: string[];    // สิ่งอำนวยความสะดวก
}
```

#### Search API Structure
```typescript
interface SearchResponse {
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  total: number;
  hasMore: boolean;
}

interface SearchResult extends Attraction {
  confidence: number;     // ระดับความมั่นใจในผลลัพธ์ (0-1)
  matchedTerms: string[]; // คำที่ตรงกับการค้นหา
}
```

### API Endpoints (Future Implementation)

#### Authentication
```typescript
// POST /api/auth/login
{
  email: string;
  password: string;
}

// POST /api/auth/register  
{
  email: string;
  password: string;
  name: string;
  preferences?: UserPreferences;
}

// POST /api/auth/logout
// DELETE /api/auth/refresh
```

#### Attractions
```typescript
// GET /api/attractions
// Query parameters:
// - search: string
// - category: string
// - province: string  
// - limit: number
// - offset: number
// - sort: 'rating' | 'name' | 'distance'

// GET /api/attractions/:id
// Returns detailed attraction information

// POST /api/attractions/:id/favorite
// PUT /api/attractions/:id/rating
{
  rating: number; // 1-5
  review?: string;
}
```

#### User Management
```typescript
// GET /api/user/profile
// PUT /api/user/profile
{
  name: string;
  preferences: {
    language: 'th' | 'en';
    favoriteCategories: string[];
    notifications: boolean;
  };
}

// GET /api/user/favorites
// POST /api/user/favorites/:attractionId
// DELETE /api/user/favorites/:attractionId
```

### การใช้งาน API ในแอปพลิเคชัน

#### การเรียกใช้ด้วย TanStack Query
```typescript
// hooks/useAttractions.ts
export const useAttractions = (searchParams: SearchParams) => {
  return useQuery({
    queryKey: ['attractions', searchParams],
    queryFn: () => attractionAPI.search(searchParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!searchParams.query || !!searchParams.category,
  });
};

// การใช้งานใน component
const { data, isLoading, error } = useAttractions({
  query: searchTerm,
  category: selectedCategory,
  limit: 20,
});
```

#### Error Handling
```typescript
// utils/api.ts
export const handleAPIError = (error: unknown) => {
  if (error instanceof AxiosError) {
    switch (error.response?.status) {
      case 404:
        return 'ไม่พบข้อมูลที่ค้นหา';
      case 500:
        return 'เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่';
      default:
        return 'เกิดข้อผิดพลาด กรุณาตรวจสอบการเชื่อมต่อ';
    }
  }
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
};
```

### WebSocket Integration (Optional)

```typescript
// services/queueService.ts
class QueueService {
  private ws: WebSocket | null = null;
  
  connect() {
    this.ws = new WebSocket('ws://localhost:5000/api/ws');
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
  }
  
  // Real-time updates สำหรับ:
  // - Attraction availability
  // - Live reviews
  // - System notifications
}
```

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
