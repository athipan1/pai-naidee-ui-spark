// Chon Buri second small release; individually cross-checked official source.
// TAT CSV SHA-256: 2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366
// Evidence: TAT_OPEN_DATA_RELEASE_BATCH_006.md
const SOURCE = 'https://datacatalog.tat.or.th/dataset/tourist-attraction';

const PLACES = [
  {
    id: 'tat-2016010510155820163', name: 'Takiantia Cultural Village',
    nameLocal: 'ชุมชนตะเคียนเตี้ย', province: 'ชลบุรี', category: 'Culture',
    description: 'ชุมชนตะเคียนเตี้ย อำเภอบางละมุง เป็นชุมชนท่องเที่ยวที่มีวิถีชีวิตและกิจกรรมเรียนรู้เกี่ยวกับสวนมะพร้าว',
    descriptionEn: null, lat: 13.0187322, lng: 100.9326826,
  },
  {
    id: 'tat-20200908183352469711', name: 'Bang Saray Old Town',
    nameLocal: 'ชุมชนเก่าชายทะเล (หมู่ 4 บ้านตลาดบางเสร่)', province: 'ชลบุรี', category: 'Culture',
    description: 'ชุมชนบ้านตลาดบางเสร่เป็นย่านชุมชนเก่าริมทะเลในอำเภอสัตหีบ มีประวัติการทำประมงและบ้านเรือนริมฝั่ง',
    descriptionEn: null, lat: 12.7631974, lng: 100.8896373,
  },
  {
    id: 'tat-201005182246293275', name: 'Koh Sichang',
    nameLocal: 'เกาะสีชัง', province: 'ชลบุรี', category: 'Nature',
    description: 'เกาะสีชังเป็นเกาะในอ่าวไทย อำเภอเกาะสีชัง จังหวัดชลบุรี มีแหล่งท่องเที่ยวทางธรรมชาติและประวัติศาสตร์',
    descriptionEn: null, lat: 13.161954907759235, lng: 100.8105880598108,
  },
];

module.exports = PLACES.map(place => ({
  ...place, rating: 0, reviewCount: 0, imageUrl: null, tags: [],
  sourceName: 'Tourism Authority of Thailand — Open Data', sourceUrl: SOURCE,
  verifiedAt: null,
}));
