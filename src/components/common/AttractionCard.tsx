import { useState } from "react";
import { Heart, MapPin, Star, Navigation, Share, Bookmark, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: displayName,
        text: description,
        url: window.location.origin + `/attraction/${id}`,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.origin + `/attraction/${id}`);
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.origin + `/attraction/${id}`);
    }
  };

  return (
    <article 
      className="attraction-card group bg-card rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-border/50 relative z-10"
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
      {/* Image Container */}
      <div 
        className="relative overflow-hidden cursor-pointer z-10"
        onClick={() => onCardClick(id)}
      >
        <div
          className={`w-full h-48 bg-muted loading-shimmer ${imageLoaded ? "hidden" : "block"}`}
        />
        <img
          src={image}
          alt={displayName}
          loading="lazy"
          className={`hero-image transition-all duration-700 group-hover:scale-110 ${imageLoaded ? "block" : "hidden"}`}
          onLoad={() => setImageLoaded(true)}
          width="400"
          height="192"
        />

        {/* Enhanced overlay gradient */}
        <div className="hero-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Category badge with glow effect */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 glass-effect rounded-full text-xs font-medium text-white border border-white/20 backdrop-blur-md">
            {currentLanguage === "th" ? getCategoryNameTh(category) : category}
          </span>
        </div>

        {/* Enhanced action buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <button
            className={`heart-btn transition-all duration-300 ${
              isFavorite 
                ? "bg-destructive text-destructive-foreground shadow-lg neon-glow" 
                : "glass-effect text-white hover:bg-white/20"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(id);
            }}
            aria-label={
              currentLanguage === "th" 
                ? (isFavorite ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด")
                : (isFavorite ? "Remove from favorites" : "Add to favorites")
            }
            role="button"
            tabIndex={0}
          >
            <Heart className={`w-4 h-4 transition-all duration-300 ${isFavorite ? "fill-current scale-110" : ""}`} />
          </button>
          
          <button
            className="w-9 h-9 rounded-full glass-effect text-white hover:bg-white/20 flex items-center justify-center transition-all duration-300 touch-manipulation interactive-scale"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center z-20 pointer-events-none group-hover:pointer-events-auto">
          <Button
            size="sm"
            className="btn-primary transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-lg z-30 relative pointer-events-auto"
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

      {/* Content - Not clickable to avoid confusion */}
      <div className="p-4 space-y-3">
        {/* Enhanced title and rating */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-all duration-300 text-shadow">
            {displayName}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MapPin className="w-4 h-4 transition-colors duration-300 group-hover:text-primary" />
              <span className="text-sm">{province}</span>
            </div>

            <div className="flex items-center space-x-1 bg-accent/30 px-2 py-1 rounded-full">
              <Star className="w-4 h-4 fill-accent-yellow text-accent-yellow animate-glow" />
              <span className="text-sm font-medium">{rating}</span>
              <span className="text-xs text-muted-foreground">
                ({reviewCount}
                {currentLanguage === "th" ? " รีวิว" : " reviews"})
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed group-hover:text-foreground transition-colors duration-300">
          {description}
        </p>

        {/* Enhanced tags */}
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary rounded-md text-xs font-medium border border-primary/20 hover:border-primary/40 transition-all duration-300"
            >
              {currentLanguage === "th" ? getTagNameTh(tag) : tag}
            </span>
          ))}
          {tags.length > 3 && (
            <button 
              className="px-2 py-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              onClick={() => onCardClick(id)}
            >
              +{tags.length - 3}{" "}
              {currentLanguage === "th" ? "เพิ่มเติม" : "more"}
            </button>
          )}
        </div>

        {/* Bottom action bar */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                >
                  <Navigation className="w-3 h-3 mr-1" />
                  {currentLanguage === "th" ? "ดู & นำทาง" : "View & Navigate"}
                  <ChevronDown className="w-2 h-2 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem onClick={() => onCardClick(id)}>
                  <Navigation className="w-3 h-3 mr-2" />
                  {currentLanguage === "th" ? "รายละเอียด" : "Details"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`/map/${id}`, '_blank');
                  }}
                >
                  <MapPin className="w-3 h-3 mr-2" />
                  {currentLanguage === "th" ? "แผนที่" : "Map"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(id);
            }}
            className="text-xs h-8"
          >
            <Bookmark className={`w-3 h-3 ${isFavorite ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>
    </article>
  );
};

export default AttractionCard;
