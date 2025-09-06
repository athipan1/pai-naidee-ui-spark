# API Endpoints ที่ Frontend ต้องการจาก Backend

จากากรตรวจสอบโค้ด Frontend พบว่ามีการเรียกใช้งาน API หลายรายการที่ยังไม่มีอยู่ในเอกสารทดสอบของฝั่ง Backend (`tests/test_all_apis.ipynb`)

เพื่อให้ฟังก์ชันการทำงานของ Frontend สมบูรณ์ Backend ควรมี Endpoints เหล่านี้:

### 1. Core Features

*   **`POST /api/attractions`**
    *   **หน้าที่**: สำหรับสร้างสถานที่ท่องเที่ยวใหม่
    *   **ไฟล์ที่เรียก**: `src/lib/axios.ts`

*   **`POST /api/predict`** (หรือปรับ `POST /api/talk` ให้ตรงกัน)
    *   **หน้าที่**: ระบบ AI Chat
    *   **ไฟล์ที่เรียก**: `src/services/ai.service.ts`

*   **`GET /api/health`**
    *   **หน้าที่**: สำหรับตรวจสอบสถานะของ Backend
    *   **ไฟล์ที่เรียก**: `src/lib/axios.ts`

### 2. ระบบค้นหา (Search)

*   **`POST /api/search`**
    *   **หน้าที่**: ระบบค้นหาหลัก (Legacy)
    *   **ไฟล์ที่เรียก**: `src/services/search.service.ts`

*   **`GET /api/locations/autocomplete`**
    *   **หน้าที่**: สำหรับทำ Autocomplete suggestion ในช่องค้นหา
    *   **ไฟล์ที่เรียก**: `src/services/search.service.ts`

### 3. ระบบ Community & Posts

*   **`GET /api/posts`**: ดึงข้อมูล Feed ของ Community
*   **`POST /api/posts`**: สร้าง Post ใหม่
*   **`POST /api/posts/{postId}/like`**: กด Like Post
*   **`GET /api/posts/{postId}/engagement`**: ดึงข้อมูลสถิติของ Post
*   **`POST /api/posts/{postId}/comments`**: เพิ่ม Comment ใน Post
    *   **ไฟล์ที่เรียก**: `src/shared/services/communityService.ts`

### 4. ระบบวิดีโอ (Explore Feed)

*   **`GET /api/explore/videos`**: ดึงข้อมูลวิดีโอสำหรับหน้า Explore
*   **`POST /api/videos/{videoId}/like`**: กด Like วิดีโอ
*   **`POST /api/videos/{videoId}/share`**: แชร์วิดีโอ
*   **`GET /api/videos/{videoId}/comments`**: ดึงคอมเมนต์ของวิดีโอ
*   **`POST /api/videos/{videoId}/comments`**: เพิ่มคอมเมนต์ในวิดีโอ
    *   **ไฟล์ที่เรียก**: `src/services/explore.service.ts`

### 5. ระบบผู้ใช้งาน (User)

*   **`POST /api/users/{userId}/follow`**: กด Follow ผู้ใช้งาน
    *   **ไฟล์ที่เรียก**: `src/services/explore.service.ts`

*   **`POST /api/auth/login`**: สำหรับ Login เข้าสู่ระบบ
*   **`POST /api/auth/refresh`**: สำหรับ Refresh Token
    *   **ไฟล์ที่เรียก**: `src/shared/services/authService.ts`

### 6. ฟีเจอร์อื่นๆ

*   **`GET /api/accommodations/nearby/{attractionId}`**
    *   **หน้าที่**: ค้นหาที่พักใกล้เคียง
    *   **ไฟล์ที่เรียก**: `src/services/attraction.service.ts`

---

นอกจากนี้ยังมี API ที่ถูกจำลองไว้ (Mocked) ซึ่งบ่งบอกถึงฟีเจอร์ที่วางแผนไว้ในอนาคต เช่น ระบบ `rewards`, `groups`, และ `user points` ซึ่งก็อาจจะต้องสร้าง Endpoint สำหรับฟีเจอร์เหล่านี้ในอนาคตครับ
