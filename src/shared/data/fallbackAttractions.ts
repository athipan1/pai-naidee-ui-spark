import type { AttractionDetail } from "@/shared/types/attraction";
import { getThailandPlaceImage } from "@/shared/data/thailandPlaceImages";

const fallbackAttractions: Record<string, AttractionDetail> = {
  "1": {
    id: "1",
    name: "Phi Phi Islands",
    nameLocal: "หมู่เกาะพีพี",
    province: "กระบี่",
    category: "Beach",
    rating: 4.8,
    reviewCount: 2547,
    images: [getThailandPlaceImage("Phi Phi Islands")],
    description:
      "น้ำทะเลใสและหน้าผาหินปูนที่โดดเด่น เป็นหนึ่งในแหล่งท่องเที่ยวทางทะเลที่เป็นที่รู้จักของจังหวัดกระบี่",
    tags: ["Beach", "Snorkeling", "Island", "Photography"],
    coordinates: { lat: 7.7367, lng: 98.7784 },
  },
  "2": {
    id: "2",
    name: "Wat Phra Kaew",
    nameLocal: "วัดพระแก้ว",
    province: "กรุงเทพฯ",
    category: "Culture",
    rating: 4.9,
    reviewCount: 5243,
    images: [getThailandPlaceImage("Wat Phra Kaew")],
    description:
      "วัดพระศรีรัตนศาสดารามภายในพระบรมมหาราชวัง เป็นที่ประดิษฐานพระแก้วมรกตและเป็นสถานที่สำคัญทางประวัติศาสตร์และวัฒนธรรมไทย",
    tags: ["Temple", "Culture", "Buddhism", "History"],
    coordinates: { lat: 13.7515, lng: 100.4925 },
  },
  "3": {
    id: "3",
    name: "Doi Inthanon",
    nameLocal: "ดอยอินทนนท์",
    province: "เชียงใหม่",
    category: "Nature",
    rating: 4.7,
    reviewCount: 1876,
    images: [getThailandPlaceImage("Doi Inthanon")],
    description:
      "ยอดเขาที่สูงที่สุดในประเทศไทย อยู่ในอุทยานแห่งชาติดอยอินทนนท์ จังหวัดเชียงใหม่ มีเส้นทางธรรมชาติ น้ำตก และอากาศเย็น",
    tags: ["Mountain", "Nature", "Hiking", "Waterfalls"],
    coordinates: { lat: 18.5888, lng: 98.4870 },
  },
  "4": {
    id: "4",
    name: "Floating Market",
    nameLocal: "ตลาดน้ำ",
    province: "ราชบุรี",
    category: "Food",
    rating: 4.5,
    reviewCount: 3156,
    images: [getThailandPlaceImage("Floating Market")],
    description:
      "ตลาดน้ำดำเนินสะดวก จังหวัดราชบุรี เป็นตลาดน้ำที่มีเรือจำหน่ายอาหาร ผลไม้ และสินค้าท้องถิ่นตามลำคลอง",
    tags: ["Food", "Culture", "Traditional", "Market"],
    coordinates: { lat: 13.5180, lng: 99.9594 },
  },
};

export function getFallbackAttractionDetail(
  id: string,
): AttractionDetail | undefined {
  const attraction = fallbackAttractions[id];
  if (!attraction) return undefined;

  return {
    ...attraction,
    images: [...attraction.images],
    tags: [...attraction.tags],
    coordinates: { ...attraction.coordinates },
  };
}

export function hasFallbackAttractionDetail(id: string): boolean {
  return id in fallbackAttractions;
}
