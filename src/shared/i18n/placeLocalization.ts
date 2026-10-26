export type PlaceLanguage = 'th' | 'en';

interface PlaceText {
  province: string;
  provinceEn?: string | null;
  description: string;
  descriptionEn?: string | null;
}

const hasThai = (text: string): boolean => /[\u0e00-\u0e7f]/.test(text);

export function localizedProvince(place: PlaceText, language: PlaceLanguage): string {
  if (language === 'th') return place.province;
  const translation = place.provinceEn?.trim();
  // New, unreviewed locations must never silently show a Thai province
  // in an English UI. Their precise province can be added via the API later.
  return translation || (hasThai(place.province) ? 'Thailand' : place.province);
}

export function localizedDescription(place: PlaceText, language: PlaceLanguage): string {
  if (language === 'th') return place.description;
  return place.descriptionEn?.trim() || 'English description is not available yet.';
}

const CATEGORY_TH: Record<string, string> = {
  Beach: 'ชายหาด', Culture: 'วัฒนธรรม', Nature: 'ธรรมชาติ',
  Food: 'อาหาร', Mountain: 'ภูเขา', Temple: 'วัด',
};

const TAG_TH: Record<string, string> = {
  Archaeology: 'โบราณคดี', Architecture: 'สถาปัตยกรรม', Art: 'ศิลปะ',
  Bay: 'อ่าว', Beach: 'ชายหาด', Birdwatching: 'ดูนก', Buddhism: 'พุทธศาสนา',
  Canal: 'คลอง', Cave: 'ถ้ำ', Climbing: 'ปีนเขา', Coast: 'ชายฝั่ง',
  Community: 'ชุมชน', Conservation: 'อนุรักษ์', Culture: 'วัฒนธรรม',
  Dinosaur: 'ไดโนเสาร์', Diving: 'ดำน้ำ', Flowers: 'ดอกไม้',
  Folklore: 'ตำนานพื้นบ้าน', Food: 'อาหาร', Forest: 'ป่า',
  'Forest Park': 'วนอุทยาน', Geology: 'ธรณีวิทยา', Hiking: 'เดินป่า',
  History: 'ประวัติศาสตร์', Island: 'เกาะ', 'Khmer Architecture': 'สถาปัตยกรรมขอม',
  'Khmer Art': 'ศิลปะขอม', Landmark: 'สถานที่สำคัญ', Lanna: 'ล้านนา',
  Limestone: 'หินปูน', Market: 'ตลาด', Mountain: 'ภูเขา',
  Museum: 'พิพิธภัณฑ์', 'National Park': 'อุทยานแห่งชาติ', Nature: 'ธรรมชาติ',
  Park: 'สวนสาธารณะ', Photography: 'ถ่ายภาพ', Railway: 'ทางรถไฟ',
  River: 'แม่น้ำ', 'Rock Art': 'ภาพเขียนบนหิน', 'Rock Formation': 'โขดหิน',
  Sculpture: 'ประติมากรรม', 'Sea Cave': 'ถ้ำทะเล', Snorkeling: 'ดำน้ำตื้น',
  Temple: 'วัด', Traditional: 'ดั้งเดิม', UNESCO: 'ยูเนสโก',
  Viewpoint: 'จุดชมวิว', Waterfall: 'น้ำตก', Waterfalls: 'น้ำตก',
  Wetland: 'พื้นที่ชุ่มน้ำ', Wildlife: 'สัตว์ป่า',
};

export function localizedCategory(category: string, language: PlaceLanguage): string {
  return language === 'th' ? CATEGORY_TH[category] || category : category;
}

export function localizedTag(tag: string, language: PlaceLanguage): string {
  return language === 'th' ? TAG_TH[tag] || tag : tag;
}
