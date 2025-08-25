import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Star,
  MapPin,
  Map,
  Navigation,
  Tag,
  ChevronDown,
  Hotel,
  ExternalLink,
  Globe,
  BookOpen,
  Settings,
  RefreshCw,
  Wind,
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
import { fetchNearbyAccommodations } from "@/services/attraction.service";
import MapModal from "@/components/attraction/MapModal";
import AccommodationModal from "@/components/attraction/AccommodationModal";
import ImageGallery from "@/components/attraction/ImageGallery";
import Reviews from "@/components/attraction/Reviews";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import OptimizedImage from "@/components/common/OptimizedImage";
import { 
  useAttractionDetail, 
  useRefreshAttraction,
  getAttractionErrorMessage 
} from "@/shared/hooks/useAttractionQueries";
import type { Accommodation } from "@/shared/types/attraction";

const pastelVariants = [
  "pastel-blue",
  "pastel-green",
  "pastel-yellow",
  "pastel-pink",
  "pastel-purple",
] as const;

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

  const handleShare = () => {
    if (navigator.share && attraction) {
      navigator.share({
        title: displayName,
        text: attraction.description,
        url: window.location.href,
      })
      .catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      // In a real app, you'd use a toast component here
      alert(currentLanguage === 'th' ? 'คัดลอกลิงก์แล้ว' : 'Link copied to clipboard!');
    }
  };

  const handleBookingClick = async () => {
    if (!attraction) return;

    setShowAccommodationModal(true);
    setAccommodationLoading(true);
    setAccommodationError(null);

    try {
      const accommodationData = await fetchNearbyAccommodations(attraction.id);
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

      {/* Hero Section with Image Gallery */}
      <div className="relative h-[60vh] min-h-[400px] w-full">
        <ImageGallery images={attraction.images} alt={displayName} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

        {/* Action Buttons */}
        <div className="absolute top-20 right-6 flex gap-2 z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFavorite}
            className="rounded-full bg-white/20 border-white/30 text-white hover:bg-white/30"
            aria-label={isFavorite ? t.removeFromFavorites : t.addToFavorites}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleGoogleMapsNavigation}
            className="rounded-full bg-white/20 border-white/30 text-white hover:bg-white/30"
            aria-label={t.getDirections}
          >
            <Navigation className="w-5 h-5" />
          </Button>
        </div>

        {/* Overlay Content */}
        <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">{displayName}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-base">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{attraction.province}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-current text-yellow-400" />
              <span>{attraction.rating}</span>
              <span className="opacity-80">
                ({attraction.reviewCount.toLocaleString()} {currentLanguage === 'th' ? 'รีวิว' : 'reviews'})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-full overflow-hidden">
        {/* Tags Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {attraction.tags.map((tag, index) => (
                <Badge
                  key={index}
                  as="button"
                  variant={pastelVariants[index % pastelVariants.length]}
                  className="cursor-pointer text-sm"
                  onClick={() => alert(`Filtering by ${tag}`)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Details Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Location</p>
                  <p className="text-lg font-semibold">{attraction.province}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Category</p>
                  <p className="text-lg font-semibold">{attraction.category}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">About this place</h3>
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

        {/* Reviews Section */}
        <div className="mb-8">
          <Reviews />
        </div>

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
                  {currentLanguage === 'th'
                    ? 'ค้นหาและจองที่พักใกล้เคียงกับสถานที่ท่องเที่ยวนี้'
                    : 'Find and book accommodations near this attraction'}
                </p>
              </div>
              <Button
                onClick={handleBookingClick}
                className="flex items-center gap-2"
                size="lg"
              >
                <Hotel className="w-5 h-5" />
                {currentLanguage === 'th' ? 'ค้นหาที่พัก' : 'Find Hotels'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Nearby Activities Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Wind className="h-5 w-5 text-primary" />
                  {currentLanguage === 'th' ? 'กิจกรรมและทัวร์ใกล้เคียง' : 'Nearby Activities & Tours'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {currentLanguage === 'th'
                    ? 'ค้นหากิจกรรมสนุกๆ และทัวร์ที่น่าสนใจรอบๆ สถานที่นี้'
                    : 'Discover fun activities and interesting tours around this location.'}
                </p>
              </div>
              <Button
                disabled
                className="flex items-center gap-2"
                size="lg"
              >
                <Wind className="w-5 h-5" />
                {currentLanguage === 'th' ? 'ค้นหากิจกรรม' : 'Find Activities'}
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Modals */}
      <MapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        location={{
          lat: attraction.coordinates?.lat || 0,
          lng: attraction.coordinates?.lng || 0,
          name: attraction.name,
          nameLocal: attraction.nameLocal
        }}
        currentLanguage={currentLanguage}
      />

      <AccommodationModal
        isOpen={showAccommodationModal}
        onClose={() => setShowAccommodationModal(false)}
        accommodations={accommodations}
        loading={accommodationLoading}
        error={accommodationError}
        currentLanguage={currentLanguage}
        attractionName={attraction.name}
      />
    </div>
  );
};

export default AttractionDetail;