import { useState, useEffect } from "react";
import { Navigation, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: {
    lat: number;
    lng: number;
    name: string;
    nameLocal?: string;
  };
  currentLanguage: "th" | "en";
}

const MapModal = ({ isOpen, onClose, location, currentLanguage }: MapModalProps) => {
  const content = {
    th: {
      mapTitle: "ตำแหน่งบนแผนที่",
      navigateExternal: "นำทางด้วยแอปแผนที่ภายนอก",
      viewOnGoogleMaps: "ดูใน Google Maps",
      close: "ปิด"
    },
    en: {
      mapTitle: "Location on Map",
      navigateExternal: "Navigate with External Map App",
      viewOnGoogleMaps: "View on Google Maps",
      close: "Close"
    },
  };

  const t = content[currentLanguage];

  const handleExternalNavigation = () => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    window.open(googleMapsUrl, "_blank");
  };

  const handleViewOnGoogleMaps = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
    window.open(googleMapsUrl, "_blank");
  };

  const displayName = currentLanguage === "th" && location.nameLocal 
    ? location.nameLocal 
    : location.name;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <span>{t.mapTitle}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 relative p-6 pt-0">
          {/* Map placeholder with basic info */}
          <div className="h-96 w-full rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Navigation className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{displayName}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={handleViewOnGoogleMaps}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t.viewOnGoogleMaps}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Interactive map will load here
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-4 gap-3">
            <Button
              onClick={handleExternalNavigation}
              size="lg"
              className="flex items-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              {t.navigateExternal}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapModal;