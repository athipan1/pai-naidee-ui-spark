import { useState } from "react";
import { Heart, MapPin, Star, Navigation, Share, Bookmark, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/common/OptimizedImage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { showToast } from "./EnhancedToast";

// Translation helpers
const getCategoryNameTh = (category: string): string => {
  const categories: { [key: string]: string } = {
    Beach: "ชายหาด",
    Culture: "วัฒนธรรม",
    Nature: "ธรรมชาติ",
    Food: "อาหาร",
    Mountain: "ภูเขา",
    Temple: "วัด",
  };
  return categories[category] || category;
};

const getTagNameTh = (tag: string): string => {
  const tags: { [key: string]: string } = {
    Beach: "ชายหาด",
    Snorkeling: "ดำน้ำดูปะการัง",
    Island: "เกาะ",
    Photography: "ถ่ายรูป",
    Temple: "วัด",
    Culture: "วัฒนธรรม",
    Buddhism: "พุทธศาสนา",
    History: "ประวัติศาสตร์",
    Mountain: "ภูเขา",
    Nature: "ธรรมชาติ",
    Hiking: "เดินป่า",
    Waterfalls: "น้ำตก",
    Food: "อาหาร",
    Traditional: "แบบดั้งเดิม",
    Market: "ตลาด",
  };
  return tags[tag] || tag;
};

interface AttractionCardProps {
  id: string;
  name: string;
  nameLocal?: string;
  province: string;
  category: string;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  tags: string[];
  isFavorite?: boolean;
  currentLanguage: "th" | "en";
  onFavoriteToggle: (id: string) => void;
  onCardClick: (id: string) => void;
}

const AttractionCard = ({
  id,
  name,
  nameLocal,
  province,
  category,
  rating,
  reviewCount,
  image,
  description,
  tags,
  isFavorite = false,
  currentLanguage,
  onFavoriteToggle,
  onCardClick,
}: AttractionCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const displayName = currentLanguage === "th" && nameLocal ? nameLocal : name;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: displayName,
          text: description,
          url: window.location.origin + `/attraction/${id}`,
        });
        showToast.shared(displayName);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.origin + `/attraction/${id}`);
        showToast.success(
          currentLanguage === "th" 
            ? "คัดลอกลิงก์แล้ว" 
            : "Link copied to clipboard"
        );
      }
    } catch (error) {
      // User cancelled share or clipboard failed
      if (error instanceof Error && error.name !== 'AbortError') {
        showToast.error(
          currentLanguage === "th" 
            ? "ไม่สามารถแชร์ได้" 
            : "Failed to share"
        );
      }
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavoriteState = !isFavorite;
    onFavoriteToggle(id);
    
    // Show appropriate toast with undo functionality
    if (newFavoriteState) {
      showToast.addedToFavorites(displayName, () => onFavoriteToggle(id));
    } else {
      showToast.removedFromFavorites(displayName, () => onFavoriteToggle(id));
    }
  };

  return (
    <article 
      className="attraction-card group bg-card/95 backdrop-blur-sm rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-border/30 hover:border-primary/30 relative z-10 transform hover:scale-[1.02] hover:-translate-y-1"
      role="button"
      tabIndex={0}
      aria-label={`${displayName}, ${province} - ${currentLanguage === "th" ? getCategoryNameTh(category) : category}`}
      onClick={() => onCardClick(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCardClick(id);
        }
      }}
    >
      {/* Image Container with Enhanced Design */}
      <div 
        className="relative overflow-hidden cursor-pointer z-10 aspect-[4/3]"
        onClick={() => onCardClick(id)}
      >
        <div
          className={`w-full h-full bg-gradient-to-br from-muted to-muted/60 loading-shimmer ${imageLoaded ? "hidden" : "block"} rounded-t-3xl`}
        />
        <OptimizedImage
          src={image}
          alt={displayName}
          loading="lazy"
          className={`hero-image transition-all duration-700 group-hover:scale-110 rounded-t-3xl ${imageLoaded ? "block" : "hidden"}`}
          onLoad={() => setImageLoaded(true)}
          width={400}
          height={300}
        />

        {/* Enhanced overlay gradient */}
        <div className="hero-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-3xl" />

        {/* Category badge with enhanced styling */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 glass-effect rounded-full text-xs font-semibold text-white border border-white/30 backdrop-blur-md shadow-lg">
            {currentLanguage === "th" ? getCategoryNameTh(category) : category}
          </span>
        </div>

        {/* Enhanced action buttons */}
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button
            className={`heart-btn transition-all duration-300 transform hover:scale-110 active:scale-95 ${
              isFavorite 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30" 
                : "glass-effect text-white hover:bg-white/20"
            }`}
            onClick={handleFavoriteToggle}
            aria-label={
              currentLanguage === "th" 
                ? (isFavorite ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด")
                : (isFavorite ? "Remove from favorites" : "Add to favorites")
            }
            aria-pressed={isFavorite}
            role="button"
            tabIndex={0}
          >
            <Heart className={`w-4 h-4 transition-all duration-300 ${isFavorite ? "fill-current animate-pulse" : ""}`} />
          </button>
          
          <button
            className="w-10 h-10 rounded-full glass-effect text-white hover:bg-white/20 flex items-center justify-center transition-all duration-300 touch-manipulation interactive-scale transform hover:scale-110 active:scale-95"
            onClick={handleShare}
            aria-label={
              currentLanguage === "th" 
                ? "แชร์สถานที่นี้"
                : "Share this place"
            }
            role="button"
            tabIndex={0}
          >
            <Share className="w-4 h-4" />
          </button>
        </div>

        {/* Enhanced quick action overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center z-20 pointer-events-none group-hover:pointer-events-auto rounded-t-3xl">
          <Button
            size="sm"
            className="btn-primary transform translate-y-6 group-hover:translate-y-0 transition-all duration-500 shadow-xl z-30 relative pointer-events-auto font-semibold"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCardClick(id);
            }}
          >
            <Navigation className="w-4 h-4 mr-2" />
            {currentLanguage === "th" ? "ดูรายละเอียด" : "View Details"}
          </Button>
        </div>
      </div>

      {/* Enhanced Content Section */}
      <div className="p-5 space-y-4">
        {/* Enhanced title and rating */}
        <div className="space-y-3">
          <h3 className="font-bold text-xl line-clamp-1 group-hover:text-primary transition-all duration-300 text-shadow">
            {displayName}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="w-4 h-4 transition-colors duration-300 group-hover:text-primary" />
              <span className="text-sm font-medium">{province}</span>
            </div>

            <div className="flex items-center space-x-1 bg-gradient-to-r from-accent-yellow/20 to-accent-yellow/10 px-3 py-1.5 rounded-full border border-accent-yellow/20">
              <Star className="w-4 h-4 fill-accent-yellow text-accent-yellow animate-glow" />
              <span className="text-sm font-bold text-accent-yellow">{rating}</span>
              <span className="text-xs text-muted-foreground ml-1">
                ({reviewCount.toLocaleString()}
                {currentLanguage === "th" ? " รีวิว" : " reviews"})
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed group-hover:text-foreground transition-colors duration-300">
          {description}
        </p>

        {/* Enhanced tags with better styling */}
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gradient-to-r from-primary/15 to-secondary/15 text-primary rounded-full text-xs font-semibold border border-primary/30 hover:border-primary/50 transition-all duration-300 hover:scale-105"
            >
              {currentLanguage === "th" ? getTagNameTh(tag) : tag}
            </span>
          ))}
          {tags.length > 3 && (
            <button 
              className="px-3 py-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-muted/50 rounded-full hover:bg-muted border border-transparent hover:border-primary/30"
              onClick={() => onCardClick(id)}
            >
              +{tags.length - 3}{" "}
              {currentLanguage === "th" ? "เพิ่มเติม" : "more"}
            </button>
          )}
        </div>

        {/* Enhanced bottom action bar */}
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-9 font-medium hover:scale-105 transition-transform duration-200"
                >
                  <Navigation className="w-3 h-3 mr-2" />
                  {currentLanguage === "th" ? "ดู & นำทาง" : "View & Navigate"}
                  <ChevronDown className="w-3 h-3 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuItem onClick={() => onCardClick(id)}>
                  <Navigation className="w-4 h-4 mr-2" />
                  {currentLanguage === "th" ? "รายละเอียด" : "Details"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`/map/${id}`, '_blank');
                  }}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {currentLanguage === "th" ? "แผนที่" : "Map"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavoriteToggle}
            className="text-xs h-9 hover:scale-105 transition-transform duration-200"
            aria-label={
              currentLanguage === "th" 
                ? (isFavorite ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด")
                : (isFavorite ? "Remove from favorites" : "Add to favorites")
            }
            aria-pressed={isFavorite}
          >
            <Bookmark className={`w-4 h-4 transition-all duration-300 ${isFavorite ? "fill-current text-primary" : ""}`} />
          </Button>
        </div>
      </div>
    </article>
  );
};

export default AttractionCard;
