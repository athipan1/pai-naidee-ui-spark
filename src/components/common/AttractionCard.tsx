import { useState } from "react";
import { Heart, MapPin, Star, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  return (
    <div
      className="attraction-card group cursor-pointer"
      onClick={() => onCardClick(id)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-t-2xl">
        <div
          className={`w-full h-48 bg-muted animate-pulse ${imageLoaded ? "hidden" : "block"}`}
        />
        <img
          src={image}
          alt={displayName}
          className={`hero-image transition-transform duration-500 group-hover:scale-110 ${imageLoaded ? "block" : "hidden"}`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Overlay gradient */}
        <div className="hero-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-card/90 backdrop-blur-sm rounded-full text-xs font-medium text-primary border border-border/50">
            {currentLanguage === "th" ? getCategoryNameTh(category) : category}
          </span>
        </div>

        {/* Favorite button */}
        <button
          className={`heart-btn absolute top-3 right-3 ${isFavorite ? "bg-destructive text-destructive-foreground" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle(id);
          }}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        {/* Quick action button */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button
            size="sm"
            className="btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onCardClick(id);
            }}
          >
            <Navigation className="w-4 h-4 mr-2" />
            {currentLanguage === "th" ? "ดูรายละเอียด" : "View Details"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title and Rating */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {displayName}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{province}</span>
            </div>

            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-accent-yellow text-accent-yellow" />
              <span className="text-sm font-medium">{rating}</span>
              <span className="text-xs text-muted-foreground">
                ({reviewCount}
                {currentLanguage === "th" ? " รีวิว" : " reviews"})
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-accent/50 text-accent-foreground rounded-md text-xs font-medium"
            >
              {currentLanguage === "th" ? getTagNameTh(tag) : tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-2 py-1 text-xs text-muted-foreground">
              +{tags.length - 3}{" "}
              {currentLanguage === "th" ? "เพิ่มเติม" : "more"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttractionCard;
