// Third individually cross-checked TAT release from source rows 124–173.
// Source CSV SHA-256: 2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366
// See TAT_OPEN_DATA_RELEASE_BATCH_003.md for independent government references.
const SOURCE = 'https://datacatalog.tat.or.th/dataset/tourist-attraction';

const PLACES = [
  {
    id: 'tat-20250925134625001',
    name: 'Homestay Ban Tha Khan Thong, community-based tourism',
    nameLocal: 'โฮมสเตย์บ้านท่าขันทองการท่องเที่ยวโดยชุมชน',
    province: 'เชียงราย', category: 'Nature',
    description: 'เป็นชุมชนที่อพยพมาจากภาคอีสานมาอยู่ทางภาคเหนือ เมื่อราว 50 ปีก่อน มาตั้งรกรากที่ ริมฝั่งโขง อำเภอเชียงแสน จังหวัดเชียงราย มีพื้นที่ของหมู่บ้านยาวเลียบไปตามแนวของแม่น้ำโขง เป็นหมู่บ้านต้นแบบวัฒนธรรมที่ยังคงรักษาวัฒนธรรมประเพณีพื้นบ้านแบบดั้งเดิม โดยมีการผสมผสานทางวัฒนธรรมประเพณี กลายเป็นวิถีอีสานล้านนา ใช้วิถีชีวิต วัฒนธรรม ประเพณี ภูมิปัญญาและทรัพยากรธรรมชาติในท้องถิ่น คือ ทำการเกษตร ปลูกข้าว ข้าวโพด ยางพาราและประมงแม่น้ำโขง',
    descriptionEn: null, lat: 20.1964598, lng: 100.2372647,
  },
  {
    id: 'tat-20250922135409001', name: 'Chiang Mai House of Photography',
    nameLocal: 'หอภาพถ่ายล้านนา', province: 'เชียงใหม่', category: 'Culture',
    description: 'หอภาพถ่ายล้านนา หรือ Chiang Mai House of Photography คือศูนย์กลางด้านการถ่ายภาพในเชียงใหม่ ทำหน้าที่เป็นแหล่งอนุรักษ์ เก็บรวมรวมข้อมูลภาพถ่ายโบราณและจิตรกรรมฝาผนังในล้านนา เพื่อเผยแพร่องค์ความรู้ผ่านเว็บไซต์ จัดแสดงนิทรรศการภาพถ่ายร่วมสมัย ผลงานนักศึกษา และผลงานศิลปิน รวมถึงเป็นสถานที่จัดอบรม เสวนา สัมมนา บรรยาย กิจกรรมต่างๆ เกี่ยวกับการถ่ายภาพ',
    descriptionEn: null, lat: 18.7898668, lng: 98.9885823,
  },
  {
    id: 'tat-20250916103852001', name: 'Phu Wiang Dinosaur Museum',
    nameLocal: 'ศูนย์ศึกษาวิจัยและพิพิธภัณฑ์ไดโนเสาร์', province: 'ขอนแก่น', category: 'Culture',
    description: 'ศูนย์ศึกษาวิจัยและพิพิธภัณฑ์ไดโนเสาร์ หรือที่หลายคนรู้จักในชื่อ "พิพิธภัณฑ์ไดโนเสาร์ภูเวียง" ตั้งอยู่ที่อำเภอเวียงเก่า จังหวัดขอนแก่น เป็นแหล่งเรียนรู้ที่สำคัญระดับประเทศ ซึ่งจัดแสดงข้อมูลทางธรณีวิทยาและบรรพชีวินวิทยา โดยเฉพาะเรื่องราวของไดโนเสาร์ที่เคยมีชีวิตอยู่ในพื้นที่ภาคตะวันออกเฉียงเหนือของประเทศไทย',
    descriptionEn: null, lat: 16.6777635, lng: 102.2661556,
  },
];

module.exports = PLACES.map(place => ({
  ...place, rating: 0, reviewCount: 0, imageUrl: null, tags: [],
  sourceName: 'Tourism Authority of Thailand — Open Data', sourceUrl: SOURCE,
  verifiedAt: null,
}));
