import { useState } from "react";
import { Upload, Play, Trash2, Edit, Eye, Calendar, MapPin, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface VideoPost {
  id: string;
  title: string;
  location: string;
  province: string;
  hashtags: string[];
  videoUrl: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  uploadedAt: string;
  status: "active" | "inactive" | "pending";
}

interface ExploreVideoManagementProps {
  currentLanguage: "th" | "en";
}

const ExploreVideoManagement = ({ currentLanguage }: ExploreVideoManagementProps) => {
  const [videos, setVideos] = useState<VideoPost[]>([
    {
      id: "1",
      title: "เกาะสวยน้ำใสที่เกาะพีพี",
      location: "เกาะพีพี",
      province: "กระบี่",
      hashtags: ["ทะเล", "เกาะ", "กระบี่", "พีพี"],
      videoUrl: "https://example.com/video1.mp4",
      thumbnail: "/src/shared/assets/hero-beach.jpg",
      views: 15420,
      likes: 1247,
      comments: 89,
      shares: 34,
      uploadedAt: "2024-01-15",
      status: "active"
    },
    {
      id: "2",
      title: "วัดสวยๆ ในเชียงใหม่",
      location: "วัดพระธาตุดอยสุเทพ",
      province: "เชียงใหม่",
      hashtags: ["วัด", "เชียงใหม่", "วัฒนธรรม", "ดอยสุเทพ"],
      videoUrl: "https://example.com/video2.mp4",
      thumbnail: "/src/shared/assets/temple-culture.jpg",
      views: 9830,
      likes: 892,
      comments: 67,
      shares: 23,
      uploadedAt: "2024-01-14",
      status: "active"
    }
  ]);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    province: "",
    hashtags: "",
    videoFile: null as File | null
  });

  const texts = {
    th: {
      title: "จัดการวิดีโอหน้าสำรวจ",
      subtitle: "เพิ่ม แก้ไข และจัดการวิดีโอในหน้าสำรวจ",
      uploadVideo: "อัปโหลดวิดีโอใหม่",
      videoList: "รายการวิดีโอ",
      upload: "อัปโหลด",
      title_field: "หัวข้อ",
      location_field: "สถานที่",
      province_field: "จังหวัด",
      hashtags_field: "แฮชแท็ก",
      videoFile: "ไฟล์วิดีโอ",
      save: "บันทึก",
      cancel: "ยกเลิก",
      edit: "แก้ไข",
      delete: "ลบ",
      preview: "ดูตัวอย่าง",
      views: "การดู",
      likes: "ถูกใจ",
      comments: "ความคิดเห็น",
      shares: "แชร์",
      status: "สถานะ",
      active: "ใช้งาน",
      inactive: "ไม่ใช้งาน",
      pending: "รอดำเนินการ",
      uploadedAt: "วันที่อัปโหลด",
      hashtagsPlaceholder: "แยกด้วยคอมมา เช่น ทะเล, เกาะ, กระบี่",
      selectVideo: "เลือกไฟล์วิดีโอ",
      uploadSuccess: "อัปโหลดวิดีโอสำเร็จ",
      updateSuccess: "อัปเดตวิดีโอสำเร็จ",
      deleteSuccess: "ลบวิดีโอสำเร็จ",
      confirmDelete: "คุณแน่ใจหรือไม่ที่จะลบวิดีโอนี้?"
    },
    en: {
      title: "Explore Video Management",
      subtitle: "Add, edit, and manage videos in the explore feed",
      uploadVideo: "Upload New Video",
      videoList: "Video List",
      upload: "Upload",
      title_field: "Title",
      location_field: "Location",
      province_field: "Province",
      hashtags_field: "Hashtags",
      videoFile: "Video File",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      preview: "Preview",
      views: "Views",
      likes: "Likes",
      comments: "Comments",
      shares: "Shares",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
      uploadedAt: "Upload Date",
      hashtagsPlaceholder: "Separate with commas, e.g. beach, island, krabi",
      selectVideo: "Select Video File",
      uploadSuccess: "Video uploaded successfully",
      updateSuccess: "Video updated successfully",
      deleteSuccess: "Video deleted successfully",
      confirmDelete: "Are you sure you want to delete this video?"
    }
  };

  const t = texts[currentLanguage];

  const handleUpload = () => {
    if (!formData.title || !formData.location || !formData.province || !formData.videoFile) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const newVideo: VideoPost = {
      id: Date.now().toString(),
      title: formData.title,
      location: formData.location,
      province: formData.province,
      hashtags: formData.hashtags.split(',').map(tag => tag.trim()).filter(Boolean),
      videoUrl: URL.createObjectURL(formData.videoFile),
      thumbnail: URL.createObjectURL(formData.videoFile),
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      uploadedAt: new Date().toISOString().split('T')[0],
      status: "active"
    };

    setVideos(prev => [newVideo, ...prev]);
    setFormData({ title: "", location: "", province: "", hashtags: "", videoFile: null });
    setShowUploadDialog(false);
    toast.success(t.uploadSuccess);
  };

  const handleEdit = (video: VideoPost) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      location: video.location,
      province: video.province,
      hashtags: video.hashtags.join(', '),
      videoFile: null
    });
  };

  const handleUpdate = () => {
    if (!editingVideo || !formData.title || !formData.location || !formData.province) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setVideos(prev => prev.map(video => 
      video.id === editingVideo.id 
        ? {
            ...video,
            title: formData.title,
            location: formData.location,
            province: formData.province,
            hashtags: formData.hashtags.split(',').map(tag => tag.trim()).filter(Boolean)
          }
        : video
    ));

    setEditingVideo(null);
    setFormData({ title: "", location: "", province: "", hashtags: "", videoFile: null });
    toast.success(t.updateSuccess);
  };

  const handleDelete = (videoId: string) => {
    if (confirm(t.confirmDelete)) {
      setVideos(prev => prev.filter(video => video.id !== videoId));
      toast.success(t.deleteSuccess);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-600" />
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
            {t.uploadVideo}
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {t.videoList}
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>{t.uploadVideo}</CardTitle>
              <CardDescription>อัปโหลดวิดีโอใหม่เพื่อแสดงในหน้าสำรวจ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t.title_field}</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="เช่น เกาะสวยน้ำใสที่เกาะพีพี"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">{t.location_field}</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="เช่น เกาะพีพี"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">{t.province_field}</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                    placeholder="เช่น กระบี่"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoFile">{t.videoFile}</Label>
                  <Input
                    id="videoFile"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setFormData(prev => ({ ...prev, videoFile: e.target.files?.[0] || null }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hashtags">{t.hashtags_field}</Label>
                <Input
                  id="hashtags"
                  value={formData.hashtags}
                  onChange={(e) => setFormData(prev => ({ ...prev, hashtags: e.target.value }))}
                  placeholder={t.hashtagsPlaceholder}
                />
              </div>
              <Button onClick={handleUpload} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                {t.upload}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video List Tab */}
        <TabsContent value="list">
          <div className="space-y-4">
            {videos.map((video) => (
              <Card key={video.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-32 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg">{video.title}</h3>
                        <Badge 
                          variant={video.status === 'active' ? 'default' : video.status === 'pending' ? 'secondary' : 'destructive'}
                        >
                          {video.status === 'active' ? t.active : video.status === 'pending' ? t.pending : t.inactive}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {video.location}, {video.province}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {video.uploadedAt}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {video.hashtags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Hash className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>{formatNumber(video.views)} {t.views}</span>
                        <span>{formatNumber(video.likes)} {t.likes}</span>
                        <span>{formatNumber(video.comments)} {t.comments}</span>
                        <span>{formatNumber(video.shares)} {t.shares}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(video)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(video.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingVideo} onOpenChange={() => setEditingVideo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.edit}</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลวิดีโอ</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">{t.title_field}</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">{t.location_field}</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-province">{t.province_field}</Label>
              <Input
                id="edit-province"
                value={formData.province}
                onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hashtags">{t.hashtags_field}</Label>
              <Input
                id="edit-hashtags"
                value={formData.hashtags}
                onChange={(e) => setFormData(prev => ({ ...prev, hashtags: e.target.value }))}
                placeholder={t.hashtagsPlaceholder}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVideo(null)}>
              {t.cancel}
            </Button>
            <Button onClick={handleUpdate}>
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExploreVideoManagement;