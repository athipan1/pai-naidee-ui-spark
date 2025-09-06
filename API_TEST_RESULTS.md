| Method | Path | สถานะการเชื่อมต่อ | รหัสตอบกลับ | หมายเหตุ / สาเหตุ |
|---|---|---|---|---|
| GET | /api/health | ✅ | 200 | ใช้งานได้ |
| POST | /api/talk | ❌ | 400 | Payload ไม่ถูกต้อง `sender` และ `receiver` เป็น field ที่บังคับ |
| POST | /api/predict | ✅ | 200 | ใช้งานได้ |
| GET | /api/attractions | ⚠️ | 200 | ได้ข้อมูลว่างเปล่า อาจจะไม่มีข้อมูลในระบบ |
| GET | /api/attractions/1 | ❌ | 404 | ไม่พบข้อมูล (คาดว่าเพราะ DB ว่าง) |
| GET | /api/attractions/wat-pho | ❌ | 404 | URL ไม่ถูกต้อง (Not Found on Server) |
| POST | /api/search | ⚠️ | 200 | ได้ข้อมูลว่างเปล่า อาจจะไม่มีข้อมูลในระบบ |
| GET | /api/locations/autocomplete | ❌ | 404 | Path ไม่ตรงกับ Backend |
| GET | /api/posts | ⚠️ | 200 | ได้ข้อมูลว่างเปล่า อาจจะไม่มีข้อมูลในระบบ |
| GET | /api/explore/videos | ⚠️ | 200 | ได้ข้อมูลว่างเปล่า อาจจะไม่มีข้อมูลในระบบ |
| GET | /api/videos/1/comments | ❌ | 404 | ไม่พบข้อมูล (คาดว่าเพราะ DB ว่าง) |
|---|---|---|---|---|
| POST | /api/auth/login | ❌ | 401 | ไม่สามารถใช้ credential ของ mock user ได้ |
| POST | /api/attractions | Untested | - | ต้องการ Authentication |
| POST | /api/posts | Untested | - | ต้องการ Authentication |
| POST | /api/posts/{postId}/like | Untested | - | ต้องการ Authentication |
| GET | /api/posts/{postId}/engagement | Untested | - | ต้องการ Authentication |
| POST | /api/posts/{postId}/comments | Untested | - | ต้องการ Authentication |
| POST | /api/videos/{videoId}/like | Untested | - | ต้องการ Authentication |
| POST | /api/videos/{videoId}/share | Untested | - | ต้องการ Authentication |
| POST | /api/videos/{videoId}/comments | Untested | - | ต้องการ Authentication |
| POST | /api/users/{userId}/follow | Untested | - | ต้องการ Authentication |
| POST | /api/auth/refresh | Untested | - | ต้องการ Authentication |
| GET | /api/accommodations/nearby/{attractionId} | Untested | - | ต้องการ Authentication |
| POST | /api/videos/upload | Untested | - | ต้องการ Authentication |
| GET | /api/user/profile | Untested | - | ต้องการ Authentication |
| PUT | /api/user/profile | Untested | - | ต้องการ Authentication |
| GET | /api/user/favorites | Untested | - | ต้องการ Authentication |
| POST | /api/user/favorites/{attractionId} | Untested | - | ต้องการ Authentication |
| DELETE | /api/user/favorites/{attractionId} | Untested | - | ต้องการ Authentication |
