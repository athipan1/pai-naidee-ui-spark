import React, { useState, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/shared/hooks/use-toast";
import { 
  Upload, 
  X, 
  MapPin, 
  Tag, 
  FileVideo, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
  AlertCircle
} from "lucide-react";

interface VideoUploadEnhancedProps {
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

const VideoUploadEnhanced: React.FC<VideoUploadEnhancedProps> = ({
  open,
  onOpenChange,
  onVideoUpload,
  currentLanguage
}) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [province, setProvince] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const texts = {
    en: {
      title: "Upload Video",
      subtitle: "Share your travel experience",
      videoTitle: "Video Title",
      videoCaption: "Video Caption",
      location: "Location",
      province: "Province",
      tags: "Tags",
      addTag: "Add Tag",
      upload: "Upload Video",
      cancel: "Cancel",
      dragDropText: "Drag and drop your video here or click to browse",
      supportedFormats: "Supported formats: MP4, MOV, AVI (max 100MB)",
      titlePlaceholder: "Enter video title...",
      captionPlaceholder: "Describe your video...",
      locationPlaceholder: "Where was this taken?",
      provincePlaceholder: "Select province...",
      tagPlaceholder: "Add tags (press Enter)",
      uploading: "Uploading...",
      uploadSuccess: "Video uploaded successfully!",
      uploadError: "Failed to upload video",
      invalidFile: "Please select a valid video file",
      fileTooLarge: "File size must be less than 100MB",
      fillRequired: "Please fill in all required fields",
      videoPreview: "Video Preview",
      removeVideo: "Remove Video",
      playPause: "Play/Pause",
      muteUnmute: "Mute/Unmute",
      reset: "Reset",
      fileSize: "File Size",
      duration: "Duration"
    },
    th: {
      title: "อัปโหลดวิดีโอ",
      subtitle: "แบ่งปันประสบการณ์การท่องเที่ยวของคุณ",
      videoTitle: "ชื่อวิดีโอ",
      videoCaption: "คำบรรยายวิดีโอ",
      location: "สถานที่",
      province: "จังหวัด",
      tags: "แท็ก",
      addTag: "เพิ่มแท็ก",
      upload: "อัปโหลดวิดีโอ",
      cancel: "ยกเลิก",
      dragDropText: "ลากและวางวิดีโอที่นี่ หรือคลิกเพื่อเลือกไฟล์",
      supportedFormats: "รูปแบบที่รองรับ: MP4, MOV, AVI (ไม่เกิน 100MB)",
      titlePlaceholder: "ใส่ชื่อวิดีโอ...",
      captionPlaceholder: "อธิบายเกี่ยวกับวิดีโอของคุณ...",
      locationPlaceholder: "วิดีโอนี้ถ่ายที่ไหน?",
      provincePlaceholder: "เลือกจังหวัด...",
      tagPlaceholder: "เพิ่มแท็ก (กด Enter)",
      uploading: "กำลังอัปโหลด...",
      uploadSuccess: "อัปโหลดวิดีโอสำเร็จ!",
      uploadError: "ไม่สามารถอัปโหลดวิดีโอได้",
      invalidFile: "กรุณาเลือกไฟล์วิดีโอที่ถูกต้อง",
      fileTooLarge: "ขนาดไฟล์ต้องไม่เกิน 100MB",
      fillRequired: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน",
      videoPreview: "ตัวอย่างวิดีโอ",
      removeVideo: "ลบวิดีโอ",
      playPause: "เล่น/หยุด",
      muteUnmute: "เปิด/ปิดเสียง",
      reset: "รีเซ็ต",
      fileSize: "ขนาดไฟล์",
      duration: "ความยาว"
    }
  };

  const t = texts[currentLanguage];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateFile = (file: File) => {
    const validTypes = ['video/mp4', 'video/mov', 'video/quicktime', 'video/avi'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!validTypes.includes(file.type)) {
      setVideoError(t.invalidFile);
      return false;
    }

    if (file.size > maxSize) {
      setVideoError(t.fileTooLarge);
      return false;
    }

    setVideoError("");
    return true;
  };

  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      setVideoError("");
    }
  }, [t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const addTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 10) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  }, [tagInput, tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }, [tags]);

  const handleTagKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }, [addTag]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const resetForm = useCallback(() => {
    setVideoFile(null);
    setVideoPreview("");
    setCaption("");
    setTitle("");
    setLocation("");
    setProvince("");
    setTags([]);
    setTagInput("");
    setIsUploading(false);
    setUploadProgress(0);
    setVideoError("");
    setIsPlaying(false);
    setIsMuted(true);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!videoFile || !title.trim() || !caption.trim() || !location.trim()) {
      toast({
        title: "Error",
        description: t.fillRequired,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(interval);
      setUploadProgress(100);

      await onVideoUpload({
        videoFile,
        caption: caption.trim(),
        tags,
        title: title.trim(),
        location: location.trim(),
        province: province.trim()
      });

      toast({
        title: "Success",
        description: t.uploadSuccess
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: t.uploadError,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [videoFile, title, caption, location, province, tags, onVideoUpload, resetForm, onOpenChange, t]);

  const handleClose = useCallback(() => {
    if (!isUploading) {
      resetForm();
      onOpenChange(false);
    }
  }, [isUploading, resetForm, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileVideo className="h-5 w-5 text-primary" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.subtitle}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Upload Area */}
          <div className="space-y-4">
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-primary bg-primary/5 scale-105'
                  : videoFile
                  ? 'border-green-500 bg-green-50 dark:bg-green-950'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {!videoFile ? (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{t.dragDropText}</p>
                    <p className="text-sm text-muted-foreground mt-2">{t.supportedFormats}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Browse Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/mov,video/quicktime,video/avi"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">{videoFile.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{t.fileSize}: {formatFileSize(videoFile.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoPreview("");
                      setVideoError("");
                    }}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    {t.removeVideo}
                  </Button>
                </div>
              )}
            </div>

            {videoError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{videoError}</span>
              </div>
            )}

            {/* Video Preview */}
            {videoPreview && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <h3 className="font-medium">{t.videoPreview}</h3>
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        src={videoPreview}
                        className="w-full h-48 object-contain"
                        muted={isMuted}
                        onLoadedMetadata={() => {
                          if (videoRef.current) {
                            console.log("Duration:", formatDuration(videoRef.current.duration));
                          }
                        }}
                      />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={togglePlayPause}
                            className="h-8 w-8 p-0"
                          >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={toggleMute}
                            className="h-8 w-8 p-0"
                          >
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Form Fields */}
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                {t.videoTitle} *
              </Label>
              <Input
                id="title"
                placeholder={t.titlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="caption" className="text-sm font-medium">
                {t.videoCaption} *
              </Label>
              <Textarea
                id="caption"
                placeholder={t.captionPlaceholder}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t.location} *
              </Label>
              <Input
                id="location"
                placeholder={t.locationPlaceholder}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>

            {/* Province */}
            <div className="space-y-2">
              <Label htmlFor="province" className="text-sm font-medium">
                {t.province}
              </Label>
              <Input
                id="province"
                placeholder={t.provincePlaceholder}
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {t.tags}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder={t.tagPlaceholder}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} size="sm" variant="outline">
                  {t.addTag}
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{t.uploading}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            {t.cancel}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!videoFile || !title.trim() || !caption.trim() || !location.trim() || isUploading}
            className="min-w-[120px]"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t.uploading}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {t.upload}
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VideoUploadEnhanced;