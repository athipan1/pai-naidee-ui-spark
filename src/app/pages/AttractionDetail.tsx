import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Star,
  MapPin,
  Map,
  Navigation,
  ChevronDown,
  Hotel,
  ExternalLink,
  Globe,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockAttractionDetails, simulateDelay } from "@/shared/data/mockData";
import { accommodationAPI } from "@/shared/utils/api";
import MapModal from "@/components/attraction/MapModal";
import AccommodationModal from "@/components/attraction/AccommodationModal";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";

interface AttractionDetail {
  id: string;
  name: string;
  nameLocal: string;
  province: string;
  category: string;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  tags: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  externalLinks?: {
    officialWebsite?: string;
    googleMaps?: string;
    wikipediaUrl?: string;
  };
}

interface AttractionDetailProps {
  currentLanguage: "th" | "en";
  onBack: () => void;
}

const AttractionDetail = ({
  currentLanguage,
  onBack,
}: AttractionDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attraction, setAttraction] = useState<AttractionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showAccommodationModal, setShowAccommodationModal] = useState(false);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [accommodationLoading, setAccommodationLoading] = useState(false);
  const [accommodationError, setAccommodationError] = useState<string | null>(null);

  const content = {
    th: {
      loading: "กำลังโหลด...",
      backToSearch: "กลับ",
      addToFavorites: "เพิ่มรายการโปรด",
      removeFromFavorites: "ลบออกจากรายการโปรด",
      notFound: "ไม่พบสถานที่ท่องเที่ยวนี้",
      mapView: "🗺️ แผนที่",
      navigateToMap: "🧭 นำทาง",
      mapAndNavigate: "🗺️ แผนที่ & นำทาง",
      viewMap: "ดูแผนที่",
      getDirections: "เส้นทาง",
      bookAccommodation: "🏨 จองที่พักใกล้เคียง",
      externalLinks: "🔗 ลิงก์ที่เกี่ยวข้อง",
      externalLinksDescription: "เข้าถึงข้อมูลเพิ่มเติมและแหล่งข้อมูลอย่างเป็นทางการ",
      officialWebsite: "🌐 เว็บไซต์อย่างเป็นทางการ",
      googleMaps: "📍 Google Maps",
      wikipediaInfo: "📖 ข้อมูลเพิ่มเติม",
    },
    en: {
      loading: "Loading...",
      backToSearch: "Back",
      addToFavorites: "Add to Favorites",
      removeFromFavorites: "Remove from Favorites",
      notFound: "Attraction not found",
      mapView: "🗺️ Map",
      navigateToMap: "🧭 Navigate",
      mapAndNavigate: "🗺️ Map & Navigate",
      viewMap: "View Map",
      getDirections: "Get Directions",
      bookAccommodation: "🏨 Book Nearby Accommodation",
      externalLinks: "🔗 Related Links",
      externalLinksDescription: "Access additional information and official resources",
      officialWebsite: "🌐 Official Website", 
      googleMaps: "📍 Google Maps",
      wikipediaInfo: "📖 More Information",
    },
  };

  const t = content[currentLanguage];

  // Load attraction details using mock data
  useEffect(() => {
    const fetchAttractionDetail = async () => {
      if (!id) return;

      setLoading(true);

      try {
        // Simulate API loading time
        await simulateDelay(600);

        // Get mock data for the attraction
        const attractionData = mockAttractionDetails[id];

        if (attractionData) {
          // Map the mock data to match the component's interface
          const mappedAttraction: AttractionDetail = {
            id: attractionData.id,
            name: attractionData.name,
            nameLocal:
              currentLanguage === "th"
                ? attractionData.nameLocal || attractionData.name
                : attractionData.nameLocal || attractionData.name,
            province:
              currentLanguage === "th" ? attractionData.province : attractionData.province,
            category: attractionData.category,
            rating: attractionData.rating,
            reviewCount: attractionData.reviewCount,
            images: attractionData.images,
            description: attractionData.description,
            tags: attractionData.tags,
            coordinates: attractionData.location,
            externalLinks: attractionData.externalLinks,
          };

          setAttraction(mappedAttraction);
        } else {
          throw new Error("Attraction not found");
        }
      } catch (error) {
        console.error("Failed to fetch attraction details:", error);
        // Don't show error, just use default data
        const defaultAttraction: AttractionDetail = {
          id: id || "1",
          name: "Phi Phi Islands",
          nameLocal: "หมู่เกาะพีพี",
          province: currentLanguage === "th" ? "กระบี่" : "Krabi",
          category: "Beach",
          rating: 4.8,
          reviewCount: 2547,
          images: [
            "/src/shared/assets/hero-beach.jpg",
            "/src/shared/assets/floating-market.jpg",
            "/src/shared/assets/mountain-nature.jpg",
          ],
          description:
            currentLanguage === "th"
              ? "น้ำทะเลใสและหน้าผาหินปูนที่สวยงาม ทำให้ที่นี่เป็นสวรรค์สำหรับผู้ที่ชื่นชอบชายหาดและการดำน้ำดูปะการัง"
              : "Crystal clear waters and stunning limestone cliffs make this a paradise for beach lovers and snorkeling enthusiasts.",
          tags: ["Beach", "Snorkeling", "Island", "Photography"],
          coordinates: {
            lat: 7.7367,
            lng: 98.7784,
          },
        };
        setAttraction(defaultAttraction);
      } finally {
        setLoading(false);
      }
    };

    fetchAttractionDetail();
  }, [id, currentLanguage]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Here you would typically call an API to update favorites
  };

  const handleBookingClick = async () => {
    if (!attraction) return;

    setShowAccommodationModal(true);
    setAccommodationLoading(true);
    setAccommodationError(null);

    try {
      const accommodationData = await accommodationAPI.fetchNearbyAccommodations(attraction.id);
      setAccommodations(accommodationData);
    } catch (error) {
      console.error("Failed to fetch accommodations:", error);
      setAccommodationError(error instanceof Error ? error.message : "Failed to load accommodations");
    } finally {
      setAccommodationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">{t.notFound}</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            {t.backToSearch}
          </Button>
        </div>
      </div>
    );
  }

  const displayName =
    currentLanguage === "th" && attraction.nameLocal
      ? attraction.nameLocal
      : attraction.name;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.backToSearch}
            </Button>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Map className="w-4 h-4" />
                    {t.mapAndNavigate}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setShowMapModal(true)}>
                    <Map className="w-4 h-4 mr-2" />
                    {t.viewMap}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/map/${attraction.id}`)}>
                    <Navigation className="w-4 h-4 mr-2" />
                    {t.getDirections}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant={isFavorite ? "default" : "outline"}
                onClick={toggleFavorite}
                className="flex items-center gap-2"
              >
                <Heart
                  className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`}
                />
                {isFavorite ? t.removeFromFavorites : t.addToFavorites}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation 
        currentLanguage={currentLanguage} 
        items={[
          { label: currentLanguage === 'th' ? 'หน้าแรก' : 'Home', path: '/' },
          { label: currentLanguage === 'th' ? 'สถานที่ท่องเที่ยว' : 'Attractions', path: '/' },
          { label: displayName }
        ]}
      />

      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={attraction.images[currentImageIndex]}
          alt={displayName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Image Navigation */}
        {attraction.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {attraction.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Overlay Content */}
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{attraction.province}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current text-yellow-400" />
              <span>{attraction.rating}</span>
              <span className="opacity-75">
                ({attraction.reviewCount} reviews)
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {attraction.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-white/20 text-white border-white/30"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Description */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">
              {attraction.description}
            </p>
          </CardContent>
        </Card>

        {/* External Links Section */}
        {attraction.externalLinks && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-primary" />
                  {t.externalLinks}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t.externalLinksDescription}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {attraction.externalLinks.officialWebsite && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-auto p-4 text-left justify-start"
                    onClick={() => window.open(attraction.externalLinks!.officialWebsite, '_blank')}
                  >
                    <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{t.officialWebsite}</span>
                      <span className="text-xs text-muted-foreground">
                        {currentLanguage === "th" ? "เว็บไซต์หลัก" : "Official information"}
                      </span>
                    </div>
                  </Button>
                )}
                {attraction.externalLinks.googleMaps && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-auto p-4 text-left justify-start"
                    onClick={() => window.open(attraction.externalLinks!.googleMaps, '_blank')}
                  >
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{t.googleMaps}</span>
                      <span className="text-xs text-muted-foreground">
                        {currentLanguage === "th" ? "แผนที่และเส้นทาง" : "Maps & directions"}
                      </span>
                    </div>
                  </Button>
                )}
                {attraction.externalLinks.wikipediaUrl && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-auto p-4 text-left justify-start"
                    onClick={() => window.open(attraction.externalLinks!.wikipediaUrl, '_blank')}
                  >
                    <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{t.wikipediaInfo}</span>
                      <span className="text-xs text-muted-foreground">
                        {currentLanguage === "th" ? "ข้อมูลเชิงลึก" : "Detailed information"}
                      </span>
                    </div>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accommodation Booking Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Hotel className="h-5 w-5 text-primary" />
                  {t.bookAccommodation}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {currentLanguage === "th" 
                    ? "ค้นหาและจองที่พักใกล้เคียงกับสถานที่ท่องเที่ยวนี้" 
                    : "Find and book accommodations near this attraction"}
                </p>
              </div>
              <Button
                onClick={handleBookingClick}
                className="flex items-center gap-2"
                size="lg"
              >
                <Hotel className="h-4 w-4" />
                {t.bookAccommodation}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Modal */}
      <MapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        location={{
          lat: attraction.coordinates.lat,
          lng: attraction.coordinates.lng,
          name: attraction.name,
          nameLocal: attraction.nameLocal
        }}
        currentLanguage={currentLanguage}
      />

      {/* Accommodation Modal */}
      <AccommodationModal
        isOpen={showAccommodationModal}
        onClose={() => setShowAccommodationModal(false)}
        accommodations={accommodations}
        loading={accommodationLoading}
        error={accommodationError}
        currentLanguage={currentLanguage}
        attractionName={displayName}
      />
    </div>
  );
};

export default AttractionDetail;
