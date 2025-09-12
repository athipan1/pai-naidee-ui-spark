import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Navigation, X } from 'lucide-react';
import L from 'leaflet';
import { useLanguage } from '@/shared/contexts/LanguageProvider';

// Fix for default icon issue with webpack/vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;


interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: {
    lat: number;
    lng: number;
    name: string;
    nameLocal?: string;
  };
}

const MapModal = ({ isOpen, onClose, location }: MapModalProps) => {
  const { language } = useLanguage();
  const content = {
    th: {
      mapTitle: "ตำแหน่งบนแผนที่",
      navigateExternal: "นำทางด้วย Google Maps",
      close: "ปิด"
    },
    en: {
      mapTitle: "Location on Map",
      navigateExternal: "Navigate with Google Maps",
      close: "Close"
    },
  };

  const t = content[language];
  const displayName = language === "th" && location.nameLocal
    ? location.nameLocal
    : location.name;

  const handleExternalNavigation = () => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 flex flex-col">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <span>{t.mapTitle}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 relative">
          <MapContainer center={[location.lat, location.lng]} zoom={15} scrollWheelZoom={true} className="w-full h-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[location.lat, location.lng]}>
              <Popup>
                {displayName}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        <div className="p-4 border-t">
             <Button
              onClick={handleExternalNavigation}
              size="lg"
              className="w-full flex items-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              {t.navigateExternal}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapModal;