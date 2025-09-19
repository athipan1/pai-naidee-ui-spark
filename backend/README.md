# Backend - โฟลเดอร์สำหรับไฟล์ใช้งานร่วมกัน

## 📋 วัตถุประสงค์

โฟลเดอร์ `backend` นี้ถูกสร้างขึ้นเพื่อเก็บโค้ดและไฟล์ที่ใช้งานร่วมกันระหว่างแอปพลิเคชันทั้งฝั่ง frontend และ backend อื่น ๆ ในอนาคต โดยมุ่งเน้นการสร้างมาตรฐานการเชื่อมต่อข้อมูลและฟังก์ชันที่สอดคล้องกันทั้งระบบ

## 🎯 เป้าหมาย

- **จัดการไฟล์กลาง**: เก็บ utilities, types, และ configuration ที่ใช้ร่วมกัน
- **ลดการซ้ำซ้อน**: หลีกเลี่ยงการเขียนโค้ดที่ซ้ำกันในหลายส่วน
- **ความสอดคล้อง**: รักษาความสอดคล้องของ data types และ interfaces
- **การพัฒนาแบบร่วมกัน**: สนับสนุนการพัฒนาระหว่างทีม frontend และ backend
- **ความปลอดภัย**: รักษามาตรฐานการ validation และ sanitization
- **ประสิทธิภาพ**: ใช้ constants และ formatters ที่ optimize แล้ว

## 📁 โครงสร้างแบบสมบูรณ์

```
backend/
├── README.md              # เอกสารอธิบายการใช้งาน (ไฟล์นี้)
├── index.ts               # Main entry point สำหรับ re-export ทั้งหมด
├── types/                 # TypeScript interfaces และ types ที่ใช้ร่วมกัน
│   ├── index.ts          # Re-export all types
│   ├── api.ts            # API request/response types
│   ├── user.ts           # User-related types
│   ├── attraction.ts     # Attraction-related types
│   └── community.ts      # Posts และ community types
├── utils/                 # Utility functions ที่ใช้ร่วมกัน
│   ├── index.ts          # Re-export all utilities
│   ├── validation.ts     # Data validation helpers
│   ├── constants.ts      # Application constants
│   └── formatters.ts     # Data formatting utilities
└── config/                # Configuration files
    ├── index.ts          # Re-export all configurations
    ├── api-endpoints.ts  # API endpoint definitions
    └── database.ts       # Database และ system configuration
```

## 🚀 การใช้งานเบื้องต้น

### 1. Shared Types

```typescript
// การใช้งาน API Response types
import type { APIResponse, PaginationParams } from '../../backend/types/api';

interface Attraction {
  id: string;
  name: string;
  rating: number;
}

const handleAttractionResponse = (response: APIResponse<Attraction[]>) => {
  if (response.success && response.data) {
    console.log('Attractions:', response.data);
  } else {
    console.error('Error:', response.error);
  }
};

// การใช้งาน User types
import type { User, UserRole } from '../../backend/types/user';

const createUser = (userData: RegisterData): Promise<APIResponse<User>> => {
  // Implementation
};
```

### 2. ตัวอย่างการใช้งาน Validation

```typescript
// การ validate ข้อมูลผู้ใช้
import { 
  validateEmail, 
  validateThaiPhoneNumber, 
  validateUsername,
  sanitizeText 
} from '../../backend/utils/validation';

const validateUserInput = (data: any) => {
  const errors: string[] = [];
  
  if (!validateEmail(data.email)) {
    errors.push('Email format is invalid');
  }
  
  if (!validateUsername(data.username)) {
    errors.push('Username must be 3-30 characters, alphanumeric, dots, underscores, dashes only');
  }
  
  if (data.phone && !validateThaiPhoneNumber(data.phone)) {
    errors.push('Thai phone number format is invalid');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: {
      ...data,
      bio: sanitizeText(data.bio || ''),
      username: sanitizeUsername(data.username)
    }
  };
};
```

### 3. การใช้งาน Formatters

```typescript
import { 
  formatCurrency, 
  formatDistance, 
  formatRelativeTime,
  formatFileSize 
} from '../../backend/utils/formatters';

// ตัวอย่างการใช้งาน formatters
const displayData = {
  price: formatCurrency(1500), // "฿1,500"
  distance: formatDistance(2.5, 'th'), // "2.5 กม."
  timeAgo: formatRelativeTime(new Date('2024-01-15'), 'th'), // "2 วันที่แล้ว"
  fileSize: formatFileSize(2048576, 'th') // "2.0 MB"
};
```

### 4. การใช้งาน Constants และ API Endpoints

```typescript
import { 
  API_ENDPOINTS, 
  ATTRACTION_CATEGORIES,
  apiEndpoints 
} from '../../backend/utils/constants';
import { createAPIEndpointBuilder } from '../../backend/config/api-endpoints';

// ใช้ constants สำหรับ categories
const categoryOptions = Object.values(ATTRACTION_CATEGORIES).map(cat => ({
  value: cat.value,
  label: cat.labelTh, // หรือ cat.labelEn
}));

// ใช้ API endpoints
const loginUser = async (credentials: LoginCredentials) => {
  const response = await fetch(apiEndpoints.authLogin, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return response.json();
};

// สร้าง endpoint builder สำหรับ custom base URL
const customEndpoints = createAPIEndpointBuilder('https://api.example.com');
const attractionsUrl = customEndpoints.attractions;
```

## 💡 แนวทางการใช้งาน

### สำหรับ Frontend (React/TypeScript)

#### วิธีที่ 1: Import เฉพาะที่ต้องการ
```typescript
// Import specific types และ utilities
import type { APIResponse, User, Attraction } from '../../backend/types';
import { validateEmail, formatCurrency } from '../../backend/utils';
import { apiEndpoints } from '../../backend/config';

// ใช้งาน shared types
const handleApiResponse = (response: APIResponse<Attraction[]>) => {
  if (response.success && response.data) {
    // Process attraction data
    const formattedAttractions = response.data.map(attraction => ({
      ...attraction,
      formattedRating: `${attraction.rating}/5.0`
    }));
  }
};

// ใช้ validation utilities
const handleEmailInput = (email: string) => {
  if (validateEmail(email)) {
    // Valid email - proceed with API call
    return fetch(apiEndpoints.authLogin, { /* ... */ });
  }
};
```

#### วิธีที่ 2: Import ทั้งหมดในครั้งเดียว
```typescript
// Import ทั้งหมดจาก backend
import * as Backend from '../../backend';

const MyComponent = () => {
  const [user, setUser] = useState<Backend.User | null>(null);
  
  const handleLogin = async (credentials: Backend.LoginCredentials) => {
    const isValidEmail = Backend.validateEmail(credentials.identifier);
    if (!isValidEmail) return;
    
    const response = await fetch(Backend.apiEndpoints.authLogin, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    const result: Backend.APIResponse<Backend.AuthResult> = await response.json();
    if (result.success && result.data) {
      setUser(result.data.user);
    }
  };
  
  return (
    <div>
      {user && (
        <div>
          <h1>Welcome, {user.displayName || user.username}</h1>
          <p>Role: {Backend.USER_ROLES[user.role.toUpperCase()].labelTh}</p>
        </div>
      )}
    </div>
  );
};
```

### สำหรับ Backend Services (Node.js/Express)

```typescript
// Import shared types และ utilities สำหรับ backend services
import type { 
  APIResponse, 
  User, 
  CreatePostData,
  PaginationParams 
} from './backend/types';
import { 
  validateEmail, 
  sanitizeText,
  API_ENDPOINTS,
  ERROR_CODES 
} from './backend/utils';

// ใช้งาน shared interfaces ใน API handlers
app.post('/api/auth/register', async (req: Request<{}, APIResponse<User>, RegisterData>, res: Response) => {
  const { email, username, password, displayName } = req.body;
  
  // ใช้ shared validation
  if (!validateEmail(email)) {
    const errorResponse: APIResponse<never> = {
      success: false,
      error: 'Invalid email format',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string
      }
    };
    return res.status(400).json(errorResponse);
  }
  
  // Sanitize input using shared utilities
  const sanitizedDisplayName = sanitizeText(displayName || '');
  
  try {
    const newUser: User = await createUser({
      email,
      username,
      password,
      displayName: sanitizedDisplayName
    });
    
    const successResponse: APIResponse<User> = {
      success: true,
      data: newUser,
      message: 'User created successfully',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string
      }
    };
    
    res.status(201).json(successResponse);
  } catch (error) {
    const errorResponse: APIResponse<never> = {
      success: false,
      error: 'Failed to create user',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string
      }
    };
    res.status(500).json(errorResponse);
  }
});
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

โฟลเดอร์นี้ถูกออกแบบให้ทำงานร่วมกับโค้ด Frontend ที่มีอยู่ใน `src/shared/` โดยสามารถ:

### 1. Migration จาก Frontend Shared Types
```typescript
// เดิม: src/shared/types/attraction.ts
interface AttractionDetail { /* ... */ }

// ใหม่: backend/types/attraction.ts (มี types ที่ครอบคลุมมากขึ้น)
import type { Attraction, AttractionSummary } from '../../backend/types/attraction';

// สามารถใช้ร่วมกันได้โดยไม่ต้องเปลี่ยนโค้ดเก่า
```

### 2. ใช้ Constants ที่สอดคล้องกัน
```typescript
// เดิม: src/shared/utils/constants.ts
export const CATEGORY_TYPES = {
  BEACH: "beach",
  TEMPLE: "temple",
  // ...
};

// ใหม่: ใช้จาก backend/utils/constants.ts
import { ATTRACTION_CATEGORIES } from '../../backend/utils/constants';

// มี labels หลายภาษาและข้อมูลเพิ่มเติม
const categoryOptions = Object.values(ATTRACTION_CATEGORIES).map(cat => ({
  value: cat.value,
  labelTh: cat.labelTh,
  labelEn: cat.labelEn
}));
```

### 3. ใช้ API Endpoints ที่จัดการแล้ว
```typescript
// เดิม: src/config/api.ts มี hardcoded endpoints
export const API_ENDPOINTS = {
  ATTRACTIONS: '/attractions',
  // ...
};

// ใหม่: ใช้จาก backend ที่มี endpoints ครบถ้วน
import { apiEndpoints } from '../../backend/config';

// มี type safety และ methods สำหรับ dynamic URLs
const attractionUrl = apiEndpoints.attractionDetail('123');
const userFollowUrl = apiEndpoints.userFollow('user456');
```

### 4. ปรับปรุง Error Handling
```typescript
// ใช้ ErrorCodes ที่มาตรฐาน
import { ERROR_CODES } from '../../backend/utils/constants';

const handleApiError = (response: APIResponse<any>) => {
  if (!response.success) {
    switch (response.error) {
      case ERROR_CODES.VALIDATION_ERROR:
        // Handle validation error
        break;
      case ERROR_CODES.UNAUTHORIZED:
        // Redirect to login
        break;
      case ERROR_CODES.NOT_FOUND:
        // Show 404 message
        break;
      default:
        // Generic error message
    }
  }
};
```

## 🚧 สถานะปัจจุบัน

- ✅ **สร้างโครงสร้างเบื้องต้นเสร็จสิ้น**
- ✅ **Types สำหรับ API, User, Attraction, Community**
  - APIResponse, PaginationParams, ValidationError
  - User, UserRole, Permission, AuthTokens
  - Attraction, AttractionCategory, Coordinates
  - Post, Comment, Video, UserInteraction
- ✅ **Utilities สำหรับ Validation และ Formatting**
  - Email, phone, username validation
  - Currency, distance, time formatting
  - Text sanitization และ hashtag validation
- ✅ **Constants และ Configuration**
  - API endpoints with type safety
  - Application constants (categories, roles, limits)
  - Database และ system configuration types
- ✅ **Index files สำหรับ easy importing**
- ✅ **JSDoc documentation สำหรับทุก interface และ function**
- ✅ **Integration examples ใน README**
- ✅ **Build และ type checking ผ่าน**

## 📈 Performance และ Best Practices

### 1. Type Safety
- ใช้ TypeScript strict mode
- Generic types สำหรับ flexibility
- Enum สำหรับ constants ที่ type-safe

### 2. Tree Shaking Support
- Export เฉพาะสิ่งที่จำเป็น
- ใช้ named exports
- Index files สำหรับ re-export

### 3. Validation Performance
- Pre-compiled regex patterns
- Early return สำหรับ invalid inputs
- Efficient string operations

### 4. Memory Efficiency
- ใช้ `as const` สำหรับ object literals
- Immutable data structures
- Proper cleanup ใน validation functions

## 📞 ติดต่อและการสนับสนุน

สำหรับคำถามหรือข้อเสนอแนะเกี่ยวกับการใช้งานโฟลเดอร์นี้:
- สร้าง issue ใน GitHub repository
- ติดต่อทีมพัฒนาผ่านช่องทางภายในองค์กร
- อ่านเอกสารใน `DEV_README.md` สำหรับรายละเอียดเพิ่มเติม

## 🔄 Version History

### v1.0.0 (2024-12-19)
- ✅ สร้างโครงสร้างเบื้องต้นเสร็จสิ้น
- ✅ เพิ่ม comprehensive types สำหรับ API, User, Attraction, Community
- ✅ เพิ่ม validation และ formatting utilities
- ✅ เพิ่ม constants และ configuration management
- ✅ เพิ่ม TypeScript support พร้อม JSDoc documentation
- ✅ สร้าง index files สำหรับ easy importing
- ✅ ทดสอบ build และ type checking ผ่านเรียบร้อย
- ✅ เพิ่ม integration examples ใน README

## 🎯 การใช้งานจริง

### Quick Start สำหรับ Frontend Developers
```typescript
// 1. Import types ที่ต้องการ
import type { APIResponse, User, Attraction } from '../../backend/types';

// 2. Import utilities
import { validateEmail, formatCurrency, apiEndpoints } from '../../backend';

// 3. ใช้งานในคอมโปเนนต์
const MyComponent = () => {
  const [user, setUser] = useState<User | null>(null);
  
  const handleSubmit = (email: string) => {
    if (validateEmail(email)) {
      // Call API using standardized endpoints
      fetch(apiEndpoints.authLogin, { /* ... */ });
    }
  };
  
  return <div>{/* Your component */}</div>;
};
```

### Quick Start สำหรับ Backend Developers
```typescript
// 1. Import shared types
import type { APIResponse, CreatePostData, SystemConfig } from './backend/types';

// 2. Import utilities
import { validateEmail, sanitizeText, ERROR_CODES } from './backend/utils';

// 3. ใช้ในการสร้าง API endpoints
app.post('/api/posts', (req: Request<{}, APIResponse<Post>, CreatePostData>) => {
  // Implementation with type safety
});
```

---

**หมายเหตุ**: โฟลเดอร์นี้ได้รับการออกแบบและทดสอบแล้วเพื่อรองรับการใช้งานใน production environment พร้อมการจัดการ type safety, performance optimization, และ security best practices