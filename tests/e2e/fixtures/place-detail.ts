import type { Page, BrowserContext } from "@playwright/test";
export const primary = "https://images.example.test/primary.jpg";
export const photos = [
  primary,
  "https://images.example.test/second.jpg",
  "https://images.example.test/third.jpg",
];
export const place = {
  id: "detail-design-fixture",
  name: "Forest Discovery Park",
  nameLocal: "อุทยานธรรมชาติและเส้นทางศึกษาป่า",
  province: "เชียงใหม่",
  provinceEn: "Chiang Mai",
  category: "Nature",
  rating: 0,
  reviewCount: 0,
  description:
    "พื้นที่ธรรมชาติสำหรับเดินชมทิวทัศน์และเรียนรู้ระบบนิเวศ อ่านข้อมูลการเข้าชมและตรวจสอบเส้นทางกับผู้ดูแลสถานที่ก่อนเดินทาง",
  descriptionEn:
    "Explore nature and discover the local landscape. Check visitor information and confirm access before travelling.",
  tags: ["Nature"],
  image: primary,
  images: photos,
  mediaCredits: photos.map((url) => ({
    url,
    photographer: "Fixture owner",
    licenseName: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    sourcePage: "https://example.test/photo",
  })),
  coordinates: { lat: 18.5, lng: 98.5 },
  source: { name: "Fixture source", url: "https://example.test/source" },
};
export const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#c8ddd1"/><path d="M0 800L400 180 750 800M450 800L850 100 1200 800" fill="#466d58"/><circle cx="180" cy="150" r="70" fill="#f4df9e"/></svg>';
export async function mock(page: Page | BrowserContext, sparse = false) {
  await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/, (route) =>
    route.fulfill({ contentType: "text/css", body: "" })
  );
  await page.route("https://images.example.test/**", (r) =>
    r.fulfill({ contentType: "image/svg+xml", body: svg })
  );
  await page.route("**/*.tile.openstreetmap.org/**", (r) =>
    r.fulfill({ contentType: "image/svg+xml", body: svg })
  );
  await page.route("**/api/places**", (r) => {
    const path = new URL(r.request().url()).pathname;
    if (path.endsWith("/facets"))
      return r.fulfill({
        json: { provinces: ["เชียงใหม่"], categories: ["Nature"] },
      });
    if (path.includes("google-preview"))
      throw Error("Unexpected Google request");
    if (path.endsWith("/nearby"))
      return r.fulfill({
        json: {
          attractions: [
            place,
            {
              ...place,
              id: "nearby-place",
              nameLocal: "สถานที่ใกล้เคียง",
              distanceKm: 1.2,
            },
          ],
          center: place.coordinates,
          radiusKm: 100,
        },
      });
    return r.fulfill({
      json: path.endsWith("/nearby-place")
        ? {
            ...place,
            id: "nearby-place",
            nameLocal: "ป่าใกล้เคียง",
            coordinates: { lat: 18.51, lng: 98.51 },
          }
        : path.endsWith("/" + place.id)
          ? sparse
            ? {
                ...place,
                coordinates: null,
                image: null,
                images: [],
                mediaCredits: [],
                description: "",
                descriptionEn: "",
                tags: [],
              }
            : place
          : { attractions: [place], total: 1, page: 1, limit: 50 },
    });
  });
}
