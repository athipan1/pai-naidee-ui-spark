# Backend - โฟลเดอร์สำหรับไฟล์ใช้งานร่วมกัน

## 📋 วัตถุประสงค์

โฟลเดอร์ `backend` นี้ถูกสร้างขึ้นเพื่อเก็บโค้ดและไฟล์ที่ใช้งานร่วมกันระหว่างแอปพลิเคชันทั้งฝั่ง frontend และ backend อื่น ๆ ในอนาคต

## 🎯 เป้าหมาย

- **จัดการไฟล์กลาง**: เก็บ utilities, types, และ configuration ที่ใช้ร่วมกัน
- **ลดการซ้ำซ้อน**: หลีกเลี่ยงการเขียนโค้ดที่ซ้ำกันในหลายส่วน
- **ความสอดคล้อง**: รักษาความสอดคล้องของ data types และ interfaces
- **การพัฒนาแบบร่วมกัน**: สนับสนุนการพัฒนาระหว่างทีม frontend และ backend

## 📁 โครงสร้างที่แนะนำ

```
backend/
├── README.md              # เอกสารอธิบายการใช้งาน (ไฟล์นี้)
├── types/                 # TypeScript interfaces และ types ที่ใช้ร่วมกัน
│   ├── api.ts            # API request/response types
│   ├── user.ts           # User-related types
│   └── attraction.ts     # Attraction-related types
├── utils/                 # Utility functions ที่ใช้ร่วมกัน
│   ├── validation.ts     # Data validation helpers
│   ├── constants.ts      # Application constants
│   └── formatters.ts     # Data formatting utilities
├── config/                # Configuration files
│   ├── database.ts       # Database configuration
│   └── api-endpoints.ts  # API endpoint definitions
└── schemas/               # Data validation schemas
    ├── user.schema.ts    # User validation schemas
    └── api.schema.ts     # API validation schemas
```

## 🚀 การใช้งานเบื้องต้น

### 1. Shared Types
```typescript
// backend/types/api.ts
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
```

### 2. Common Utilities
```typescript
// backend/utils/validation.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateThaiPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+66|0)[0-9]{8,9}$/;
  return phoneRegex.test(phone);
};
```

### 3. Constants
```typescript
// backend/utils/constants.ts
export const API_ENDPOINTS = {
  ATTRACTIONS: '/api/attractions',
  USERS: '/api/users',
  SEARCH: '/api/search',
  HEALTH: '/api/health'
} as const;

export const ATTRACTION_CATEGORIES = {
  TEMPLE: 'temple',
  BEACH: 'beach',
  MOUNTAIN: 'mountain',
  WATERFALL: 'waterfall',
  CULTURE: 'culture'
} as const;
```

## 💡 แนวทางการใช้งาน

### สำหรับ Frontend (React/TypeScript)
```typescript
// ใน src/shared/types/ 
import type { APIResponse } from '../../backend/types/api';
import { validateEmail } from '../../backend/utils/validation';

// ใช้งาน shared types
const handleApiResponse = (response: APIResponse<Attraction[]>) => {
  if (response.success && response.data) {
    // Process attraction data
  }
};
```

### สำหรับ Backend Services (Node.js/Python/Go)
```typescript
// Import shared types and utilities
import { APIResponse, PaginationParams } from './backend/types/api';
import { ATTRACTION_CATEGORIES } from './backend/utils/constants';

// ใช้งาน shared interfaces
const createAttraction = async (data: AttractionInput): Promise<APIResponse<Attraction>> => {
  // Implementation
};
```

## 📌 หลักการและข้อแนะนำ

### 1. การตั้งชื่อไฟล์
- ใช้ kebab-case สำหรับชื่อไฟล์: `api-endpoints.ts`
- ใช้ PascalCase สำหรับ types และ interfaces: `APIResponse`
- ใช้ UPPER_SNAKE_CASE สำหรับ constants: `API_ENDPOINTS`

### 2. การจัดระเบียบ
- แยกไฟล์ตาม domain หรือ feature
- เก็บ types ที่เกี่ยวข้องไว้ในไฟล์เดียวกัน
- ใช้ index.ts สำหรับ re-export หลายไฟล์

### 3. Documentation
- เขียน JSDoc comments สำหรับ functions และ interfaces
- ระบุ example การใช้งานใน comments
- อัปเดต README.md เมื่อมีการเปลี่ยนแปลงโครงสร้าง

### 4. Version Control
- ใช้ semantic versioning เมื่อมีการเปลี่ยนแปลง breaking changes
- Tag การเปลี่ยนแปลงสำคัญในโฟลเดอร์นี้
- สื่อสารการเปลี่ยนแปลงให้ทีมที่เกี่ยวข้อง

## 🔄 Integration กับ Frontend

โฟลเดอร์นี้สามารถนำไปใช้ร่วมกับโค้ด Frontend ที่มีอยู่ใน `src/shared/` โดย:

1. **Types**: เพิ่ม types ใหม่ที่ต้องใช้ร่วมกับ backend
2. **Utilities**: ย้าย common utilities ที่ backend อาจต้องใช้
3. **Constants**: รวม constants ที่ใช้ในทั้ง frontend และ backend

## 🚧 สถานะปัจจุบัน

- ✅ สร้างโครงสร้างเบื้องต้น
- ⏳ รอการเพิ่ม shared types และ utilities
- ⏳ รอการ integration กับ backend services

## 📞 ติดต่อและการสนับสนุน

สำหรับคำถามหรือข้อเสนอแนะเกี่ยวกับการใช้งานโฟลเดอร์นี้:
- สร้าง issue ใน GitHub repository
- ติดต่อทีมพัฒนาผ่านช่องทางภายในองค์กร
- อ่านเอกสารใน `DEV_README.md` สำหรับรายละเอียดเพิ่มเติม

---

**หมายเหตุ**: โฟลเดอร์นี้เป็นจุดเริ่มต้นสำหรับการจัดการไฟล์ใช้งานร่วมกัน และจะมีการพัฒนาเพิ่มเติมตามความต้องการของโปรเจกต์