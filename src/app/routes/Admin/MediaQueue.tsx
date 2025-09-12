import { useState } from "react";
import { Video, Play, Eye, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/shared/contexts/LanguageProvider";

interface MediaItem {
  id: string;
  type: "video" | "image";
  title: string;
  status: "pending" | "processing" | "approved" | "rejected";
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
  duration?: string;
  thumbnail: string;
}

const MediaQueue = () => {
  const { language } = useLanguage();
  const [selectedTab, setSelectedTab] = useState("all");

  const content = {
    th: {
      title: "คิวจัดการสื่อ",
      subtitle: "จัดการและตรวจสอบเนื้อหาที่อัปโหลด",
      all: "ทั้งหมด",
      pending: "รอดำเนินการ",
      processing: "กำลังประมวลผล",
      approved: "อนุมัติแล้ว",
      rejected: "ปฏิเสธ",
      approve: "อนุมัติ",
      reject: "ปฏิเสธ",
      preview: "ดูตัวอย่าง",
      uploadedBy: "อัปโหลดโดย",
      fileSize: "ขนาดไฟล์",
      duration: "ระยะเวลา",
      noItems: "ไม่มีรายการ",
      viewDetails: "ดูรายละเอียด"
    },
    en: {
      title: "Media Queue",
      subtitle: "Manage and review uploaded content",
      all: "All",
      pending: "Pending",
      processing: "Processing",
      approved: "Approved",
      rejected: "Rejected",
      approve: "Approve",
      reject: "Reject",
      preview: "Preview",
      uploadedBy: "Uploaded by",
      fileSize: "File Size",
      duration: "Duration",
      noItems: "No items",
      viewDetails: "View Details"
    }
  };

  const t = content[language];

  // Mock data - in real app this would come from API
  const mediaItems: MediaItem[] = [
    {
      id: "1",
      type: "video",
      title: "Beautiful Phi Phi Islands Sunset",
      status: "pending",
      uploadedBy: "user123",
      uploadedAt: "2024-01-15T10:30:00Z",
      fileSize: "25.6 MB",
      duration: "2:34",
      thumbnail: "/src/shared/assets/hero-beach.jpg"
    },
    {
      id: "2",
      type: "video",
      title: "Temple Tour in Bangkok",
      status: "processing",
      uploadedBy: "traveler456",
      uploadedAt: "2024-01-15T09:15:00Z",
      fileSize: "42.1 MB",
      duration: "4:12",
      thumbnail: "/src/shared/assets/temple-culture.jpg"
    },
    {
      id: "3",
      type: "video",
      title: "Mountain Hiking Adventure",
      status: "approved",
      uploadedBy: "hiker789",
      uploadedAt: "2024-01-14T16:45:00Z",
      fileSize: "38.9 MB",
      duration: "3:56",
      thumbnail: "/src/shared/assets/mountain-nature.jpg"
    },
    {
      id: "4",
      type: "video",
      title: "Street Food Experience",
      status: "rejected",
      uploadedBy: "foodie101",
      uploadedAt: "2024-01-14T14:20:00Z",
      fileSize: "15.2 MB",
      duration: "1:48",
      thumbnail: "/src/shared/assets/floating-market.jpg"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "processing":
        return <Play className="w-4 h-4 text-blue-600" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredItems = selectedTab === "all" 
    ? mediaItems 
    : mediaItems.filter(item => item.status === selectedTab);

  const handleApprove = (id: string) => {
    // TODO: Implement approve functionality
    console.log("Approving item:", id);
  };

  const handleReject = (id: string) => {
    // TODO: Implement reject functionality  
    console.log("Rejecting item:", id);
  };

  const handlePreview = (id: string) => {
    // TODO: Implement preview functionality
    console.log("Previewing item:", id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === "th" ? "th-TH" : "en-US",
      { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Status Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">{t.all}</TabsTrigger>
          <TabsTrigger value="pending">{t.pending}</TabsTrigger>
          <TabsTrigger value="processing">{t.processing}</TabsTrigger>
          <TabsTrigger value="approved">{t.approved}</TabsTrigger>
          <TabsTrigger value="rejected">{t.rejected}</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t.noItems}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Thumbnail */}
                      <div className="relative w-24 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                        {item.duration && (
                          <div className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 rounded">
                            {item.duration}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{item.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <span>{t.uploadedBy}: {item.uploadedBy}</span>
                              <span>{t.fileSize}: {item.fileSize}</span>
                              <span>{formatDate(item.uploadedAt)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Badge className={getStatusColor(item.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(item.status)}
                                <span>{t[item.status as keyof typeof t] || item.status}</span>
                              </div>
                            </Badge>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(item.id)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>{t.preview}</span>
                          </Button>

                          {item.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(item.id)}
                                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>{t.approve}</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(item.id)}
                                className="flex items-center space-x-1"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>{t.reject}</span>
                              </Button>
                            </>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => console.log("View details:", item.id)}
                            className="flex items-center space-x-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>{t.viewDetails}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediaQueue;