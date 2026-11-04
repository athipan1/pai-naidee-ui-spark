// Fourth individually cross-checked TAT release from source rows 174–217.
// Source CSV SHA-256: 2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366
// See TAT_OPEN_DATA_RELEASE_BATCH_004.md for independent public-sector references.
const SOURCE = 'https://datacatalog.tat.or.th/dataset/tourist-attraction';

const PLACES = [
  {
    id: 'tat-20250815163438001', name: 'Ban Nam Chieo Tourism Group',
    nameLocal: 'กลุ่มท่องเที่ยวบ้านน้ำเชี่ยว', province: 'ตราด', category: 'Culture',
    description: 'บ้านน้ำเชี่ยว แหล่งท่องเที่ยวจังหวัดตราด ท่องเที่ยวชุมชน โฮมสเตย์ และ ธรรมชาติที่สวยงาม',
    descriptionEn: null, lat: 12.1892542, lng: 102.4612939,
  },
  {
    id: 'tat-20250701101935001', name: 'ถ้ำภูผาเพชร',
    nameLocal: 'ถ้ำภูผาเพชร', province: 'สตูล', category: 'Nature',
    // Avoid the unsupported superlative in the original TAT description.
    description: 'ถ้ำภูผาเพชรเป็นถ้ำหินปูนขนาดใหญ่ในตำบลปาล์มพัฒนา อำเภอมะนัง จังหวัดสตูล ภายในมีโถงถ้ำและหินงอกหินย้อยหลากหลายรูปแบบ',
    descriptionEn: null, lat: 7.1246747, lng: 99.9981765,
  },
  {
    id: 'tat-20250620154151001', name: 'ชุมชนริมน้ำจันทบูร',
    nameLocal: 'ชุมชนริมน้ำจันทบูร', province: 'จันทบุรี', category: 'Culture',
    description: 'ชุมชนริมน้ำจันทบูร เป็นชุมชนเก่าแก่ที่ตั้งอยู่ในจังหวัดจันทบุรี มีความสำคัญทางประวัติศาสตร์และวัฒนธรรมของภาคตะวันออกของประเทศไทย ด้วยบรรยากาศแบบเมืองเก่าเลียบแม่น้ำจันทบุรี ที่ยังคงรักษาเอกลักษณ์ของวิถีชีวิตชาวบ้านอย่างสมบูรณ์ ทั้งในเรื่องของสถาปัตยกรรมโบราณ อาหารพื้นถิ่นและประเพณีวัฒนธรรมที่สืบทอดกันมาอย่างยาวนาน',
    descriptionEn: null, lat: 12.6127731, lng: 102.1136881,
  },
  {
    id: 'tat-20250620152816001', name: 'เมืองเก่าอุทัยธานี',
    nameLocal: 'เมืองเก่าอุทัยธานี', province: 'อุทัยธานี', category: 'Culture',
    description: 'เมืองเก่าอุทัยธานี เป็นย่านชุมชนเก่าแก่ริมฝั่งแม่น้ำสะแกกรัง ตั้งอยู่ในเขตเทศบาลเมืองอุทัยธานี จังหวัดอุทัยธานี มีประวัติศาสตร์ยาวนานและยังคงอนุรักษ์วิถีชีวิตดั้งเดิมไว้ได้อย่างน่าประทับใจ ชุมชนแห่งนี้เคยเป็นศูนย์กลางการค้าขายและการคมนาคมในอดีต',
    descriptionEn: null, lat: 15.4088251, lng: 99.8270594,
  },
];

module.exports = PLACES.map(place => ({
  ...place, rating: 0, reviewCount: 0, imageUrl: null, tags: [],
  sourceName: 'Tourism Authority of Thailand — Open Data', sourceUrl: SOURCE,
  verifiedAt: null,
}));
