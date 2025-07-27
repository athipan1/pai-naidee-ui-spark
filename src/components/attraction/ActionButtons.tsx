import { Navigation, Plus, Share2, Heart, Map, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface ActionButtonsProps {
  latitude: number;
  longitude: number;
  placeName: string;
  onAddToPlan?: () => void;
}

export function ActionButtons({
  latitude,
  longitude,
  placeName,
  onAddToPlan,
}: ActionButtonsProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleNavigate = () => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(googleMapsUrl, "_blank");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: placeName,
          text: `มาดู ${placeName} กันเถอะ!`,
          url: window.location.href,
        });
      } catch {
        console.log("Share failed, falling back to clipboard");
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("คัดลอกลิงก์แล้ว!");
      } catch {
        alert("ไม่สามารถแชร์ได้ในขณะนี้");
      }
    }
  };

  const handleAddToPlan = () => {
    if (onAddToPlan) {
      onAddToPlan();
    }
    alert(`เพิ่ม ${placeName} ลงในแผนการเดินทางแล้ว!`);
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    alert(
      isFavorited
        ? `ลบ ${placeName} ออกจากรายการโปรดแล้ว`
        : `เพิ่ม ${placeName} ลงในรายการโปรดแล้ว`
    );
  };

  const handleViewMap = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Primary Actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="lg" className="gap-2">
              <Map className="h-5 w-5" />
              แผนที่ & นำทาง
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={handleViewMap}>
              <Map className="h-4 w-4 mr-2" />
              ดูแผนที่
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleNavigate}>
              <Navigation className="h-4 w-4 mr-2" />
              เส้นทาง
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          onClick={handleAddToPlan}
          variant="outline"
          size="lg"
          className="gap-2"
        >
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
          className={
            isFavorited ? "text-red-500 border-red-200 hover:bg-red-50" : ""
          }
        >
          <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
        </Button>
        <Button onClick={handleShare} variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
