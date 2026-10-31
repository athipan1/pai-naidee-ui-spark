import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useNearbyAttractions } from '@/shared/hooks/useAttractionQueries';
import type { SearchResult } from '@/shared/types/search';

interface NearbyRealPlacesProps {
  placeId: string;
  category: string;
  coordinates?: { lat: number; lng: number } | null;
  currentLanguage: 'th' | 'en';
}

export default function NearbyRealPlaces({ placeId, category, coordinates, currentLanguage }: NearbyRealPlacesProps) {
  const validCoordinates = coordinates && Number.isFinite(coordinates.lat) && Number.isFinite(coordinates.lng) &&
    coordinates.lat !== 0 && coordinates.lng !== 0 ? coordinates : null;
  // The centre is the public place's coordinates, never the visitor's device location.
  const nearby = useNearbyAttractions(validCoordinates, 100);
  const places = (nearby.data?.attractions || [])
    .filter((place: SearchResult) => place.id !== placeId)
    .sort((a, b) => Number(b.category === category) - Number(a.category === category) ||
      (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
    .slice(0, 4);

  if (!validCoordinates) return null;

  return (
    <section className="mb-8 rounded-xl border border-border bg-card p-5 sm:p-6" data-testid="real-nearby-places">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        {currentLanguage === 'th' ? 'สถานที่ท่องเที่ยวใกล้เคียง' : 'Nearby destinations'}
      </h2>
      {nearby.isLoading ? <p role="status" className="text-muted-foreground">{currentLanguage === 'th' ? 'กำลังค้นหาสถานที่ใกล้เคียง...' : 'Finding nearby places...'}</p>
        : nearby.isError ? <p className="text-sm text-muted-foreground">{currentLanguage === 'th' ? 'ยังโหลดสถานที่ใกล้เคียงไม่ได้' : 'Nearby places are unavailable.'}</p>
          : places.length === 0 ? <p className="text-sm text-muted-foreground">{currentLanguage === 'th' ? 'ยังไม่มีสถานที่ใกล้เคียงในฐานข้อมูล' : 'No nearby destinations in the catalogue yet.'}</p>
            : <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {places.map(place => <li key={place.id}>
                <Link to={`/attraction/${encodeURIComponent(place.id)}`} className="flex h-full items-start justify-between gap-3 rounded-lg border border-border/70 p-3 hover:bg-muted/50 focus-visible:outline-primary">
                  <div className="min-w-0">
                    <p className="font-medium break-words">{currentLanguage === 'th' ? (place.nameLocal || place.name) : place.name}</p>
                    <p className="text-sm text-muted-foreground">{place.province}</p>
                  </div>
                  {Number.isFinite(place.distanceKm) && <span className="text-xs shrink-0 text-muted-foreground">{place.distanceKm!.toFixed(1)} km</span>}
                </Link>
              </li>)}
            </ul>}
      <p className="mt-3 text-xs text-muted-foreground">
        {currentLanguage === 'th' ? 'แนะนำจากสถานที่ที่มีข้อมูลจริงภายในรัศมี 100 กม. ระยะทางเป็นเส้นตรง' : 'From real catalogue places within 100 km. Straight-line distances.'}
      </p>
    </section>
  );
}
