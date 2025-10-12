import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlaceById, supabase } from "@/services/supabase.service";
import { useAuth } from "@/shared/contexts/AuthContext";
import {
  ArrowLeft, Heart, Star, MapPin, Map, Navigation, Tag, ChevronDown,
  ExternalLink, Globe, BookOpen, Settings, RefreshCw, Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MapModal from "@/components/attraction/MapModal";
import AccommodationModal from "@/components/attraction/AccommodationModal";
import ImageGallery from "@/components/attraction/ImageGallery";
import Reviews from "@/components/attraction/Reviews";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import type { Accommodation } from "@/shared/types/attraction";
import { useToast } from "@/components/ui/use-toast";

const pastelVariants = [
  "pastel-blue", "pastel-green", "pastel-yellow", "pastel-pink", "pastel-purple",
] as const;

interface AttractionDetailProps {
  currentLanguage: "th" | "en";
  onBack: () => void;
}

const AttractionDetail = ({ currentLanguage, onBack }: AttractionDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: attraction,
    isLoading,
    isError,
    error,
    refetch: refetchAttraction,
  } = useQuery({
    queryKey: ["place", id],
    queryFn: () => getPlaceById(id!),
    enabled: !!id,
  });

  const { data: favoriteStatus } = useQuery({
    queryKey: ['favoriteStatus', id, user?.id],
    queryFn: async () => {
      if (!user || !id) return null;
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('place_id', id)
        .single();
      return data;
    },
    enabled: !!user && !!id,
  });

  const isFavorite = !!favoriteStatus;

  const addFavoriteMutation = useMutation({
    mutationFn: async (placeId: string) => {
      if (!user) throw new Error("User not logged in");
      return supabase.from('favorites').insert({ user_id: user.id, place_id: placeId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteStatus', id, user?.id] });
      toast({ title: "Added to favorites!" });
    },
    onError: (err: any) => {
      toast({ title: "Error adding favorite", description: err.message, variant: "destructive" });
    }
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (placeId: string) => {
      if (!user) throw new Error("User not logged in");
      return supabase.from('favorites').delete().match({ user_id: user.id, place_id: placeId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteStatus', id, user?.id] });
      toast({ title: "Removed from favorites" });
    },
    onError: (err: any) => {
      toast({ title: "Error removing favorite", description: err.message, variant: "destructive" });
    }
  });

  const toggleFavorite = () => {
    if (!user) {
      toast({ title: "Please log in to add favorites", variant: "destructive" });
      return;
    }
    if (isFavorite) {
      removeFavoriteMutation.mutate(id!);
    } else {
      addFavoriteMutation.mutate(id!);
    }
  };

  const [showMapModal, setShowMapModal] = useState(false);
  const [showAccommodationModal, setShowAccommodationModal] = useState(false);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);

  const content = {
    th: {
      loading: "กำลังโหลด...",
      backToSearch: "กลับ",
      addToFavorites: "เพิ่มรายการโปรด",
      removeFromFavorites: "ลบออกจากรายการโปรด",
      notFound: "ไม่พบสถานที่ท่องเที่ยวนี้",
      mapAndNavigate: "แผนที่ & นำทาง",
      viewMap: "ดูแผนที่",
      getDirections: "เส้นทาง",
      refreshData: "รีเฟรชข้อมูล",
    },
    en: {
      loading: "Loading...",
      backToSearch: "Back",
      addToFavorites: "Add to Favorites",
      removeFromFavorites: "Remove from Favorites",
      notFound: "Attraction not found",
      mapAndNavigate: "Map & Navigate",
      viewMap: "View Map",
      getDirections: "Get Directions",
      refreshData: "Refresh Data",
    },
  };
  const t = content[currentLanguage];

  const handleGoogleMapsNavigation = () => {
    if (!attraction?.location) return;
    const { lat, lng } = attraction.location;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center">
        <div>
          <p className="text-xl text-destructive mb-4">{(error as Error).message || t.notFound}</p>
          <Button onClick={() => navigate("/")} variant="outline">{t.backToSearch}</Button>
        </div>
      </div>
    );
  }

  if (!attraction) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center text-center">
            <div>
                <p className="text-xl text-muted-foreground">{t.notFound}</p>
                <Button onClick={() => navigate("/")} className="mt-4">{t.backToSearch}</Button>
            </div>
        </div>
    );
  }

  const displayName = currentLanguage === "th" && attraction.nameLocal ? attraction.nameLocal : attraction.name;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-3 max-w-full overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 flex-shrink-0">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t.backToSearch}</span>
              <span className="sm:hidden">Back</span>
            </Button>
            
            <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">
              <Button variant="ghost" onClick={() => refetchAttraction()} className="flex items-center gap-1 sm:gap-2 flex-shrink-0" title={t.refreshData}>
                <RefreshCw className={'w-4 h-4'} />
                <span className="hidden lg:inline">{t.refreshData}</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Map className="w-4 h-4" />
                    <span className="hidden md:inline">{t.mapAndNavigate}</span>
                    <span className="md:hidden">Map</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setShowMapModal(true)}>
                    <Map className="w-4 h-4 mr-2" />{t.viewMap}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleGoogleMapsNavigation}>
                    <Navigation className="w-4 h-4 mr-2" />{t.getDirections}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" onClick={() => navigate('/admin')} className="flex items-center gap-1 sm:gap-2 flex-shrink-0 hidden sm:flex" title={currentLanguage === 'th' ? 'แผงควบคุมผู้ดูแลระบบ' : 'Admin Panel'}>
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant={isFavorite ? "default" : "outline"} onClick={toggleFavorite} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
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
        <ImageGallery images={attraction.images || [attraction.image]} alt={displayName} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

        <div className="absolute top-20 right-6 flex gap-2 z-10">
          <Button variant="outline" size="icon" onClick={toggleFavorite} className="rounded-full bg-white/20 border-white/30 text-white hover:bg-white/30" aria-label={isFavorite ? t.removeFromFavorites : t.addToFavorites}>
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button variant="outline" size="icon" onClick={handleGoogleMapsNavigation} className="rounded-full bg-white/20 border-white/30 text-white hover:bg-white/30" aria-label={t.getDirections}>
            <Navigation className="w-5 h-5" />
          </Button>
        </div>

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
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {attraction.tags.map((tag, index) => (
                <Badge key={index} variant={pastelVariants[index % pastelVariants.length]}>{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg"><MapPin className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="font-medium text-muted-foreground">Location</p>
                  <p className="text-lg font-semibold">{attraction.province}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg"><Tag className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="font-medium text-muted-foreground">Category</p>
                  <p className="text-lg font-semibold">{attraction.category}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">About this place</h3>
            <p className="text-muted-foreground leading-relaxed">{attraction.description}</p>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <div className="mb-8">
          <Reviews />
        </div>

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
                  {currentLanguage === 'th' ? 'ค้นหากิจกรรมสนุกๆ และทัวร์ที่น่าสนใจรอบๆ สถานที่นี้' : 'Discover fun activities and interesting tours around this location.'}
                </p>
              </div>
              <Button disabled className="flex items-center gap-2" size="lg">
                <Wind className="w-5 h-5" />
                {currentLanguage === 'th' ? 'ค้นหากิจกรรม' : 'Find Activities'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <MapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        location={{
          lat: attraction.location?.lat || 0,
          lng: attraction.location?.lng || 0,
          name: attraction.name,
          nameLocal: attraction.nameLocal
        }}
        currentLanguage={currentLanguage}
      />
      <AccommodationModal
        isOpen={showAccommodationModal}
        onClose={() => setShowAccommodationModal(false)}
        accommodations={accommodations}
        loading={false}
        error={null}
        currentLanguage={currentLanguage}
        attractionName={attraction.name}
      />
    </div>
  );
};

export default AttractionDetail;