import React from 'react';
import { Bed, Users, Wifi, Car as CarIcon, Eye, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Room {
  id: string;
  name: string;
  price: number;
  currency: string;
  amenities: string[];
  maxGuests: number;
  image: string;
}

interface AccommodationSectionProps {
  rooms: Room[];
  currentLanguage: "th" | "en";
  onBookRoom: (roomId: string) => void;
}

const AccommodationSection = ({ rooms, currentLanguage, onBookRoom }: AccommodationSectionProps) => {
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <Wifi className="w-4 h-4" />;
    if (amenityLower.includes('view')) return <Eye className="w-4 h-4" />;
    if (amenityLower.includes('air') || amenityLower.includes('conditioning')) return <CarIcon className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  const content = {
    title: { th: "ที่พัก", en: "Accommodation" },
    book: { th: "จองห้องนี้", en: "Book This Room" },
    maxGuests: { th: "ผู้เข้าพักสูงสุด", en: "Max Guests" },
    amenities: { th: "สิ่งอำนวยความสะดวก", en: "Amenities" },
    perNight: { th: "ต่อคืน", en: "per night" },
    people: { th: "คน", en: "people" },
    noRooms: { th: "ไม่มีห้องพักในขณะนี้", en: "No rooms available at this time" }
  };

  if (!rooms || rooms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bed className="w-5 h-5" />
            {content.title[currentLanguage]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {content.noRooms[currentLanguage]}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bed className="w-5 h-5" />
          {content.title[currentLanguage]}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="flex flex-col md:flex-row gap-4 p-4 border border-border rounded-lg hover:shadow-md transition-shadow"
          >
            {/* Room Image */}
            <div className="w-full md:w-48 h-32 flex-shrink-0">
              <img
                src={room.image}
                alt={room.name}
                className="w-full h-full object-cover rounded-md"
              />
            </div>

            {/* Room Details */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-semibold">{room.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Users className="w-4 h-4" />
                  <span>
                    {content.maxGuests[currentLanguage]}: {room.maxGuests} {content.people[currentLanguage]}
                  </span>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {content.amenities[currentLanguage]}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {getAmenityIcon(amenity)}
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Price and Booking */}
            <div className="flex flex-col justify-between items-end text-right md:min-w-[140px]">
              <div className="mb-4">
                <div className="text-2xl font-bold text-primary">
                  {room.currency}{room.price.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {content.perNight[currentLanguage]}
                </div>
              </div>
              
              <Button 
                onClick={() => onBookRoom(room.id)}
                className="w-full md:w-auto min-w-[120px]"
              >
                <Bed className="w-4 h-4 mr-2" />
                {content.book[currentLanguage]}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AccommodationSection;