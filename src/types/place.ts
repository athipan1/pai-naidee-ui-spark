// src/types/place.ts

export interface Place {
  id: string;                    // UUID primary key
  name: string;                  // ชื่อสถานที่ (อังกฤษ)
  name_local: string;           // ชื่อสถานที่ (ไทย)
  province: string;             // จังหวัด
  category: string;             // หมวดหมู่ OSM เดิม
  app_category: string;         // หมวดหมู่สำหรับแอป
  rating?: number;              // คะแนน (1-5)
  review_count?: number;        // จำนวนรีวิว
  /** @deprecated use `images` array instead */
  image_url?: string;           // URL รูปภาพหลัก (อาจจะไม่มี)
  images?: { image_url: string }[]; // Array of image objects from the related table
  description: string;          // คำอธิบาย
  tags: string[];              // Tags/keywords
  lat: number;                 // Latitude
  lng: number;                 // Longitude
  amenities?: string[];        // สิ่งอำนวยความสะดวก
  external_links?: {          // ลิงก์ภายนอก
    wikipedia?: string;
    official_website?: string;
  };
  coordinates?: {             // พิกัดในรูปแบบ object
    lat: number;
    lng: number;
  };
  details?: {                 // ข้อมูลรายละเอียดจาก Wikipedia
    extract?: string;
    thumbnail?: string;
    original_image?: string;
  };
  created_at: string;
  updated_at: string;
}