import { useState } from "react";
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
  Settings,
  RefreshCw,
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
import { accommodationAPI } from "@/shared/utils/api";
import MapModal from "@/components/attraction/MapModal";
import AccommodationModal from "@/components/attraction/AccommodationModal";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import APIErrorDisplay from "@/components/common/APIErrorDisplay";
import OptimizedImage from "@/components/common/OptimizedImage";
import { 
  useAttractionDetail, 
  useRefreshAttraction,
  getAttractionErrorMessage 
} from "@/shared/hooks/useAttractionQueries";
import type { AttractionDetail } from "@/shared/utils/attractionAPI";

interface Accommodation {
  id: string;
  name: string;
  nameLocal?: string;
  rating: number;
  distance: number;
  image: string;
  price: number;
  currency: string;
  amenities: string[];
  booking_url?: string;
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
  
  // Use React Query for data fetching
  const { 
    data: attraction, 
    isLoading, 
    error, 
    refetch: refetchAttraction 
  } = useAttractionDetail(id);
  
  const refreshMutation = useRefreshAttraction();
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showAccommodationModal, setShowAccommodationModal] = useState(false);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
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
      wikipediaInfo: "📖 ข้อมูลเพิ่มเติม",
      refreshData: "🔄 รีเฟรชข้อมูล",
      refreshing: "กำลังรีเฟรช...",
      refreshSuccess: "รีเฟรชข้อมูลสำเร็จ",
      refreshError: "เกิดข้อผิดพลาดในการรีเฟรช",
      dataUpdated: "ข้อมูลได้รับการอัปเดตแล้ว",
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
      wikipediaInfo: "📖 More Information",
      refreshData: "🔄 Refresh Data",
      refreshing: "Refreshing...",
      refreshSuccess: "Data refreshed successfully",
      refreshError: "Failed to refresh data",
      dataUpdated: "Data has been updated",
    },
  };

  const t = content[currentLanguage];

  // Handle Google Maps navigation
  const handleGoogleMapsNavigation = () => {
    if (!attraction?.coordinates) return;
    
    const { lat, lng } = attraction.coordinates;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    
    // Open Google Maps in a new tab
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle refresh functionality
  const handleRefresh = async () => {
    if (!id) return;
    
    try {
      await refreshMutation.mutateAsync(id);
      // The query will automatically refetch due to invalidation
    } catch {
      // Error handled by mutation
    }
  };

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
      setAccommodationError(error instanceof Error ? error.message : "Failed to load accommodations");
    } finally {
      setAccommodationLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">
            {getAttractionErrorMessage(error, t.notFound)}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => navigate("/")} variant="outline">
              {t.backToSearch}
            </Button>
            <Button onClick={() => refetchAttraction()} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {t.refreshData}
            </Button>
          </div>
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-3 max-w-full overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t.backToSearch}</span>
              <span className="sm:hidden">Back</span>
            </Button>
            
            <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">
              <Button
                variant="ghost"
                onClick={handleRefresh}
                disabled={refreshMutation.isPending}
                className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
                title={t.refreshData}
              >
                <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                <span className="hidden lg:inline">{refreshMutation.isPending ? t.refreshing : t.refreshData}</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
                  >
                    <Map className="w-4 h-4" />
                    <span className="hidden md:inline">{t.mapAndNavigate}</span>
                    <span className="md:hidden">Map</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setShowMapModal(true)}>
                    <Map className="w-4 h-4 mr-2" />
                    {t.viewMap}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleGoogleMapsNavigation}>
                    <Navigation className="w-4 h-4 mr-2" />
                    {t.getDirections}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1 sm:gap-2 flex-shrink-0 hidden sm:flex"
                title={currentLanguage === 'th' ? 'แผงควบคุมผู้ดูแลระบบ' : 'Admin Panel'}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant={isFavorite ? "default" : "outline"}
                onClick={toggleFavorite}
                className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
              >
                <Heart
                  className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`}
                />
                <span className="hidden lg:inline">{isFavorite ? t.removeFromFavorites : t.addToFavorites}</span>
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
        <OptimizedImage
          src={attraction.images[currentImageIndex]}
          alt={displayName}
          className="w-full h-full object-cover"
          width="100%"
          height="384"
          fallbackSrc={attraction.images[0] !== attraction.images[currentImageIndex] ? attraction.images[0] : undefined}
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
      <div className="container mx-auto px-4 py-8 max-w-full overflow-hidden">
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
                <Hotel className="w-5 h-5" />
                {currentLanguage === "th" ? "ค้นหาที่พัก" : "Find Hotels"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <MapModal
        open={showMapModal}
        onClose={() => setShowMapModal(false)}
        attraction={attraction}
        currentLanguage={currentLanguage}
      />

      <AccommodationModal
        open={showAccommodationModal}
        onClose={() => setShowAccommodationModal(false)}
        accommodations={accommodations}
        loading={accommodationLoading}
        error={accommodationError}
        currentLanguage={currentLanguage}
      />
    </div>
  );
};

export default AttractionDetail;