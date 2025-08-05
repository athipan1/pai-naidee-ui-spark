import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, Upload } from "lucide-react";
// import MediaUpload from "./MediaUpload";
// import MediaGallery from "./MediaGallery";
// import { MediaItem, MediaUploadData, SecurityLevel } from "@/shared/types/media";

interface ContentManagementProps {
  currentLanguage: "th" | "en";
}

const ContentManagement = ({ currentLanguage }: ContentManagementProps) => {
  // const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const texts = {
    en: {
      title: "Content Management",
      subtitle: "Upload and manage media content",
      upload: "Upload Content",
      gallery: "Media Gallery",
      uploadDescription: "Add new images, videos, or text content",
      galleryDescription: "View and manage existing content",
      comingSoon: "This feature is coming soon. Full media management capabilities will be available in the next update."
    },
    th: {
      title: "การจัดการเนื้อหา",
      subtitle: "อัปโหลดและจัดการเนื้อหาสื่อ",
      upload: "อัปโหลดเนื้อหา",
      gallery: "แกลเลอรี่สื่อ",
      uploadDescription: "เพิ่มรูปภาพ วิดีโอ หรือเนื้อหาข้อความใหม่",
      galleryDescription: "ดูและจัดการเนื้อหาที่มีอยู่",
      comingSoon: "ฟีเจอร์นี้จะมาเร็วๆ นี้ ความสามารถในการจัดการสื่อแบบเต็มรูปแบบจะพร้อมใช้งานในการอัปเดตครั้งถัดไป"
    }
  };

  const t = texts[currentLanguage];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-blue-600" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {t.upload}
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            {t.gallery}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>{t.upload}</CardTitle>
              <CardDescription>{t.uploadDescription}</CardDescription>
            </CardHeader>
            <CardDescription className="p-6 text-center text-muted-foreground">
              {t.comingSoon}
            </CardDescription>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          <Card>
            <CardHeader>
              <CardTitle>{t.gallery}</CardTitle>
              <CardDescription>{t.galleryDescription}</CardDescription>
            </CardHeader>
            <CardDescription className="p-6 text-center text-muted-foreground">
              {t.comingSoon}
            </CardDescription>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;