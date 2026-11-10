import { Link } from "react-router-dom";
import OptimizedImage from "@/components/common/OptimizedImage";
import {
  localizedCategory,
  localizedProvince,
} from "@/shared/i18n/placeLocalization";
import {
  placeNavigationUrl,
  validPlaceCoordinates,
} from "@/shared/utils/placeDetail";
import type { NearbyMapPlace } from "@/shared/utils/nearbyPlaces";

export function NearbyPlaceSummary({
  place,
  currentLanguage,
  current = false,
}: {
  place: NearbyMapPlace;
  currentLanguage: "th" | "en";
  current?: boolean;
}) {
  const th = currentLanguage === "th";
  const name = th ? place.nameLocal || place.name : place.name;
  return (
    <div className="min-w-0 space-y-2 break-words">
      <OptimizedImage
        src={place.image}
        alt={name}
        width={240}
        height={160}
        loading="lazy"
        sizes="(min-width: 768px) 240px, 70vw"
        className="aspect-[3/2] w-full rounded-lg object-cover"
        unavailableLabel={th ? "รูปภาพไม่พร้อมใช้งาน" : "Image unavailable"}
      />
      {place.mediaCredits
        ?.filter((credit) => credit.url === place.image)
        .map((credit) => (
          <p key={credit.url} className="text-xs text-muted-foreground">
            © {credit.photographer} {credit.licenseName}
            {/^https?:\/\//i.test(credit.sourcePage) && (
              <a
                href={credit.sourcePage}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {" "}
                · {th ? "เครดิตภาพ" : "Photo credit"}
              </a>
            )}
          </p>
        ))}
      <p className="font-semibold text-foreground">
        {current && (
          <span className="text-primary">
            {th ? "สถานที่นี้ · " : "This place · "}
          </span>
        )}
        {name}
      </p>
      <p className="text-sm text-muted-foreground">
        {localizedProvince(place, currentLanguage)} ·{" "}
        {localizedCategory(place.category, currentLanguage)}
      </p>
      {Number.isFinite(place.distanceKm) && (
        <p className="text-sm text-muted-foreground">
          {th
            ? `ห่างประมาณ ${place.distanceKm!.toFixed(1)} กม. (เส้นตรง)`
            : `Approx. ${place.distanceKm!.toFixed(1)} km (straight line)`}
        </p>
      )}
      {!current && (
        <Link
          className="flex min-h-[44px] items-center font-medium text-primary underline underline-offset-4"
          to={`/attraction/${encodeURIComponent(place.id)}`}
          aria-label={`${th ? "ดูรายละเอียด" : "View details"}: ${name}`}
        >
          {th ? "ดูรายละเอียด" : "View details"}
        </Link>
      )}
      <a
        href={placeNavigationUrl({
          ...place,
          nameLocal: place.nameLocal || place.name,
        })}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[44px] items-center text-sm font-medium text-primary underline underline-offset-4"
      >
        {th ? "นำทาง" : "Directions"}
      </a>
      <p className="text-xs text-muted-foreground">
        {validPlaceCoordinates(place.navigation)
          ? th
            ? "ใช้จุดเข้าที่ตรวจสอบแล้ว"
            : "Uses a verified access point."
          : th
            ? "ยังไม่ยืนยันจุดทางเข้า กรุณาตรวจเส้นทางกับผู้ดูแลสถานที่"
            : "Access point is unverified; confirm with the venue."}
      </p>
    </div>
  );
}
