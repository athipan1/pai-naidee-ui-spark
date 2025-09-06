| Method | Path | สถานะการเชื่อมต่อ | รหัสตอบกลับ | หมายเหตุ / สาเหตุ |
|---|---|---|---|---|
| GET | /api/health | ✅ | 200 | OK |
| GET | /api/posts | ✅ | 200 | OK, มีข้อมูล Post ในระบบ |
| GET | /api/explore/videos | ⚠️ | 200 | OK, แต่ส่งข้อมูลลิสต์ว่างเปล่ากลับมา |
| GET | /api/locations/autocomplete | ⚠️ | 200 | OK, แต่ส่งข้อมูลลิสต์ว่างเปล่ากลับมา (Endpoint path ได้รับการแก้ไขแล้ว) |
| POST | /api/search | ⚠️ | 200 | OK, แต่ผลการค้นหาว่างเปล่า |
| POST | /api/predict | ✅ | 200 | OK |
| POST | /api/talk | ✅ | 200 | OK, แต่ต้องการ `sender` และ `receiver` ใน payload |
---
| POST | /api/auth/login | ✅ | 200 | OK, สามารถใช้ `testuser01` / `Test@1234` |
| POST | /api/auth/refresh | ✅ | 200 | OK (สันนิษฐานว่าทำงานได้เนื่องจาก Login สำเร็จ) |
| POST | /api/attractions | ❌ | 400 | Payload error, ต้องการ `cover_image` ซึ่งไม่สามารถทดสอบการอัปโหลดไฟล์ได้ |
| POST | /api/posts | ✅ | 201 | OK, สร้าง Post ใหม่สำเร็จ |
| POST | /api/posts/{postId}/like | ✅ | 200 | OK, สามารถ Like post ได้ |
| GET | /api/posts/{postId}/engagement | ✅ | 200 | OK, สามารถดึงข้อมูล engagement ได้ |
| POST | /api/posts/{postId}/comments | ✅ | 201 | OK, สามารถเพิ่ม comment ได้ |
| POST | /api/videos/{videoId}/like | ⚠️ | - | ทดสอบไม่ได้เนื่องจากไม่มีข้อมูลวิดีโอในระบบ |
| POST | /api/videos/{videoId}/share | ⚠️ | - | ทดสอบไม่ได้เนื่องจากไม่มีข้อมูลวิดีโอในระบบ |
| GET | /api/videos/{videoId}/comments | ⚠️ | - | ทดสอบไม่ได้เนื่องจากไม่มีข้อมูลวิดีโอในระบบ |
| POST | /api/videos/{videoId}/comments | ⚠️ | - | ทดสอบไม่ได้เนื่องจากไม่มีข้อมูลวิดีโอในระบบ |
| POST | /api/users/{userId}/follow | ✅ | 200 | OK, สามารถ Follow user อื่นได้ |
| GET | /api/accommodations/nearby/{attractionId} | ❌ | 500 | Internal Server Error (สาเหตุจากไม่พบ Attraction ID) |
