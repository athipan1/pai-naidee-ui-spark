import { useState, useRef } from "react";
import { Upload, X, Plus, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface VideoUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVideoUpload: (videoData: {
    videoFile: File;
    caption: string;
    tags: string[];
    title: string;
    location: string;
    province: string;
  }) => void;
  currentLanguage: "th" | "en";
}

const VideoUpload = ({
  open,
  onOpenChange,
  onVideoUpload,
  currentLanguage,
}: VideoUploadProps) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [province, setProvince] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const content = {
    th: {
      uploadVideo: "อัปโหลดวิดีโอ",
      selectVideo: "เลือกวิดีโอ",
      uploadVideoFile: "อัปโหลดไฟล์วิดีโอ",
      chooseFile: "เลือกไฟล์",
      dragDrop: "หรือลากไฟล์มาวางที่นี่",
      supportedFormats: "รองรับ MP4, AVI, MOV (สูงสุด 100MB)",
      videoPreview: "ตัวอย่างวิดีโอ",
      videoTitle: "หัวข้อวิดีโอ",
      videoTitlePlaceholder: 'เช่น "ทะเลใสสวยที่เกาะพีพี"',
      caption: "คำบรรยาย",
      captionPlaceholder: "เขียนคำบรรยายเกี่ยวกับวิดีโอของคุณ...",
      location: "สถานที่",
      locationPlaceholder: 'เช่น "เกาะพีพี"',
      province: "จังหวัด",
      provincePlaceholder: 'เช่น "กระบี่"',
      tags: "แท็ก",
      addTag: "เพิ่มแท็ก",
      tagPlaceholder: "พิมพ์แท็กและกด Enter",
      tagHint: "เพิ่มแท็กที่เกี่ยวข้องเพื่อให้ผู้อื่นค้นหาได้ง่าย",
      cancel: "ยกเลิก",
      upload: "อัปโหลด",
      uploading: "กำลังอัปโหลด...",
      fillRequired: "กรุณากรอกข้อมูลที่จำเป็น",
      maxTags: "สามารถเพิ่มได้สูงสุด 10 แท็ก",
    },
    en: {
      uploadVideo: "Upload Video",
      selectVideo: "Select Video",
      uploadVideoFile: "Upload Video File",
      chooseFile: "Choose File",
      dragDrop: "or drag and drop here",
      supportedFormats: "Supports MP4, AVI, MOV (max 100MB)",
      videoPreview: "Video Preview",
      videoTitle: "Video Title",
      videoTitlePlaceholder: 'e.g. "Beautiful clear sea at Phi Phi Island"',
      caption: "Caption",
      captionPlaceholder: "Write a caption about your video...",
      location: "Location",
      locationPlaceholder: 'e.g. "Phi Phi Island"',
      province: "Province",
      provincePlaceholder: 'e.g. "Krabi"',
      tags: "Tags",
      addTag: "Add Tag",
      tagPlaceholder: "Type tag and press Enter",
      tagHint: "Add relevant tags to help others find your video",
      cancel: "Cancel",
      upload: "Upload",
      uploading: "Uploading...",
      fillRequired: "Please fill in required fields",
      maxTags: "Maximum 10 tags allowed",
    },
  };

  const t = content[currentLanguage];

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const addTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag) && tags.length < 10) {
      setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleUpload = async () => {
    if (
      !videoFile ||
      !title.trim() ||
      !caption.trim() ||
      !location.trim() ||
      !province.trim()
    ) {
      alert(t.fillRequired);
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      onVideoUpload({
        videoFile,
        caption: caption.trim(),
        tags,
        title: title.trim(),
        location: location.trim(),
        province: province.trim(),
      });

      // Reset form
      resetForm();
      onOpenChange(false);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setVideoFile(null);
    setVideoPreview("");
    setCaption("");
    setTitle("");
    setLocation("");
    setProvince("");
    setTags([]);
    setTagInput("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {t.uploadVideo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Upload Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t.uploadVideoFile}</Label>

            {!videoFile ? (
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <Button variant="outline" type="button">
                    <Upload className="w-4 h-4 mr-2" />
                    {t.chooseFile}
                  </Button>
                  <p className="text-sm text-muted-foreground">{t.dragDrop}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.supportedFormats}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoPreview("");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.videoPreview}
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Video Details Form */}
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                {t.videoTitle} *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.videoTitlePlaceholder}
                maxLength={100}
              />
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="caption" className="text-sm font-medium">
                {t.caption} *
              </Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={t.captionPlaceholder}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {caption.length}/500
              </p>
            </div>

            {/* Location & Province */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  {t.location} *
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t.locationPlaceholder}
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province" className="text-sm font-medium">
                  {t.province} *
                </Label>
                <Input
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder={t.provincePlaceholder}
                  maxLength={50}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t.tags}</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder={t.tagPlaceholder}
                  disabled={tags.length >= 10}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  disabled={!tagInput.trim() || tags.length >= 10}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      #{tag}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-4 h-4 p-0 hover:bg-transparent"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {t.tagHint} ({tags.length}/10)
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            {t.cancel}
          </Button>
          <Button onClick={handleUpload} disabled={isUploading || !videoFile}>
            {isUploading ? t.uploading : t.upload}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VideoUpload;
