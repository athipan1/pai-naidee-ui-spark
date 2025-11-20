import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/shared/hooks/use-toast";
import { Folder, Search, Trash2, FileImage, FileVideo } from "lucide-react";
import { MediaItem } from "@/shared/types/media";

interface MediaGallerySimpleProps {
  currentLanguage: "th" | "en";
  mediaItems: MediaItem[];
  onEdit: (id: string, data: Partial<MediaItem>) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

const MediaGallerySimple = ({ 
  currentLanguage, 
  mediaItems,
  onDelete
}: MediaGallerySimpleProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>(mediaItems);
  const { toast } = useToast();

  const texts = {
    en: {
      title: "Media Gallery",
      subtitle: "View and manage all uploaded media",
      search: "Search media...",
      noMedia: "No media found",
      noItems: "No media items yet. Upload some content to get started.",
      loading: "Loading media...",
      deleteSuccess: "Media deleted successfully",
      deleteError: "Failed to delete media",
      delete: "Delete",
      image: "Image",
      video: "Video",
      items: "items"
    },
    th: {
      title: "แกลเลอรี่สื่อ",
      subtitle: "ดูและจัดการสื่อที่อัปโหลดทั้งหมด",
      search: "ค้นหาสื่อ...",
      noMedia: "ไม่พบสื่อ",
      noItems: "ยังไม่มีรายการสื่อ เริ่มต้นด้วยการอัปโหลดเนื้อหา",
      loading: "กำลังโหลดสื่อ...",
      deleteSuccess: "ลบสื่อสำเร็จ",
      deleteError: "ไม่สามารถลบสื่อได้",
      delete: "ลบ",
      image: "รูปภาพ",
      video: "วิดีโอ",
      items: "รายการ"
    }
  };

  const t = texts[currentLanguage];

  useEffect(() => {
    setFilteredItems(mediaItems);
  }, [mediaItems]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredItems(mediaItems);
    } else {
      const filtered = mediaItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, mediaItems]);

  const handleDelete = (id: string) => {
    try {
      onDelete(id);
      toast({
        title: "Success",
        description: t.deleteSuccess
      });
    } catch (error) {
      toast({
        title: "Error",
        description: t.deleteError,
        variant: "destructive"
      });
    }
  };

  const getMediaIcon = (type: string) => {
    return type === 'video' ? <FileVideo className="h-4 w-4" /> : <FileImage className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5 text-primary" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        {filteredItems.length > 0 && (
          <div className="flex gap-2">
            <Badge variant="secondary">
              {filteredItems.length} {t.items}
            </Badge>
          </div>
        )}

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{searchTerm ? t.noMedia : t.noItems}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="relative group">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted border">
                  {item.type === 'image' && item.url ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : item.type === 'video' && item.url ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getMediaIcon(item.type)}
                    </div>
                  )}
                </div>
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2 p-2">
                  <Badge variant="secondary" className="mb-2">
                    {getMediaIcon(item.type)}
                    <span className="ml-1">{item.type === 'video' ? t.video : t.image}</span>
                  </Badge>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t.delete}
                  </Button>
                </div>
                
                {/* Title */}
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  )}
                  <Badge variant="outline">
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaGallerySimple;
