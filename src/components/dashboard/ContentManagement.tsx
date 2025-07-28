import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, Upload } from "lucide-react";
import MediaUpload from "./MediaUpload";
import MediaGallery from "./MediaGallery";
import { MediaItem, MediaUploadData } from "@/shared/types/media";

interface ContentManagementProps {
  currentLanguage: "th" | "en";
}

const ContentManagement = ({ currentLanguage }: ContentManagementProps) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    // Mock data for demonstration
    {
      id: "1",
      title: "Beautiful Beach Sunset",
      description: "A stunning sunset view from Railay Beach in Krabi, perfect for tourism promotion.",
      type: "image",
      url: "/api/placeholder/400/300",
      mimeType: "image/jpeg",
      size: 245760,
      uploadedAt: new Date("2024-01-15T10:30:00Z"),
      updatedAt: new Date("2024-01-15T10:30:00Z"),
      status: "pending"
    },
    {
      id: "2", 
      title: "Traditional Thai Dance",
      description: "A cultural performance showcasing traditional Thai dance at a local festival.",
      type: "video",
      url: "/api/placeholder/video",
      mimeType: "video/mp4",
      size: 15728640,
      uploadedAt: new Date("2024-01-14T15:45:00Z"),
      updatedAt: new Date("2024-01-14T15:45:00Z"),
      status: "approved",
      approvedBy: "admin@example.com",
      approvedAt: new Date("2024-01-14T16:00:00Z")
    },
    {
      id: "3",
      title: "Local Market Guide",
      description: "Complete guide to the weekend floating market including the best food stalls and shopping tips. This market operates every Saturday and Sunday from 6 AM to 2 PM.",
      type: "text",
      uploadedAt: new Date("2024-01-13T09:20:00Z"),
      updatedAt: new Date("2024-01-13T14:30:00Z"),
      status: "approved",
      approvedBy: "editor@example.com",
      approvedAt: new Date("2024-01-13T15:00:00Z")
    },
    {
      id: "4",
      title: "Temple Architecture",
      description: "Historic temple showcasing ancient architectural details and intricate carvings.",
      type: "image", 
      url: "/api/placeholder/400/300",
      mimeType: "image/png",
      size: 892416,
      uploadedAt: new Date("2024-01-12T11:15:00Z"),
      updatedAt: new Date("2024-01-12T11:15:00Z"),
      status: "rejected",
      rejectionReason: "Image quality is too low for publication standards"
    },
    {
      id: "5",
      title: "Street Food Tour",
      description: "Virtual tour of Bangkok's famous street food scene with detailed descriptions.",
      type: "video",
      url: "/api/placeholder/video",
      mimeType: "video/mp4", 
      size: 25165824,
      uploadedAt: new Date("2024-01-10T08:00:00Z"),
      updatedAt: new Date("2024-01-10T08:00:00Z"),
      status: "draft"
    }
  ]);

  const texts = {
    en: {
      title: "Content Management",
      subtitle: "Upload and manage media content for the application",
      upload: "Upload Content",
      gallery: "Media Gallery",
      uploadDescription: "Add new images, videos, or text content",
      galleryDescription: "View and manage existing content"
    },
    th: {
      title: "การจัดการเนื้อหา", 
      subtitle: "อัปโหลดและจัดการเนื้อหาสื่อสำหรับแอปพลิเคชัน",
      upload: "อัปโหลดเนื้อหา",
      gallery: "แกลเลอรีสื่อ",
      uploadDescription: "เพิ่มรูปภาพ วิดีโอ หรือเนื้อหาข้อความใหม่",
      galleryDescription: "ดูและจัดการเนื้อหาที่มีอยู่"
    }
  };

  const t = texts[currentLanguage];

  const handleUpload = (data: MediaUploadData) => {
    const newItem: MediaItem = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      type: data.type,
      file: data.file,
      mimeType: data.file?.type,
      size: data.file?.size,
      url: data.file ? URL.createObjectURL(data.file) : undefined,
      uploadedAt: new Date(),
      updatedAt: new Date(),
      status: "pending"
    };

    setMediaItems(prev => [newItem, ...prev]);
  };

  const handleEdit = (id: string, updates: Partial<MediaItem>) => {
    setMediaItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, ...updates, updatedAt: new Date() }
          : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  const handleApprove = (id: string) => {
    setMediaItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: "approved" as const,
              approvedBy: "current-admin@example.com",
              approvedAt: new Date(),
              updatedAt: new Date()
            }
          : item
      )
    );
  };

  const handleReject = (id: string, reason: string) => {
    setMediaItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: "rejected" as const,
              rejectionReason: reason,
              updatedAt: new Date()
            }
          : item
      )
    );
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