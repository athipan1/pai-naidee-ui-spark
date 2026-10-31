// Two sourced landmarks fill the remaining province gaps. Pins represent the
// attraction grounds, not guaranteed gates or navigation-safe entrances.
const DESTINATIONS = [
  {
    slug: 'wat-tha-luang-phichit', name: 'Wat Tha Luang',
    nameLocal: 'วัดท่าหลวง', province: 'พิจิตร', category: 'Culture',
    description: 'วัดสำคัญในตัวเมืองพิจิตรริมแม่น้ำน่าน ประดิษฐานหลวงพ่อเพชร หมุดระบุพื้นที่วัดโดยประมาณ',
    tags: ['Temple', 'Buddhism', 'History'], lat: 16.441, lng: 100.35161,
    sourceName: 'Tourism Authority of Thailand: Wat Tha Luang',
    sourceUrl: 'https://thai.tourismthailand.org/Attraction/วัดท่าหลวง',
  },
  {
    slug: 'bang-rachan-heroes-monument', name: 'Bang Rachan Heroes Monument',
    nameLocal: 'อนุสาวรีย์วีรชนค่ายบางระจัน', province: 'สิงห์บุรี', category: 'Culture',
    description: 'อนุสรณ์สถานรำลึกวีรชนบางระจันในจังหวัดสิงห์บุรี หมุดเป็นตำแหน่งบริเวณอนุสรณ์โดยประมาณ ไม่ใช่ทางเข้า',
    tags: ['Monument', 'History'], lat: 14.9, lng: 100.31667,
    sourceName: 'National Statistical Office: Sing Buri tourism map',
    sourceUrl: 'https://www.nso.go.th/nsoweb/storage/file_or_link/2025/20251001141002_61901.pdf',
  },
];

module.exports = DESTINATIONS.map(({ slug, ...destination }) => ({
  id: `curated-${slug}`, ...destination, rating: 0, reviewCount: 0, imageUrl: null,
}));
