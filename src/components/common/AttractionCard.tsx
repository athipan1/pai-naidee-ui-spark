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
import type { AttractionPhotoCredit } from '@/shared/types/attraction';
import { localizedProvince, localizedDescription, localizedCategory, localizedTag } from '@/shared/i18n/placeLocalization';

interface AttractionCardProps {
  variant?: "default" | "discovery";
  priority?: boolean;
  id: string;
  name: string;
  nameLocal?: string;
  province: string;
  provinceEn?: string | null;
  category: string;
  rating: number;
  reviewCount: number;
  image: string;
  mediaCredits?: AttractionPhotoCredit[];
  description: string;
  descriptionEn?: string | null;
  tags: string[];
  isFavorite?: boolean;
  currentLanguage: "th" | "en";
  onFavoriteToggle: (id: string) => void;
  onCardClick: (id: string) => void;
}

const AttractionCard = ({
  variant = "default",
  priority = false,
  id,
  name,
  nameLocal,
  province,
  provinceEn,
  category,
  rating,
  reviewCount,
  image,
  mediaCredits,
  description,
  descriptionEn,
  tags,
  isFavorite = false,
  currentLanguage,
  onFavoriteToggle,
  onCardClick,
}: AttractionCardProps) => {
  const imageCredit = mediaCredits?.find(credit => credit.url === image);

  const displayName = currentLanguage === "th" && nameLocal ? nameLocal : name;
  const displayProvince = localizedProvince({ province, provinceEn, description, descriptionEn }, currentLanguage);
  const displayDescription = localizedDescription({ province, provinceEn, description, descriptionEn }, currentLanguage);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: displayName,
          text: displayDescription,
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

  if (variant === 'discovery') return (
    <article data-testid="attraction-card" className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm motion-safe:transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <button type="button" className="block h-full w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-primary" onClick={() => onCardClick(id)} aria-label={displayName}>
          <OptimizedImage src={image} alt={displayName} width={480} height={360} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="h-full w-full object-cover" unavailableLabel={currentLanguage === 'th' ? 'รูปภาพไม่พร้อมใช้งาน' : 'Image unavailable'} />
        </button>
        <Button type="button" size="icon" variant="secondary" onClick={handleFavoriteToggle} aria-pressed={isFavorite} aria-label={currentLanguage === 'th' ? (isFavorite ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด') : (isFavorite ? 'Remove from favorites' : 'Add to favorites')} className="absolute right-3 top-3 h-11 w-11 rounded-full bg-background text-foreground shadow-sm">
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-primary text-primary' : ''}`} />
        </Button>
        {imageCredit && <a href={imageCredit.sourcePage} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 right-2 max-w-[90%] truncate rounded bg-black/80 px-2 py-1 text-xs text-white">© {imageCredit.photographer} · {imageCredit.licenseName}</a>}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <span className="w-fit rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{localizedCategory(category, currentLanguage)}</span>
        <h3 className="min-h-14 text-lg font-semibold leading-7"><button className="line-clamp-2 text-left hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" onClick={() => onCardClick(id)} title={displayName}>{displayName}</button></h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" />{displayProvince}</p>
        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{displayDescription}</p>
        {reviewCount > 0 && rating > 0 && <p className="flex items-center gap-1 text-sm"><Star className="h-4 w-4" />{rating} <span className="text-muted-foreground">({reviewCount} {currentLanguage === 'th' ? 'รีวิว' : 'reviews'})</span></p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
          <Button variant="ghost" className="min-h-11 px-0 text-primary" onClick={() => onCardClick(id)}>{currentLanguage === 'th' ? 'ดูรายละเอียด' : 'View details'}<Navigation className="ml-2 h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-11 w-11" onClick={handleShare} aria-label={currentLanguage === 'th' ? 'แชร์สถานที่นี้' : 'Share this place'}><Share className="h-4 w-4" /></Button>
        </div>
      </div>
    </article>
  );

  return (
    <article
      data-testid="attraction-card"
      className="attraction-card group bg-card/95 backdrop-blur-sm rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-border/30 hover:border-primary/30 relative z-10 transform hover:scale-[1.02] hover:-translate-y-1"
      role="button"
      tabIndex={0}
      aria-label={`${displayName}, ${displayProvince} - ${localizedCategory(category, currentLanguage)}`}
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
        <OptimizedImage
          src={image}
          alt={displayName}
          loading="lazy"
          className="hero-image transition-all duration-700 group-hover:scale-110 rounded-t-3xl"
          width={400}
          height={300}
        />
        {imageCredit && (
          <a
            href={imageCredit.sourcePage}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-2 right-2 z-30 max-w-[90%] truncate rounded bg-black/70 px-2 py-1 text-[10px] text-white"
            onClick={event => event.stopPropagation()}
            aria-label={`Photo by ${imageCredit.photographer}, ${imageCredit.licenseName}, Wikimedia Commons`}
          >
            © {imageCredit.photographer} · {imageCredit.licenseName}
          </a>
        )}

        {/* Enhanced overlay gradient */}
        <div className="hero-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-3xl" />

        {/* Category badge with enhanced styling */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 glass-effect rounded-full text-xs font-semibold text-white border border-white/30 backdrop-blur-md shadow-lg">
            {localizedCategory(category, currentLanguage)}
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
              <span className="text-sm font-medium">{displayProvince}</span>
            </div>

            {reviewCount > 0 && rating > 0 ? (
              <div className="flex items-center space-x-1 bg-gradient-to-r from-accent-yellow/20 to-accent-yellow/10 px-3 py-1.5 rounded-full border border-accent-yellow/20">
                <Star className="w-4 h-4 fill-accent-yellow text-accent-yellow animate-glow" />
                <span className="text-sm font-bold text-accent-yellow">{rating}</span>
                <span className="text-xs text-muted-foreground ml-1">
                  ({reviewCount.toLocaleString()}{currentLanguage === "th" ? " รีวิว" : " reviews"})
                </span>
              </div>
            ) : <span className="text-xs text-muted-foreground">{currentLanguage === 'th' ? 'ยังไม่มีคะแนนที่ยืนยันได้' : 'No verified rating yet'}</span>}
          </div>
        </div>

        {/* Enhanced description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed group-hover:text-foreground transition-colors duration-300">
          {displayDescription}
        </p>

        {/* Enhanced tags with better styling */}
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gradient-to-r from-primary/15 to-secondary/15 text-primary rounded-full text-xs font-semibold border border-primary/30 hover:border-primary/50 transition-all duration-300 hover:scale-105"
            >
              {localizedTag(tag, currentLanguage)}
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
