import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Star, Navigation, Plus, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface AttractionData {
  id: string;
  name: string;
  images: string[];
  rating: number;
  reviewCount: number;
  description: string;
  openingHours: string;
  location: string;
  activities: string[];
  highlights: string[];
  latitude: number;
  longitude: number;
}

// Mock data
const mockAttractionData: Record<string, AttractionData> = {
  "1": {
    id: "1",
    name: "หมู่เกาะพีพี",
    images: [
      "photo-1500375592092-40eb2168fd21",
      "photo-1482938289607-e9573fc25ebb",
    ],
    rating: 4.8,
    reviewCount: 2450,
    description:
      "หมู่เกาะพีพีเป็นหมู่เกาะที่มีความงามตามธรรมชาติ ตั้งอยู่ในจังหวัดกระบี่ มีน้ำทะเลใสสีเขียวมรกต หาดทรายขาวสะอาด และภูเขาหินปูนที่สวยงาม",
    openingHours: "เปิดตลอด 24 ชั่วโมง",
    location: "อำเภอเมือง จังหวัดกระบี่ 81000",
    activities: [
      "ดำน้ำดูปะการัง",
      "สนอร์คเกลิ้ง",
      "นั่งเรือชมวิว",
      "อาบแดดชายหาด",
    ],
    highlights: ["มรดกโลก", "ธรรมชาติ", "ทะเล", "ดำน้ำ"],
    latitude: 7.7407,
    longitude: 98.7784,
  },
};

interface AttractionDetailProps {
  _currentLanguage?: "th" | "en";
  onBack?: () => void;
}

function AttractionDetailNew({
  _currentLanguage = "th",
  onBack,
}: AttractionDetailProps) {
  const { id } = useParams<{ id: string }>();
  const [attraction, setAttraction] = useState<AttractionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const loadAttraction = async () => {
      setIsLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (id && mockAttractionData[id]) {
        setAttraction(mockAttractionData[id]);
      } else {
        setAttraction(null);
      }

      setIsLoading(false);
    };

    loadAttraction();
  }, [id]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleNavigate = () => {
    if (attraction) {
      // Display location information instead of opening Google Maps
      alert(`นำทางไปยัง ${attraction.name}\nพิกัด: ${attraction.latitude}, ${attraction.longitude}`);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("คัดลอกลิงก์แล้ว!");
    } catch {
      alert("ไม่สามารถแชร์ได้ในขณะนี้");
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    const emptyStars = 5 - fullStars;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />
      );
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">ไม่พบข้อมูลสถานที่ท่องเที่ยว</h1>
          <p className="text-muted-foreground">
            สถานที่ที่คุณกำลังมองหาอาจไม่มีอยู่ในระบบ
          </p>
        </div>
        <Button onClick={handleBack} variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าหลัก
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={handleBack}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border hover:bg-background/90"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8 max-w-4xl">
        {/* Hero Image */}
        <div className="mt-16">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
            <img
              src={`https://images.unsplash.com/${attraction.images[0]}?w=800&h=500&fit=crop`}
              alt={attraction.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Place Details */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">
              {attraction.name}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(attraction.rating)}
              </div>
              <span className="text-lg font-semibold">{attraction.rating}</span>
              <span className="text-muted-foreground">
                ({attraction.reviewCount.toLocaleString()} รีวิว)
              </span>
            </div>
          </div>

          {/* Highlights */}
          <div className="flex flex-wrap gap-2">
            {attraction.highlights.map((highlight) => (
              <Badge key={highlight} variant="secondary">
                {highlight}
              </Badge>
            ))}
          </div>

          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3">📝 รายละเอียด</h3>
              <p className="text-muted-foreground leading-relaxed">
                {attraction.description}
              </p>
            </CardContent>
          </Card>

          {/* Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 text-primary">🕒</div>
                  <div>
                    <p className="font-medium">เวลาเปิด-ปิด</p>
                    <p className="text-sm text-muted-foreground">
                      {attraction.openingHours}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 text-primary">📍</div>
                  <div>
                    <p className="font-medium">ที่อยู่</p>
                    <p className="text-sm text-muted-foreground">
                      {attraction.location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activities */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">🎯 กิจกรรมที่ทำได้</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {attraction.activities.map((activity) => (
                  <div
                    key={activity}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {activity}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button onClick={handleNavigate} size="lg" className="gap-2">
              <Navigation className="h-5 w-5" />
              นำทางไปที่นี่
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              เพิ่มลงแผน
            </Button>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setIsFavorited(!isFavorited)}
              variant="outline"
              size="icon"
              className={isFavorited ? "text-red-500 border-red-200" : ""}
            >
              <Heart
                className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`}
              />
            </Button>
            <Button onClick={handleShare} variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttractionDetailNew;
