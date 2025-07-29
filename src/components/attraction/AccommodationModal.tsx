import { useState, useEffect } from "react";
import { Star, MapPin, ExternalLink, X, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Accommodation {
  id: string;
  name: string;
  nameLocal?: string;
  rating: number;
  distance: number; // in km
  image: string;
  price: number;
  currency: string;
  amenities: string[];
  booking_url?: string;
}

interface AccommodationModalProps {
  isOpen: boolean;
  onClose: () => void;
  accommodations: Accommodation[];
  loading: boolean;
  error?: string | null;
  currentLanguage: "th" | "en";
  attractionName: string;
}

const AccommodationModal = ({
  isOpen,
  onClose,
  accommodations,
  loading,
  error,
  currentLanguage,
  attractionName,
}: AccommodationModalProps) => {
  const content = {
    th: {
      modalTitle: "🏨 ที่พักใกล้เคียง",
      near: "ใกล้",
      km: "กม.",
      from: "จาก",
      bookNow: "จองเลย",
      noAccommodations: "ไม่พบที่พักใกล้เคียง",
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูลที่พัก",
      loading: "กำลังค้นหาที่พัก...",
      close: "ปิด",
      baht: "บาท",
      perNight: "/คืน",
    },
    en: {
      modalTitle: "🏨 Nearby Accommodations",
      near: "near",
      km: "km",
      from: "from",
      bookNow: "Book Now",
      noAccommodations: "No accommodations found nearby",
      error: "Error loading accommodation data",
      loading: "Searching for accommodations...",
      close: "Close",
      baht: "THB",
      perNight: "/night",
    },
  };

  const t = content[currentLanguage];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star
          key="half"
          className="h-4 w-4 fill-yellow-400/50 text-yellow-400"
        />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />
      );
    }

    return stars;
  };

  const handleBookNow = (accommodation: Accommodation) => {
    const bookingUrl = accommodation.booking_url || 
      `https://www.booking.com/search?ss=${encodeURIComponent(accommodation.name)}`;
    window.open(bookingUrl, "_blank");
  };

  const getDisplayName = (accommodation: Accommodation) => {
    return currentLanguage === "th" && accommodation.nameLocal
      ? accommodation.nameLocal
      : accommodation.name;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hotel className="h-5 w-5" />
            {t.modalTitle} {t.near} {attractionName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">{t.loading}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-red-500 mb-4">{t.error}</p>
                <Button variant="outline" onClick={onClose}>
                  {t.close}
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && accommodations.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Hotel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t.noAccommodations}</p>
              </div>
            </div>
          )}

          {!loading && !error && accommodations.length > 0 && (
            <div className="space-y-4">
              {accommodations.map((accommodation) => (
                <Card key={accommodation.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Image */}
                      <div className="sm:w-48 h-48 sm:h-32 relative overflow-hidden">
                        <img
                          src={accommodation.image}
                          alt={getDisplayName(accommodation)}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1">
                            {/* Hotel Name */}
                            <h3 className="font-semibold text-lg mb-2">
                              {getDisplayName(accommodation)}
                            </h3>

                            {/* Rating and Distance */}
                            <div className="flex items-center gap-4 mb-3">
                              <div className="flex items-center gap-1">
                                {renderStars(accommodation.rating)}
                                <span className="text-sm font-medium ml-1">
                                  {accommodation.rating}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>
                                  {accommodation.distance} {t.km} {t.from} {attractionName}
                                </span>
                              </div>
                            </div>

                            {/* Amenities */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              {accommodation.amenities.slice(0, 3).map((amenity) => (
                                <Badge key={amenity} variant="secondary" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                              {accommodation.amenities.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{accommodation.amenities.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Price and Book Button */}
                          <div className="sm:text-right">
                            <div className="mb-3">
                              <div className="text-xl font-bold text-primary">
                                {accommodation.price.toLocaleString()} {t.baht}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {t.perNight}
                              </div>
                            </div>
                            <Button
                              onClick={() => handleBookNow(accommodation)}
                              className="w-full sm:w-auto flex items-center gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              {t.bookNow}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccommodationModal;