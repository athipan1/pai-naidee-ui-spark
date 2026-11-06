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
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Check,
  AlertCircle,
  Info,
  Sparkles,
  Video,
  Camera
} from "lucide-react";

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

const VideoUpload: React.FC<VideoUploadProps> = ({
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
      title: "Create Your Travel Story",
      subtitle: "Share your amazing journey with the world! ✨",
      videoTitle: "Video Title",
      videoCaption: "Video Caption",
      location: "Location",
      province: "Province",
      tags: "Tags",
      addTag: "Add Tag",
      upload: "Share My Story",
      cancel: "Cancel",
      dragDropText: "Drop your video here or tap to select",
      supportedFormats: "MP4, MOV, AVI • Max 100MB • Best quality for amazing views!",
      titlePlaceholder: "Give your adventure a catchy title...",
      captionPlaceholder: "Tell everyone about this amazing place...",
      locationPlaceholder: "Where did you capture this moment?",
      provincePlaceholder: "Which province?",
      tagPlaceholder: "Add hashtags (press Enter)",
      uploading: "Creating your story...",
      uploadSuccess: "Your story is now live! 🎉",
      uploadError: "Oops! Something went wrong",
      invalidFile: "Please choose a video file (MP4, MOV, or AVI)",
      fileTooLarge: "Video too large! Please keep it under 100MB",
      fillRequired: "Please fill in the required details to share your story",
      videoPreview: "Preview Your Story",
      removeVideo: "Choose Different Video",
      playPause: "Play/Pause",
      muteUnmute: "Mute/Unmute",
      fileSize: "File Size",
      duration: "Duration",
      step1: "Step 1: Choose your video",
      step2: "Step 2: Add details",
      step3: "Step 3: Share with the world",
      tips: "💡 Tips for better reach:",
      tip1: "• Use eye-catching titles",
      tip2: "• Add relevant hashtags",
      tip3: "• Include location details",
      selectVideo: "Select Video",
      chooseFromDevice: "Choose from your device"
    },
    th: {
      title: "สร้างเรื่องราวการเดินทางของคุณ",
      subtitle: "แบ่งปันการผจญภัยสุดพิเศษกับทุกคน! ✨",
      videoTitle: "ชื่อวิดีโอ",
      videoCaption: "คำบรรยายวิดีโอ",
      location: "สถานที่",
      province: "จังหวัด",
      tags: "แท็ก",
      addTag: "เพิ่มแท็ก",
      upload: "แชร์เรื่องราวของฉัน",
      cancel: "ยกเลิก",
      dragDropText: "วางวิดีโอที่นี่ หรือแตะเพื่อเลือก",
      supportedFormats: "MP4, MOV, AVI • สูงสุด 100MB • คุณภาพดีที่สุดสำหรับมุมมองสุดงาม!",
      titlePlaceholder: "ตั้งชื่อการผจญภัยของคุณให้น่าสนใจ...",
      captionPlaceholder: "เล่าให้ทุกคนฟังเกี่ยวกับสถานที่สุดพิเศษนี้...",
      locationPlaceholder: "คุณถ่ายช่วงเวลานี้ที่ไหน?",
      provincePlaceholder: "จังหวัดไหน?",
      tagPlaceholder: "เพิ่มแฮชแท็ก (กด Enter)",
      uploading: "กำลังสร้างเรื่องราวของคุณ...",
      uploadSuccess: "เรื่องราวของคุณออนไลน์แล้ว! 🎉",
      uploadError: "อุ๊ปส์! มีอะไรผิดพลาด",
      invalidFile: "กรุณาเลือกไฟล์วิดีโอ (MP4, MOV หรือ AVI)",
      fileTooLarge: "วิดีโอใหญ่เกินไป! กรุณาใช้ไฟล์ไม่เกิน 100MB",
      fillRequired: "กรุณากรอกรายละเอียดที่จำเป็นเพื่อแชร์เรื่องราวของคุณ",
      videoPreview: "ดูตัวอย่างเรื่องราวของคุณ",
      removeVideo: "เลือกวิดีโออื่น",
      playPause: "เล่น/หยุด",
      muteUnmute: "เปิด/ปิดเสียง",
      fileSize: "ขนาดไฟล์",
      duration: "ความยาว",
      step1: "ขั้นตอน 1: เลือกวิดีโอของคุณ",
      step2: "ขั้นตอน 2: เพิ่มรายละเอียด",
      step3: "ขั้นตอน 3: แชร์กับโลก",
      tips: "💡 เคล็ดลับเพื่อการเข้าถึงที่ดีขึ้น:",
      tip1: "• ใช้ชื่อที่สะดุดตา",
      tip2: "• เพิ่มแฮชแท็กที่เกี่ยวข้อง",
      tip3: "• ระบุรายละเอียดสถานที่",
      selectVideo: "เลือกวิดีโอ",
      chooseFromDevice: "เลือกจากอุปกรณ์ของคุณ"
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
    } catch {
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent-yellow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {t.title}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {t.subtitle}
          </DialogDescription>
          
          {/* Step indicator */}
          <div className="flex items-center gap-4 mt-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${!videoFile ? 'bg-primary' : 'bg-green-500'}`} />
                <span className={!videoFile ? 'text-primary font-medium' : 'text-green-600'}>{t.step1}</span>
              </div>
              <span>→</span>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${videoFile && !isUploading ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                <span className={videoFile && !isUploading ? 'text-primary font-medium' : ''}>{t.step2}</span>
              </div>
              <span>→</span>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isUploading ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                <span className={isUploading ? 'text-primary font-medium' : ''}>{t.step3}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Upload Area */}
          <div className="space-y-4">
            {/* File Upload Area */}
            <div className="space-y-4">
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-primary bg-gradient-to-b from-primary/10 to-primary/5 scale-[1.02] shadow-lg shadow-primary/20'
                    : videoFile
                    ? 'border-green-500 bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-md'
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-gradient-to-b hover:from-muted/30 hover:to-muted/10 hover:shadow-md'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {!videoFile ? (
                  <div className="space-y-6">
                    <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary via-primary to-accent-yellow flex items-center justify-center shadow-lg">
                      <Video className="h-10 w-10 text-white" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent-yellow rounded-full flex items-center justify-center">
                        <Upload className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-foreground">{t.dragDropText}</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">{t.supportedFormats}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                      <Button
                        type="button"
                        size="lg"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gradient-to-r from-primary to-accent-yellow hover:from-primary/90 hover:to-accent-yellow/90 text-white font-medium px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      >
                        <Camera className="h-5 w-5 mr-2" />
                        {t.selectVideo}
                      </Button>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Info className="h-4 w-4" />
                        <span>{t.chooseFromDevice}</span>
                      </div>
                    </div>
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
                    <div className="flex items-center justify-center gap-3 text-green-600">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900">
                        <Check className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-lg">{videoFile.name}</p>
                        <p className="text-sm text-muted-foreground">{t.fileSize}: {formatFileSize(videoFile.size)}</p>
                      </div>
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
                      className="flex items-center gap-2 hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                      {t.removeVideo}
                    </Button>
                  </div>
                )}
              </div>

              {/* Tips section */}
              {!videoFile && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">{t.tips}</h4>
                  <div className="space-y-1 text-sm text-blue-700 dark:text-blue-200">
                    <p>{t.tip1}</p>
                    <p>{t.tip2}</p>
                    <p>{t.tip3}</p>
                  </div>
                </div>
              )}
            </div>

            {videoError && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm text-red-700 dark:text-red-300 font-medium">{videoError}</span>
              </div>
            )}

            {/* Video Preview */}
            {videoPreview && (
              <Card className="border-0 shadow-lg bg-gradient-to-b from-card to-muted/20">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg">{t.videoPreview}</h3>
                    </div>
                    <div className="relative bg-black rounded-xl overflow-hidden shadow-lg">
                      <video
                        ref={videoRef}
                        src={videoPreview}
                        className="w-full h-48 object-contain"
                        muted={isMuted}
                      />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            className="h-10 w-10 p-0 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0"
                            onClick={togglePlayPause}
                          >
                            {isPlaying ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white" />}
                          </Button>
                          <Button
                            size="sm"
                            className="h-10 w-10 p-0 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0"
                            onClick={toggleMute}
                          >
                            {isMuted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
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
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                {t.videoTitle} *
              </Label>
              <Input
                id="title"
                placeholder={t.titlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-2 focus:border-primary transition-all duration-200 focus:scale-[1.01] py-3 text-base rounded-xl"
              />
            </div>

            {/* Caption */}
            <div className="space-y-3">
              <Label htmlFor="caption" className="text-sm font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                {t.videoCaption} *
              </Label>
              <Textarea
                id="caption"
                placeholder={t.captionPlaceholder}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                className="border-2 focus:border-primary transition-all duration-200 focus:scale-[1.01] text-base rounded-xl resize-none"
              />
            </div>

            {/* Location */}
            <div className="space-y-3">
              <Label htmlFor="location" className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-500" />
                {t.location} *
              </Label>
              <Input
                id="location"
                placeholder={t.locationPlaceholder}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-2 focus:border-primary transition-all duration-200 focus:scale-[1.01] py-3 text-base rounded-xl"
              />
            </div>

            {/* Province */}
            <div className="space-y-3">
              <Label htmlFor="province" className="text-sm font-semibold">
                {t.province}
              </Label>
              <Input
                id="province"
                placeholder={t.provincePlaceholder}
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="border-2 focus:border-primary transition-all duration-200 focus:scale-[1.01] py-3 text-base rounded-xl"
              />
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label htmlFor="tags" className="text-sm font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                {t.tags}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder={t.tagPlaceholder}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  className="flex-1 border-2 focus:border-primary py-3 text-base rounded-xl"
                />
                <Button 
                  type="button" 
                  onClick={addTag} 
                  size="lg" 
                  variant="outline"
                  className="px-6 rounded-xl border-2 hover:border-primary hover:bg-primary/5"
                >
                  {t.addTag}
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors px-3 py-1 text-sm rounded-full bg-gradient-to-r from-primary/10 to-accent-yellow/10 text-primary hover:from-red-500 hover:to-red-600 hover:text-white"
                      onClick={() => removeTag(tag)}
                    >
                      #{tag}
                      <X className="h-3 w-3 ml-2" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-4 p-4 bg-gradient-to-r from-primary/5 to-accent-yellow/5 rounded-xl border border-primary/20">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="font-medium text-primary">{t.uploading}</span>
                  </div>
                  <span className="font-bold text-primary">{uploadProgress}%</span>
                </div>
                <Progress 
                  value={uploadProgress} 
                  className="h-3 bg-muted rounded-full overflow-hidden"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
            size="lg"
            className="px-8 py-3 rounded-full border-2 hover:border-muted-foreground/50"
          >
            {t.cancel}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!videoFile || !title.trim() || !caption.trim() || !location.trim() || isUploading}
            size="lg"
            className="min-w-[160px] px-8 py-3 rounded-full bg-gradient-to-r from-primary to-accent-yellow hover:from-primary/90 hover:to-accent-yellow/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
          >
            {isUploading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t.uploading}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5" />
                {t.upload}
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VideoUpload;