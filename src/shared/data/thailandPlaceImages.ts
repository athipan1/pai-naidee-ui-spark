export interface ThailandPlaceImage {
  url: string;
  sourcePage: string;
  photographer: string;
  provider: "Unsplash";
}

export const thailandPlaceImages = {
  phiPhiIslands: {
    url: "https://images.unsplash.com/photo-1587413511953-f189f6a01ef3?auto=format&fit=crop&w=1200&q=80",
    sourcePage: "https://unsplash.com/photos/white-boat-on-beach-shore-during-daytime-rB1CSCwu3ls",
    photographer: "Ranjith Alingal",
    provider: "Unsplash",
  },
  watPhraKaew: {
    url: "https://images.unsplash.com/photo-1578167635857-3c2713865774?auto=format&fit=crop&w=1200&q=80",
    sourcePage: "https://unsplash.com/photos/yaksha-guardians-wat-phra-kaew-bangkok-thailand-VtBvATAwMUA",
    photographer: "Worachat Sodsri",
    provider: "Unsplash",
  },
  doiInthanon: {
    url: "https://images.unsplash.com/photo-1544467187-784a3534a696?auto=format&fit=crop&w=1200&q=80",
    sourcePage: "https://unsplash.com/photos/a_P2nDysDt0",
    photographer: "Haydn Golden",
    provider: "Unsplash",
  },
  floatingMarket: {
    url: "https://images.unsplash.com/photo-1590118432058-f2744d6897db?auto=format&fit=crop&w=1200&q=80",
    sourcePage: "https://unsplash.com/photos/people-riding-on-boat-on-river-during-daytime-S4WDLqubwoc",
    photographer: "Marek Okon",
    provider: "Unsplash",
  },
  watArun: {
    url: "https://images.unsplash.com/photo-1768392810963-017c92313d79?auto=format&fit=crop&w=1200&q=80",
    sourcePage: "https://unsplash.com/photos/wat-arun-temple-on-the-chao-phraya-river-bangkok-7KSiPWt82us",
    photographer: "Martijn Vonk",
    provider: "Unsplash",
  },
  phuketBeach: {
    url: "https://unsplash.com/photos/guNIjIuUcgY/download?force=true&w=1600",
    sourcePage: "https://unsplash.com/photos/guNIjIuUcgY",
    photographer: "Denys Nevozhai",
    provider: "Unsplash",
  },
  khaoYai: {
    url: "https://unsplash.com/photos/Q9pRPbCt658/download?force=true&w=1600",
    sourcePage: "https://unsplash.com/photos/Q9pRPbCt658",
    photographer: "Hongbin",
    provider: "Unsplash",
  },
  streetFood: {
    url: "https://images.unsplash.com/photo-1750635409983-78ca6a8cf324?auto=format&fit=crop&w=1200&q=80",
    sourcePage: "https://unsplash.com/photos/nighttime-street-food-vendors-in-bangkok-k8dwH-poJ2c",
    photographer: "Kaden Taylor",
    provider: "Unsplash",
  },
} as const satisfies Record<string, ThailandPlaceImage>;

const normalizePlaceName = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, " ");

const aliases = new Map<string, ThailandPlaceImage>([
  ["phi phi islands", thailandPlaceImages.phiPhiIslands],
  ["หมู่เกาะพีพี", thailandPlaceImages.phiPhiIslands],
  ["wat phra kaew", thailandPlaceImages.watPhraKaew],
  ["วัดพระแก้ว", thailandPlaceImages.watPhraKaew],
  ["doi inthanon", thailandPlaceImages.doiInthanon],
  ["ดอยอินทนนท์", thailandPlaceImages.doiInthanon],
  ["floating market", thailandPlaceImages.floatingMarket],
  ["damnoen saduak floating market", thailandPlaceImages.floatingMarket],
  ["ตลาดน้ำ", thailandPlaceImages.floatingMarket],
  ["ตลาดน้ำดำเนินสะดวก", thailandPlaceImages.floatingMarket],
  ["wat arun", thailandPlaceImages.watArun],
  ["วัดอรุณ", thailandPlaceImages.watArun],
  ["phuket beach", thailandPlaceImages.phuketBeach],
  ["หาดภูเก็ต", thailandPlaceImages.phuketBeach],
  ["khao yai national park", thailandPlaceImages.khaoYai],
  ["อุทยานแห่งชาติเขาใหญ่", thailandPlaceImages.khaoYai],
  ["street food market", thailandPlaceImages.streetFood],
  ["ตลาดอาหารข้างถนน", thailandPlaceImages.streetFood],
  ["yaowarat", thailandPlaceImages.streetFood],
  ["เยาวราช", thailandPlaceImages.streetFood],
]);

export function getThailandPlaceImage(
  placeName: string,
  fallbackUrl?: string,
): string {
  return aliases.get(normalizePlaceName(placeName))?.url ?? fallbackUrl ?? "/placeholder-attraction.jpg";
}

export function getThailandPlaceImageMeta(
  placeName: string,
): ThailandPlaceImage | undefined {
  return aliases.get(normalizePlaceName(placeName));
}
