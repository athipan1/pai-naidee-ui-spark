// First manually cross-checked release from TAT's official attraction.csv.
// Original CSV SHA-256:
// 2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366
// Review evidence and rejected candidates: TAT_OPEN_DATA_RELEASE_BATCH_001.md.
// Coordinates are TAT place points, not verified turn-by-turn navigation entrances.
const SOURCE = 'https://datacatalog.tat.or.th/dataset/tourist-attraction';
const PLACES = [
  {
    id: 'tat-20260209144621001', name: 'Satun Old Town',
    nameLocal: 'เมืองเก่าสตูล', province: 'สตูล', category: 'Culture',
    description: 'ย่านเมืองเก่าสตูลเป็นพื้นที่ที่มีความหลากหลายทางวัฒนธรรมของกลุ่มชาติพันธุ์ที่ตั้งถิ่นฐานอาศัยในพื้นที่เมืองสตูลมาแต่ครั้งอดีต เป็นแหล่งประวัติศาสตร์ที่มีอาคารชิโนโปรตุกีสผสมผสานสถาปัตยกรรมยุโรปอายุกว่า 100 ปี แสดงถึงความรุ่งเรืองในอดีต ผสมผสานวัฒนธรรมไทย จีน และมลายู มีถนนบุรีวานิช (ย่านเมืองเก่า) ที่ถือเป็นถนนสายแรกของเมืองที่ชี้ให้เห็นร่องรอยของความเจริญในอดีต',
    descriptionEn: null, lat: 6.613603691140582, lng: 100.06622314453125,
  },
  {
    id: 'tat-20260204141052001', name: 'Honghompaya Lanna',
    nameLocal: 'ศูนย์เรียนรู้โฮงฮอมผญ๋า ล้านนา', province: 'เชียงราย', category: 'Culture',
    description: 'ศูนย์เรียนรู้ภูมิปัญญาพื้นบ้านล้านนา ตั้งอยู่ภายในวัดพระธาตุดอยโอ่ง เปิดดำเนินการ เพื่ออนุรักษ์และต่อยอดองค์ความรู้ทางการแพทย์ แบบพื้นบ้านล้านนาที่ใช้สมุนไพรท้องถิ่นและวิธีการรักษาแบบดั้งเดิม เช่น การตอกเส้น ย่ำขาง การอบสมุนไพร การพอก-ประคบสมุนไพร การแช่เท้า และสปาพื้นบ้าน โดยมีพระเมธาวินทร์ แสนธิ เป็นผู้ฝึกสอนและถ่ายทอดวิชาจากรุ่นสู่รุ่น เป็นแหล่งท่องเที่ยววิถีชุมชน ภูมิปัญญาพื้นบ้านล้านนา อยู่ท่ามกลางธรรมชาติ บรรยากาศ ร่มรื่น เหมาะแก่การผ่อนคลายร่างกาย คลายความเมื่อยล้าโดยการนวดแบบพื้นบ้านโบราณ ภายในโฮงฮอมพญ๋าโฮงยาหมอเมืองล้านนาเชียงราย มีอาคารไม้ 4 หลังไว้รองรับนักท่องเที่ยว และกิจกรรมการรักษาแบบล้านนาโบราณลักษณะ รวมถึงมีการจัดแสดงสมุนไพรสำหรับใช้ในการรักษาแบบล้านนาโบราณ',
    descriptionEn: 'Honghompaya Lanna or the Lanna Folk Wisdom Learning Center, located within Wat Phra That Doi Ong, was established to preserve and advance traditional Lanna medical knowledge. This includes the use of local herbs and traditional healing methods such as tendon tapping, foot stamping, herbal steaming, herbal poultices and compresses, foot soaking, and folk spa treatments. The center is led by Phra Methawin Santhi, who trains and passes down these skills from generation to generation.',
    lat: 20.0344254, lng: 99.85596450000001,
  },
  {
    id: 'tat-20260203143512001', name: 'Khao Phanom Bencha National Park',
    nameLocal: 'อุทยานแห่งชาติเขาพนมเบญจา', province: 'กระบี่', category: 'Nature',
    description: 'อุทยานแห่งชาติเขาพนมเบญจา เป็นอุทยานแห่งชาติทางบกเพียงแห่งเดียวของจังหวัดที่เต็มไปด้วยความอุดมสมบูรณ์ของธรรมชาติ ครอบคลุมพื้นที่บางส่วนของอำเภอเมือง อำเภอเขาพนม และอำเภออ่าวลึก ภูมิประเทศส่วนใหญ่เป็นเทือกเขาหินปูนสูงชันสลับซับซ้อน มียอดเขาพนมเบญจาเป็นจุดสูงสุดของอุทยาน และเป็นแหล่งต้นน้ำสำคัญของลำธารหลายสายที่หล่อเลี้ยงพื้นที่ชุมชนโดยรอบ ป่าในพื้นที่อุทยานแห่งนี้เป็นป่าดิบชื้นเขตร้อนที่ยังคงความสมบูรณ์ มีพืชพรรณหลากหลาย เช่น ไม้ยาง ตะเคียน เต็ง ราชพฤกษ์ รวมถึงไม้พื้นล่างประเภทหวายและไผ่ ที่ช่วยสร้างระบบนิเวศอันซับซ้อนและหลากหลาย สถานที่ท่องเที่ยวที่โดดเด่นภายในอุทยาน ได้แก่ น้ำตกห้วยโต้ น้ำตกขนาดใหญ่ที่ไหลลดหลั่นลงมาเป็นชั้น ๆ ถึง 11 ชั้น สำหรับผู้ที่ชื่นชอบการผจญภัย อุทยานมีเส้นทางเดินป่าสู่ยอดเขาพนมเบญจาที่เปิดโอกาสให้ได้สัมผัสหมอกปกคลุมยอดเขาและชมทิวทัศน์ของจังหวัดกระบี่ในมุมกว้าง',
    descriptionEn: 'Khao Phanom Bencha National Park is the only terrestrial national park in the province, renowned for its rich natural abundance. It covers parts of Mueang, Khao Phanom, and Ao Luek districts. The landscape is dominated by steep and complex limestone mountain ranges, with Khao Phanom Bencha Peak as the highest point of the park. Notable attractions include Huai To Waterfall.',
    lat: 8.240163599999999, lng: 98.91414739999999,
  },
  {
    id: 'tat-20260203120214001', name: 'Nong Pla Lai Community',
    nameLocal: 'ชุมชนหนองปลาไหล', province: 'ชลบุรี', category: 'Culture',
    description: 'ชุมชนที่ยังคงรักษาวิถีชีวิตดั้งเดิมแบบเกษตรกรไว้อย่างงดงามและทรงคุณค่า เป็นชุมชนที่ผสานความเรียบง่ายของชนบทกลางเมืองเข้ากับการจัดกิจกรรมท่องเที่ยวเชิงเกษตรและวัฒนธรรมได้อย่างลงตัว ชุมชนแห่งนี้มีต้นทุนทางวัฒนธรรมและธรรมชาติที่หลากหลาย โดยเฉพาะในเรื่องของนา ที่ไม่ได้เป็นเพียงพื้นที่เพาะปลูก แต่เป็นหัวใจของวิถีชีวิต ทั้งในด้านอาหาร ประเพณี และความสัมพันธ์ระหว่างคนในชุมชน หนองปลาไหลจึงกลายเป็นพื้นที่ที่นักท่องเที่ยวสามารถเรียนรู้และสัมผัสกับชีวิตแห่งผืนนาได้อย่างแท้จริง หนึ่งในกิจกรรมที่สร้างชื่อเสียงให้กับชุมชนคือกิจกรรมพัทยาก็มีนา ที่เปิดให้นักท่องเที่ยวได้ลงมือดำนาข้าวในช่วงเดือนสิงหาคม (วันแม่) และร่วมเกี่ยวข้าวในช่วงธันวาคม (วันพ่อ) โดยมีผู้รู้ในชุมชนเป็นผู้นำกิจกรรม พร้อมบรรยายความรู้ในแบบที่เข้าใจง่ายและอบอุ่นใจ การดำนาไม่ได้เป็นแค่กิจกรรมสนุก ๆ แต่ยังเป็นการสื่อถึงคุณค่าของข้าว และความเหน็ดเหนื่อยของชาวนาอย่างลึกซึ้ง',
    descriptionEn: 'Nong Pla Lai Community preserves a traditional farming lifestyle alongside community-based agricultural and cultural tourism. The community offers rice-growing activities under its Pattaya Rice Field Experience, where visitors may learn about planting and harvesting rice with local guides.',
    lat: 12.9791195, lng: 100.9601339,
  },
  {
    id: 'tat-20260126145509001', name: 'Ban Pae On Tai',
    nameLocal: 'ชุมชนบ้านออนใต้', province: 'เชียงใหม่', category: 'Culture',
    description: 'ชุมชนเล็ก ๆ พื้นที่ที่มีความอุดมสมบูรณ์ทางธรรมชาติ โอบล้อมไปด้วยภูเขา แม่น้ำลำธาร และทุ่งนาเขียวขจีตลอดทั้งปี มีแม่น้ำออนไหลผ่านกลางหมู่บ้าน ทำให้บ้านออนใต้มีทั้งแหล่งน้ำและระบบนิเวศที่หลากหลาย มีการส่งเสริมการเกษตร วิถีชีวิตเรียบง่าย และมีเสน่ห์ในแบบชนบทล้านนา ชุมชนบ้านออนใต้เป็นชุมชนที่มีความเข้มแข็งทางด้านวัฒนธรรมและภูมิปัญญาท้องถิ่น ผสมผสานกับการพัฒนาการท่องเที่ยวโดยชุมชนอย่างยั่งยืน ที่นี่นักท่องเที่ยวจะได้สัมผัสกับวิถีชีวิตของชาวบ้าน ทั้งด้านวัฒนธรรม อาหาร การเกษตร และการดำรงชีวิตในแบบพึ่งพาธรรมชาติ',
    descriptionEn: 'A small community rich in natural resources, surrounded by mountains, rivers, and lush green rice fields all year round. The On River flows through the village, providing abundant water sources and diverse ecosystems. The community promotes agriculture, simple living, and the charming rural lifestyle of Northern Thai people.',
    lat: 18.7376401, lng: 99.23324,
  },
];

module.exports = PLACES.map(place => ({
  ...place, rating: 0, reviewCount: 0, imageUrl: null, tags: [],
  sourceName: 'Tourism Authority of Thailand — Open Data', sourceUrl: SOURCE,
  verifiedAt: null,
}));
