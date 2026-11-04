// Second source-cross-checked TAT release; original CSV SHA-256:
// 2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366
// Five intentionally approved IDs from the stage-002 manifest (source rows 79-123).
// See TAT_OPEN_DATA_RELEASE_BATCH_002.md for independent official references.
const SOURCE = 'https://datacatalog.tat.or.th/dataset/tourist-attraction';

const PLACES = [
  {
    id: 'tat-20251225110647001',
    // Corrects a transcription typo in TAT's "THE CONSTITUIONAL COURT MUSEUM".
    name: 'Constitutional Court Museum', nameLocal: 'พิพิธภัณฑ์ศาลรัฐธรรมนูญ',
    province: 'กรุงเทพฯ', category: 'Culture',
    description: 'ตั้งอยู่ที่ อาคารบ้านเจ้าพระยารัตนาธิเบศร์ ถนนจักรเพชร กรุงเทพฯ (ใกล้ MRT สามยอด) เป็นแหล่งเรียนรู้เกี่ยวกับรัฐธรรมนูญและการเมืองการปกครองไทย จัดแสดงประวัติศาสตร์และภารกิจของศาลฯ ในอาคารโบราณสวยงาม',
    descriptionEn: null, lat: 13.7420208, lng: 100.5008664,
  },
  {
    id: 'tat-20251224114028001', name: 'วิสาหกิจชุมชนบ้านหน้าเขา-ในวัง',
    nameLocal: 'วิสาหกิจชุมชนบ้านหน้าเขา-ในวัง', province: 'ตรัง', category: 'Culture',
    description: 'เป็นแหล่งท่องเที่ยวเชิงอนุรักษ์ที่มีเสน่ห์ด้วยสภาพภูมิประเทศเป็นที่ราบเชิงเขาซึ่งอุดมสมบูรณ์ไปด้วยทรัพยากรธรรมชาติเกือบ 100% โดยมีจุดเด่นที่กิจกรรมผจญภัยและการสัมผัสธรรมชาติอย่างใกล้ชิด เช่น การล่องเรือชมหินงอกหินย้อยในถ้ำนาคราชและถ้ำวังพระยาพิชัยสงคราม รวมถึงมีจุดชมวิวทะเลหมอกที่สวยงามในยามเช้า นอกเหนือจากทรัพยากรทางธรรมชาติแล้ว ชุมชนนี้ยังมีวิถีชีวิตดั้งเดิมที่น่าสนใจ ทั้งเมนูอาหารพื้นถิ่นอย่างแกงหน่อกระวานปลาย่างและขนมหม้อแกงกะลา และผลิตภัณฑ์ OTOP เช่น ผ้ามัดย้อมและลูกชกลอยแก้ว ที่สะท้อนถึงความเข้มแข็งของวิสาหกิจชุมชนในการสร้างกิจกรรมท่องเที่ยวที่ยั่งยืนและเป็นมิตรกับสิ่งแวดล้อม',
    descriptionEn: null, lat: 8.00575743001172, lng: 99.74576681575446,
  },
  {
    id: 'tat-20251215120121001', name: 'เขตห้ามล่าสัตว์ป่าถ้ำผาท่าพล',
    nameLocal: 'เขตห้ามล่าสัตว์ป่าถ้ำผาท่าพล', province: 'พิษณุโลก', category: 'Nature',
    description: 'เขตห้ามล่าสัตว์ป่าถ้ำผาท่าพล มีพื้นที่ทั้งหมด 1,775 ไร่ ในบริเวณภูเขาหินปูนมีลักษณะแหว่งเว้าคล้ายเกือกม้าที่เกิดจากการกัดเซาะของน้ำฝนเป็นเวลาหลายล้านปี เป็นที่ตั้งของถ้ำสวยๆ มากมาย รวมถึงเป็นสถานที่ท่องเที่ยวเชิงประวัติศาสตร์ ได้แก่ ถ้ำเรือ ถ้ำลอด ถ้ำผาแดง ถ้ำค้างคาว ถ้ำเต่า ซากดึกดำบรรพ์ และ จุดชมอักษรญี่ปุ่น',
    descriptionEn: null, lat: 16.5088643, lng: 100.6602245,
  },
  {
    id: 'tat-20251213065714001', name: 'วัดเขาสิงโต',
    nameLocal: 'วัดเขาสิงโต', province: 'สระแก้ว', category: 'Culture',
    description: 'เขาสิงโตเป็นภูเขาลูกเตี้ย ๆ อยู่ติดกับบริเวณวัดเขาสิงโตด้านทิศเหนือสูงประมาณ 250 เมตร ด้านล่างมีถ้ำวังนาคา ด้านบนยอดเขามีรอยพระพุทธบาท พระครูประโชติ สีหบรรพต เจ้าอาวาสวัดเขาสิงโต ได้ร่วมกับคณะกรรมการฯ ญาติโยม กำนัน ผู้ใหญ่บ้านและนายกองค์การบริหารส่วนตำบลบ้านแก้ง สร้างเป็นแหล่งท่องเที่ยวขึ้น โดยทำบันไดทางขึ้นจนถึงยอดเขา และจัดทำสกายวอร์ค (sky walk) บนยอดเขาซึ่งเป็นแห่งแรกของภาคตะวันออก สามารถชมวิวได้ 360 องศา',
    // TAT's original English field incorrectly says "Prachinburi Province".
    // The actual temple is in Sa Kaeo; do not publish that contradictory copy.
    descriptionEn: null, lat: 13.9895613, lng: 102.0081452,
  },
  {
    id: 'tat-20251213063829001', name: 'พิพิธภัณฑ์การแพทย์แผนไทยอภัยภูเบศร',
    nameLocal: 'พิพิธภัณฑ์การแพทย์แผนไทยอภัยภูเบศร', province: 'ปราจีนบุรี', category: 'Culture',
    // Deliberately end at a complete source sentence: the staging adapter's
    // 1200-character preview cuts the long TAT paragraph in mid-sentence.
    description: 'ตึกเจ้าพระยาอภัยภูเบศร สร้างขึ้นในปี พ.ศ.2452 โดยท่านเจ้าพระยาอภัยภูเบศร (ชุ่ม อภัยวงศ์) ก่อสร้างตามแบบสถาปัตยกรรมยุคบาโรก (Baroque) ของยุโรป เพื่อใช้เป็นที่ประทับแรมของพระบาทสมเด็จพระจุลจอมเกล้าเจ้าอยู่หัว หากเสด็จมณฑลปราจีนบุรีแต่รัชกาลที่ 5 แต่ทรงสวรคตเสียก่อน จากนั้นตึกหลังนี้จึงใช้เป็นที่ประทับแรมของพระบาทสมเด็จพระมงกุฎเกล้าเจ้าอยู่หัว รวมทั้งพระบรมวงศานุวงศ์อีกหลายพระองค์ เมื่อครั้งเสด็จมณฑลปราจีนบุรี',
    descriptionEn: 'The Chao Phraya Abhaibhubejhr Building was constructed in 1909 by Chao Phraya Abhaibhubejhr (Chum Abhaiwongse) in the European Baroque architectural style. It was originally intended as a royal residence for King Chulalongkorn (Rama V).',
    lat: 14.0541674, lng: 101.394816,
  },
];

module.exports = PLACES.map(place => ({
  ...place, rating: 0, reviewCount: 0, imageUrl: null, tags: [],
  sourceName: 'Tourism Authority of Thailand — Open Data', sourceUrl: SOURCE,
  verifiedAt: null,
}));
