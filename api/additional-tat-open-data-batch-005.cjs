// Chon Buri-only release: individual official-source review, not an automatic import.
// Source CSV SHA-256: 2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366
// Evidence: TAT_OPEN_DATA_RELEASE_BATCH_005.md
const SOURCE = 'https://datacatalog.tat.or.th/dataset/tourist-attraction';

const PLACES = [
  {
    id: 'tat-20211221230034734283', name: 'Grand Canyon Chonburi (KIRI)',
    nameLocal: 'แกรนด์แคนยอนคีรี', province: 'ชลบุรี', category: 'Nature',
    description: 'แกรนด์แคนยอนคีรีเป็นบ่อดินลูกรังเก่าในอำเภอเมืองชลบุรี มีบ่อน้ำและภูมิทัศน์เนินดินสีอ่อน',
    descriptionEn: null, lat: 13.3216428, lng: 100.9800556,
  },
  {
    id: 'tat-20160528165231008560', name: 'Space Inspirium',
    nameLocal: 'อุทยานรังสรรค์นวัตกรรมอวกาศ (สเปซ อินสไปเลียม)', province: 'ชลบุรี', category: 'Culture',
    description: 'สเปซ อินสไปเลียมเป็นแหล่งเรียนรู้ด้านอวกาศและภูมิสารสนเทศในอำเภอศรีราชา ดำเนินงานโดย GISTDA',
    descriptionEn: null, lat: 13.1026146, lng: 100.9304523,
  },
  {
    id: 'tat-20160528170226008563', name: 'Siri Charoenwat Forest Plantation',
    nameLocal: 'ป่าสิริเจริญวรรษ', province: 'ชลบุรี', category: 'Nature',
    description: 'โครงการป่าสิริเจริญวรรษอันเนื่องมาจากพระราชดำริเป็นพื้นที่อนุรักษ์และเรียนรู้ด้านป่าไม้ในอำเภอสัตหีบ จังหวัดชลบุรี',
    descriptionEn: null, lat: 12.7596807, lng: 100.9800186,
  },
];

module.exports = PLACES.map(place => ({
  ...place, rating: 0, reviewCount: 0, imageUrl: null, tags: [],
  sourceName: 'Tourism Authority of Thailand — Open Data', sourceUrl: SOURCE,
  verifiedAt: null,
}));
