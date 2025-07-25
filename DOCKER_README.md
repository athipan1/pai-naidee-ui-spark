# แนวปฏิบัติการพัฒนาและอัปเดต Docker ในโปรเจกต์

คู่มือนี้อธิบายแนวปฏิบัติที่ดีสำหรับการใช้ Docker ในการพัฒนาและ deploy โปรเจกต์ pai-naidee-ui-spark

## 🚀 การเริ่มต้นใช้งาน Docker

### สำหรับการพัฒนา (Development)

```bash
# เริ่มใช้งาน development server พร้อม volume mounting
docker-compose up dev

# หรือเรียกใช้ในพื้นหลัง
docker-compose up -d dev
```

### สำหรับ Production

```bash
# Build และรัน production version
docker-compose up app

# หรือใช้ Dockerfile โดยตรง
docker build -t pai-naidee-app .
docker run -p 80:80 pai-naidee-app
```

## 📋 แนวปฏิบัติการพัฒนาและอัปเดต

### 1. 🔧 การพัฒนาโค้ด (Code Development)

**ไม่จำเป็นต้อง rebuild Docker** เมื่อ:
- แก้ไขไฟล์ในโฟลเดอร์ `src/`
- เปลี่ยนแปลง `index.html`, `vite.config.ts`, `tailwind.config.ts`
- แก้ไข configuration files อื่นๆ

**เหตุผล**: ใช้ volumes mount โค้ดเข้ากับ container โค้ดใหม่จะถูกใช้งานทันทีผ่าน hot reload

```bash
# เมื่อแก้ไขโค้ด เพียงแค่ save ไฟล์
# ไม่ต้องรัน rebuild - การเปลี่ยนแปลงจะปรากฏทันที
```

### 2. 📦 การอัปเดต Dependencies

**ต้อง rebuild Docker image** เมื่อ:
- เพิ่ม/ลบ/อัปเดต packages ใน `package.json`
- เปลี่ยนแปลง `package-lock.json`
- แก้ไข `.npmrc`

```bash
# หยุดการทำงานของ container เดิม
docker-compose down

# Rebuild image พร้อมติดตั้ง dependencies ใหม่
docker-compose build dev

# เริ่มใช้งานใหม่
docker-compose up dev
```

### 3. 🐳 การเปลี่ยนแปลง Dockerfile

**ต้อง rebuild Docker image** เมื่อ:
- แก้ไข `Dockerfile` หรือ `Dockerfile.dev`
- เปลี่ยนแปลง base image หรือ system dependencies
- เปลี่ยน configuration ของ container

```bash
# Rebuild image
docker-compose build dev

# หรือ force rebuild ทั้งหมด
docker-compose build --no-cache dev
```

### 4. ⚠️ การจัดการ Cache

**ใช้ --no-cache เมื่อ**:
- Dependencies เปลี่ยนแปลงแต่ Docker ยังใช้ cache เก่า
- มีปัญหาในการติดตั้ง packages
- ต้องการให้ rebuild ตั้งแต่ต้นเพื่อให้แน่ใจ

```bash
# ละทิ้ง cache เดิมและ build ใหม่ทั้งหมด
docker-compose build --no-cache dev

# หรือสำหรับ production
docker-compose build --no-cache app
```

## 📁 โครงสร้างไฟล์ Docker

```
pai-naidee-ui-spark/
├── Dockerfile              # สำหรับ production
├── Dockerfile.dev          # สำหรับ development
├── docker-compose.yml      # ประกอบ services ทั้งหมด
├── .dockerignore           # ไฟล์ที่ไม่ต้องส่งไป Docker build
└── DOCKER_README.md        # คู่มือนี้
```

## 🛠️ คำสั่งที่มีประโยชน์

### การจัดการ Containers

```bash
# ดู containers ที่กำลังทำงาน
docker-compose ps

# ดู logs
docker-compose logs dev

# เข้าไปใน container
docker-compose exec dev sh

# หยุดและลบ containers
docker-compose down

# หยุด containers พร้อมลบ volumes
docker-compose down -v
```

### การทำความสะอาด

```bash
# ลบ images ที่ไม่ใช้
docker image prune

# ลบ containers ที่หยุดทำงาน
docker container prune

# ลบทุกอย่างที่ไม่ใช้
docker system prune -a
```

## 🔍 การแก้ไขปัญหา

### ปัญหาทั่วไป

1. **Port already in use**
   ```bash
   # เปลี่ยน port ใน docker-compose.yml หรือหยุด service ที่ใช้ port
   docker-compose down
   ```

2. **Permission denied**
   ```bash
   # ตรวจสอบสิทธิ์ของไฟล์และโฟลเดอร์
   sudo chown -R $USER:$USER .
   ```

3. **Dependencies ไม่อัปเดต**
   ```bash
   # Rebuild โดยไม่ใช้ cache
   docker-compose build --no-cache dev
   ```

## 📚 เพิ่มเติม

- การ mount volumes ช่วยให้การพัฒนาเร็วขึ้นเพราะไม่ต้อง rebuild ทุกครั้งที่เปลี่ยนโค้ด
- การใช้ `.dockerignore` ช่วยลดขนาด build context และเพิ่มความเร็วในการ build
- แยก Dockerfile สำหรับ development และ production เพื่อให้เหมาะสมกับการใช้งานแต่ละแบบ

สำหรับคำถามเพิ่มเติมหรือตัวอย่างการใช้งาน สามารถดูที่ DEV_README.md