import { Navigation, Plus, Share2, Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/shared/hooks/use-toast";
import { useState } from "react";

interface ActionButtonsProps {
  latitude: number;
  longitude: number;
  placeName: string;
  onAddToPlan?: () => void;
}

export function ActionButtons({ latitude, longitude, placeName, onAddToPlan }: ActionButtonsProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const { toast } = useToast();

  const handleNavigate = () => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: placeName,
          text: `มาดู ${placeName} กันเถอะ!`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        fallbackShare();
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "คัดลอกลิงก์แล้ว!",
        description: "ลิงก์ถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแชร์ได้ในขณะนี้",
        variant: "destructive",
      });
    }
  };

  const handleAddToPlan = () => {
    if (onAddToPlan) {
      onAddToPlan();
    }
    toast({
      title: "เพิ่มลงแผนการเดินทางแล้ว!",
      description: `${placeName} ถูกเพิ่มลงในแผนการเดินทางของคุณ`,
    });
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "ลบออกจากรายการโปรด" : "เพิ่มลงรายการโปรด",
      description: isFavorited 
        ? `ลบ ${placeName} ออกจากรายการโปรดแล้ว`
        : `เพิ่ม ${placeName} ลงในรายการโปรดแล้ว`,
    });
  };

  const handleViewMap = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Primary Actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button onClick={handleNavigate} size="lg" className="gap-2">
          <Navigation className="h-5 w-5" />
          นำทางไปที่นี่
        </Button>
        <Button onClick={handleAddToPlan} variant="outline" size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          เพิ่มลงแผน
        </Button>
      </div>

      {/* Secondary Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={handleToggleFavorite} 
          variant="outline" 
          size="icon"
          className={isFavorited ? "text-red-500 border-red-200 hover:bg-red-50" : ""}
        >
          <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
        </Button>
        <Button onClick={handleShare} variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
        <Button onClick={handleViewMap} variant="outline" size="icon">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}