import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AttractionDetailProps {
  currentLanguage: "th" | "en";
  onBack: () => void;
}

const AttractionDetail = ({
  currentLanguage,
  onBack,
}: AttractionDetailProps) => {
  const { id: _id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const content = {
    th: {
      title: "หมู่เกาะพีพี",
      province: "จังหวัดกระบี่",
      description:
        "เกาะที่มีธรรมชาติสวยงาม น้ำใสเขียวมรกต และหาดทรายขาว เหมาะสำหรับการพักผ่อนและดำน้ำ",
      back: "กลับ",
    },
    en: {
      title: "Phi Phi Islands",
      province: "Krabi Province",
      description:
        "Beautiful natural island with emerald waters and white sandy beaches, perfect for relaxation and diving",
      back: "Back",
    },
  };

  const t = content[currentLanguage];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Hero Image */}
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video bg-gradient-to-br from-blue-400 to-teal-500 rounded-lg flex items-center justify-center text-white">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
                <p className="text-blue-100">{t.province}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {t.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">4.8</span>
                <Badge variant="secondary">Popular</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {t.description}
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button className="flex-1">
            <Heart className="w-4 h-4 mr-2" />
            Add to Favorites
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            View More Places
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttractionDetail;
