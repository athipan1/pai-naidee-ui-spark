import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, Upload } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import MediaUpload from "./MediaUpload";
import MediaGallery from "./MediaGallery";
import { MediaItem, MediaUploadData } from "@/shared/types/media";

interface ContentManagementProps {
  currentLanguage: "th" | "en";
}

const ContentManagement = ({ currentLanguage }: ContentManagementProps) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const { toast } = useToast();

  const texts = {
    en: {
      title: "Content Management",
      subtitle: "Upload and manage media content",
      upload: "Upload Content",
      gallery: "Media Gallery",
      uploadDescription: "Add new images, videos, or text content",
      galleryDescription: "View and manage existing content",
      uploadSuccess: "Content uploaded successfully!",
      uploadError: "Failed to upload content. Please try again."
    },
    th: {
      title: "การจัดการเนื้อหา",
      subtitle: "อัปโหลดและจัดการเนื้อหาสื่อ",
      upload: "อัปโหลดเนื้อหา",
      gallery: "แกลเลอรี่สื่อ",
      uploadDescription: "เพิ่มรูปภาพ วิดีโอ หรือเนื้อหาข้อความใหม่",
      galleryDescription: "ดูและจัดการเนื้อหาที่มีอยู่",
      uploadSuccess: "อัปโหลดเนื้อหาสำเร็จ!",
      uploadError: "ไม่สามารถอัปโหลดเนื้อหาได้ กรุณาลองใหม่อีกครั้ง"
    }
  };

  const t = texts[currentLanguage];

  const handleUpload = async (data: MediaUploadData) => {
    try {
      const newItem: MediaItem = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        type: data.type,
        url: data.file ? URL.createObjectURL(data.file) : undefined,
        file: data.file,
        uploadedAt: new Date(),
        updatedAt: new Date(),
        status: 'pending',
        createdBy: 'admin',
        accessPermissions: [],
        version: 1,
        isCurrentVersion: true,
        securityLevel: data.securityLevel || 'PUBLIC' as any
      };
      
      setMediaItems(prev => [newItem, ...prev]);
      
      toast({
        title: "Success",
        description: t.uploadSuccess
      });
    } catch (error) {
      toast({
        title: "Error",
        description: t.uploadError,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (id: string, data: Partial<MediaItem>) => {
    setMediaItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...data, updatedAt: new Date() } : item
    ));
    toast({ title: "Success", description: "Content updated" });
  };

  const handleDelete = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
    toast({ title: "Success", description: "Content deleted" });
  };

  const handleApprove = (id: string) => {
    setMediaItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'approved', approvedAt: new Date() } : item
    ));
    toast({ title: "Success", description: "Content approved" });
  };

  const handleReject = (id: string, reason: string) => {
    setMediaItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'rejected', rejectionReason: reason } : item
    ));
    toast({ title: "Success", description: "Content rejected" });
  };

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
          <MediaUpload 
            currentLanguage={currentLanguage}
            onUpload={handleUpload}
          />
        </TabsContent>

        <TabsContent value="gallery">
          <MediaGallery 
            currentLanguage={currentLanguage}
            mediaItems={mediaItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;