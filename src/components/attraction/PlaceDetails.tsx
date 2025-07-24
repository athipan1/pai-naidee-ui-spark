import { Star, Clock, MapPin, Phone, Globe, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PlaceDetailsProps {
  name: string;
  rating: number;
  reviewCount: number;
  description: string;
  openingHours: string;
  location: string;
  phone?: string;
  website?: string;
  activities: string[];
  highlights: string[];
}

export function PlaceDetails({
  name,
  rating,
  reviewCount,
  description,
  openingHours,
  location,
  phone,
  website,
  activities,
  highlights
}: PlaceDetailsProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />);
    }

    return stars;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground">{name}</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderStars(rating)}
          </div>
          <span className="text-lg font-semibold">{rating}</span>
          <span className="text-muted-foreground">({reviewCount.toLocaleString()} รีวิว)</span>
        </div>
      </div>

      {/* Highlights */}
      <div className="flex flex-wrap gap-2">
        {highlights.map((highlight) => (
          <Badge key={highlight} variant="secondary">
            {highlight}
          </Badge>
        ))}
      </div>

      {/* Description */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Camera className="h-5 w-5" />
            รายละเอียด
          </h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </CardContent>
      </Card>

      {/* Information Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Hours */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">เวลาเปิด-ปิด</p>
                <p className="text-sm text-muted-foreground">{openingHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">ที่อยู่</p>
                <p className="text-sm text-muted-foreground">{location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phone */}
        {phone && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">โทรศัพท์</p>
                  <p className="text-sm text-muted-foreground">{phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Website */}
        {website && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">เว็บไซต์</p>
                  <p className="text-sm text-muted-foreground truncate">{website}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Activities */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">🎯 กิจกรรมที่ทำได้</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {activities.map((activity) => (
              <div key={activity} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {activity}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}