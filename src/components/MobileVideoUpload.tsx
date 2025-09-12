import React, { useState, useCallback, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/shared/hooks/use-toast";
import { 
  Upload, 
  X, 
  Play, 
  Pause,
  AlertCircle,
  Video,
  Camera,
  Smartphone,
  Wifi,
  WifiOff,
  RotateCw,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
  FileVideo,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown
} from "lucide-react";

import { chunkUploadService, UploadProgress } from "@/shared/services/chunkUploadService";
import { useLanguage } from "@/shared/contexts/LanguageProvider";

interface VideoFile {
  id: string;
  file: File;
  preview: string;
  progress?: UploadProgress;
  title: string;
  caption: string;
  location: string;
  province: string;
  tags: string[];
}

interface MobileVideoUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVideosUpload: (videos: VideoFile[]) => void;
}

const MobileVideoUpload: React.FC<MobileVideoUploadProps> = ({
  open,
  onOpenChange,
  onVideosUpload,
}) => {
  const { language } = useLanguage();
  // File management states
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Form states
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [tagInput, setTagInput] = useState("");
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: UploadProgress }>({});
  const [videoError, setVideoError] = useState<string>("");
  
  // UI states
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [previewingFile, setPreviewingFile] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const texts = {
    en: {
      title: "Mobile Video Upload",
      subtitle: "Upload multiple travel videos with smart chunk upload & resume ✨",
      addVideos: "Add Videos",
      selectVideos: "Select Videos",
      chooseFromDevice: "Choose from your device",
      dragDrop: "Drag & drop videos or tap to select",
      supportedFormats: "MP4, MOV, AVI • Max 100MB each • Multiple files supported",
      multipleFiles: "Multiple files supported - upload your entire journey!",
      videoTitle: "Video Title",
      videoCaption: "Caption",
      location: "Location",
      province: "Province", 
      tags: "Tags",
      addTag: "Add",
      upload: "Upload All",
      cancel: "Cancel",
      remove: "Remove",
      preview: "Preview",
      edit: "Edit Details",
      moveUp: "Move Up",
      moveDown: "Move Down",
      titlePlaceholder: "Enter video title...",
      captionPlaceholder: "Describe your video...",
      locationPlaceholder: "Where was this taken?",
      provincePlaceholder: "Province/State",
      tagPlaceholder: "Add tags",
      uploading: "Uploading videos...",
      uploadSuccess: "All videos uploaded successfully! 🎉",
      uploadError: "Some videos failed to upload",
      invalidFile: "Invalid video file format",
      fileTooLarge: "File too large (max 100MB)",
      fillRequired: "Please fill in required details for all videos",
      noFiles: "No videos selected",
      fileDetails: "File Details",
      fileName: "File Name",
      fileSize: "Size",
      duration: "Duration",
      status: "Status",
      pending: "Pending",
      uploadingStatus: "Uploading",
      completed: "Completed",
      error: "Error",
      paused: "Paused",
      resume: "Resume",
      pause: "Pause",
      retry: "Retry",
      online: "Online",
      offline: "Offline - Uploads will resume when connected",
      chunkUpload: "Smart Upload",
      chunkUploadDesc: "Files are uploaded in small chunks for reliability",
      resumeUpload: "Resume Support", 
      resumeUploadDesc: "Interrupted uploads will resume automatically",
      multiUpload: "Multi-Upload",
      multiUploadDesc: "Upload multiple videos simultaneously",
      mobileOptimized: "Mobile Optimized",
      mobileOptimizedDesc: "Touch-friendly interface designed for mobile devices",
      progress: "Progress",
      remainingTime: "Remaining",
      speed: "Speed",
      totalProgress: "Total Progress"
    },
    th: {
      title: "อัปโหลดวิดีโอมือถือ",
      subtitle: "อัปโหลดวิดีโอท่องเที่ยวหลายไฟล์ด้วยระบบแบ่งส่วนอัจฉริยะ ✨",
      addVideos: "เพิ่มวิดีโอ",
      selectVideos: "เลือกวิดีโอ",
      chooseFromDevice: "เลือกจากอุปกรณ์ของคุณ",
      dragDrop: "ลากวางหรือแตะเพื่อเลือกวิดีโอ",
      supportedFormats: "MP4, MOV, AVI • สูงสุด 100MB ต่อไฟล์ • รองรับหลายไฟล์",
      multipleFiles: "รองรับหลายไฟล์ - อัปโหลดทริปทั้งหมดของคุณ!",
      videoTitle: "ชื่อวิดีโอ",
      videoCaption: "คำบรรยาย",
      location: "สถานที่",
      province: "จังหวัด",
      tags: "แท็ก",
      addTag: "เพิ่ม",
      upload: "อัปโหลดทั้งหมด",
      cancel: "ยกเลิก",
      remove: "ลบ",
      preview: "ดูตัวอย่าง",
      edit: "แก้ไขรายละเอียด",
      moveUp: "ย้ายขึ้น",
      moveDown: "ย้ายลง",
      titlePlaceholder: "ใส่ชื่อวิดีโอ...",
      captionPlaceholder: "อธิบายวิดีโอของคุณ...",
      locationPlaceholder: "ถ่ายที่ไหน?",
      provincePlaceholder: "จังหวัด/รัฐ",
      tagPlaceholder: "เพิ่มแท็ก",
      uploading: "กำลังอัปโหลดวิดีโอ...",
      uploadSuccess: "อัปโหลดวิดีโอทั้งหมดสำเร็จ! 🎉",
      uploadError: "วิดีโอบางไฟล์อัปโหลดไม่สำเร็จ",
      invalidFile: "รูปแบบไฟล์วิดีโอไม่ถูกต้อง",
      fileTooLarge: "ไฟล์ใหญ่เกินไป (สูงสุด 100MB)",
      fillRequired: "กรุณากรอกรายละเอียดที่จำเป็นสำหรับทุกวิดีโอ",
      noFiles: "ไม่ได้เลือกวิดีโอ",
      fileDetails: "รายละเอียดไฟล์",
      fileName: "ชื่อไฟล์",
      fileSize: "ขนาด",
      duration: "ความยาว",
      status: "สถานะ",
      pending: "รอการอัปโหลด",
      uploadingStatus: "กำลังอัปโหลด",
      completed: "เสร็จสิ้น",
      error: "ข้อผิดพลาด",
      paused: "หยุดชั่วคราว",
      resume: "ดำเนินการต่อ",
      pause: "หยุด",
      retry: "ลองใหม่",
      online: "ออนไลน์",
      offline: "ออฟไลน์ - จะดำเนินการต่อเมื่อเชื่อมต่ออีกครั้ง",
      chunkUpload: "อัปโหลดอัจฉริยะ",
      chunkUploadDesc: "แบ่งไฟล์เป็นส่วนเล็กๆ เพื่อความเสถียร",
      resumeUpload: "รองรับการดำเนินการต่อ", 
      resumeUploadDesc: "การอัปโหลดที่ขัดจังหวะจะดำเนินการต่อโดยอัตโนมัติ",
      multiUpload: "อัปโหลดหลายไฟล์",
      multiUploadDesc: "อัปโหลดวิดีโอหลายไฟล์พร้อมกัน",
      mobileOptimized: "เหมาะสำหรับมือถือ",
      mobileOptimizedDesc: "ส่วนติดต่อผู้ใช้ที่เป็นมิตรกับการสัมผัสสำหรับมือถือ",
      progress: "ความคืบหน้า",
      remainingTime: "เวลาที่เหลือ",
      speed: "ความเร็ว",
      totalProgress: "ความคืบหน้าทั้งหมด"
    }
  };

  const t = texts[language];

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize progress callbacks
  useEffect(() => {
    videoFiles.forEach(video => {
      chunkUploadService.setProgressCallback(video.id, (progress) => {
        setUploadProgress(prev => ({
          ...prev,
          [video.id]: progress
        }));
      });
    });

    return () => {
      videoFiles.forEach(video => {
        chunkUploadService.removeProgressCallback(video.id);
      });
    };
  }, [videoFiles]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
      handleFileSelect(files, 'video');
    }
  };

  const handleCameraCapture = (file: File) => {
    handleFileSelect(new DataTransfer().files, 'image');
    const mediaFile: MediaFile = {
      id: generateVideoId(file),
      file,
      type: 'image',
      preview: URL.createObjectURL(file)
    };
    setVideoFiles(prev => [...prev, mediaFile]);
    if (videoFiles.length === 0) {
      setSelectedFileIndex(0);
    }
  };

  const removeVideo = (videoId: string) => {
    setVideoFiles(prev => {
      const video = prev.find(v => v.id === videoId);
      if (video) {
        URL.revokeObjectURL(video.preview);
        chunkUploadService.cancelUpload(videoId);
      }
      return prev.filter(v => v.id !== videoId);
    });
    
    setUploadProgress(prev => {
      const { [videoId]: _removed, ...rest } = prev;
      return rest;
    });

    if (expandedFile === videoId) {
      setExpandedFile(null);
    }
    if (previewingFile === videoId) {
      setPreviewingFile(null);
    }
  };

  const moveVideo = (videoId: string, direction: 'up' | 'down') => {
    setVideoFiles(prev => {
      const index = prev.findIndex(v => v.id === videoId);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newFiles = [...prev];
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      return newFiles;
    });
  };

  const updateVideoField = (videoId: string, field: keyof VideoFile, value: string | string[]) => {
    setVideoFiles(prev => prev.map(v => 
      v.id === videoId ? { ...v, [field]: value } : v
    ));
  };

  const addTag = (videoId: string) => {
    if (!tagInput.trim()) return;
    
    const video = videoFiles.find(v => v.id === videoId);
    if (!video) return;
    
    if (!video.tags.includes(tagInput.trim()) && video.tags.length < 10) {
      updateVideoField(videoId, 'tags', [...video.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (videoId: string, tagToRemove: string) => {
    const video = videoFiles.find(v => v.id === videoId);
    if (!video) return;
    
    updateVideoField(videoId, 'tags', video.tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent, videoId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(videoId);
    }
  };

  const pauseUpload = (videoId: string) => {
    chunkUploadService.pauseUpload(videoId);
  };

  const resumeUpload = async (videoId: string) => {
    const video = videoFiles.find(v => v.id === videoId);
    if (!video) return;

    try {
      await chunkUploadService.resumeUpload(
        video.file,
        '/upload/chunk' // The service now handles the base URL
      );
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to resume upload: ${error}`,
        variant: "destructive"
      });
    }
  };

  const handleUploadAll = async () => {
    // Validate all videos have required fields
    const incompleteVideos = videoFiles.filter(v => 
      !v.title.trim() || !v.caption.trim() || !v.location.trim()
    );

    if (incompleteVideos.length > 0) {
      toast({
        title: "Error",
        description: t.fillRequired,
        variant: "destructive"
      });
      return;
    }

    if (videoFiles.length === 0) {
      toast({
        title: "Error", 
        description: t.noFiles,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = videoFiles.map(async (video) => {
        try {
          const fileUrl = await chunkUploadService.uploadFile(
            video.file,
            '/upload/chunk' // The service now handles the base URL
          );
          return { ...video, uploadUrl: fileUrl };
        } catch (error) {
          // console.error(`Failed to upload ${video.file.name}:`, error);
          throw error;
        }
      });

      const uploadedVideos = await Promise.all(uploadPromises);
      
      await onVideosUpload(uploadedVideos);

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
    }
  };

  const resetForm = () => {
    videoFiles.forEach(video => {
      URL.revokeObjectURL(video.preview);
      chunkUploadService.cancelUpload(video.id);
    });
    
    setVideoFiles([]);
    setUploadProgress({});
    setSelectedFileIndex(0);
    setTagInput("");
    setVideoError("");
    setExpandedFile(null);
    setPreviewingFile(null);
  };

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onOpenChange(false);
    }
  };

  const getTotalProgress = () => {
    if (videoFiles.length === 0) return 0;
    
    const totalPercentage = Object.values(uploadProgress).reduce((sum, progress) => {
      return sum + (progress?.percentage || 0);
    }, 0);
    
    return Math.round(totalPercentage / videoFiles.length);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'uploading':
        return <RotateCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full max-h-[95vh] overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent-yellow">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            {t.title}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {t.subtitle}
          </DialogDescription>
          
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            isOnline 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span>{isOnline ? t.online : t.offline}</span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Column - File Selection & List */}
            <div className="space-y-4 flex flex-col min-h-0">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer ${
                  dragActive
                    ? 'border-primary bg-gradient-to-b from-primary/10 to-primary/5 scale-[1.02] shadow-lg shadow-primary/20'
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-gradient-to-b hover:from-muted/30 hover:to-muted/10 hover:shadow-md'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary via-primary to-accent-yellow flex items-center justify-center shadow-lg">
                    <Video className="h-8 w-8 text-white" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent-yellow rounded-full flex items-center justify-center">
                      <Plus className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">{t.dragDrop}</h3>
                    <p className="text-sm text-muted-foreground">{t.supportedFormats}</p>
                    <p className="text-xs text-primary font-medium">{t.multipleFiles}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-gradient-to-r from-primary to-accent-yellow hover:from-primary/90 hover:to-accent-yellow/90 text-white font-medium px-4 py-2 rounded-full"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {t.selectVideos}
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/mov,video/quicktime,video/avi"
                  onChange={handleFileInputChange}
                  multiple
                  className="hidden"
                />
              </div>

              {/* Features Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Upload className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">{t.chunkUpload}</span>
                  </div>
                  <p className="text-blue-700 dark:text-blue-200">{t.chunkUploadDesc}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-1">
                    <RotateCw className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900 dark:text-green-100">{t.resumeUpload}</span>
                  </div>
                  <p className="text-green-700 dark:text-green-200">{t.resumeUploadDesc}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-1">
                    <FileVideo className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-purple-900 dark:text-purple-100">{t.multiUpload}</span>
                  </div>
                  <p className="text-purple-700 dark:text-purple-200">{t.multiUploadDesc}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-900 dark:text-orange-100">{t.mobileOptimized}</span>
                  </div>
                  <p className="text-orange-700 dark:text-orange-200">{t.mobileOptimizedDesc}</p>
                </div>
              </div>

              {/* Video Files List */}
              {videoFiles.length > 0 && (
                <Card className="flex-1 min-h-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Videos ({videoFiles.length})</span>
                      {isUploading && (
                        <div className="flex items-center gap-2 text-sm">
                          <span>{t.totalProgress}: {getTotalProgress()}%</span>
                          <Progress value={getTotalProgress()} className="w-16 h-2" />
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 min-h-0">
                    <ScrollArea className="h-full px-4 pb-4">
                      <div className="space-y-3">
                        {videoFiles.map((video, index) => {
                          const progress = uploadProgress[video.id];
                          const isExpanded = expandedFile === video.id;
                          
                          return (
                            <div key={video.id} className="border rounded-lg p-3 space-y-2">
                              {/* File Header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {getStatusIcon(progress?.status)}
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-sm truncate">
                                      {video.title || video.file.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {formatFileSize(video.file.size)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {progress?.status === 'uploading' && (
                                    <Button size="sm" variant="ghost" onClick={() => pauseUpload(video.id)}>
                                      <Pause className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {progress?.status === 'paused' && (
                                    <Button size="sm" variant="ghost" onClick={() => resumeUpload(video.id)}>
                                      <Play className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => setExpandedFile(isExpanded ? null : video.id)}
                                  >
                                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                  </Button>
                                  {index > 0 && (
                                    <Button size="sm" variant="ghost" onClick={() => moveVideo(video.id, 'up')}>
                                      <ArrowUp className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {index < videoFiles.length - 1 && (
                                    <Button size="sm" variant="ghost" onClick={() => moveVideo(video.id, 'down')}>
                                      <ArrowDown className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button size="sm" variant="ghost" onClick={() => removeVideo(video.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              {progress && progress.status !== 'pending' && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{progress.status === 'completed' ? t.completed : `${progress.percentage}%`}</span>
                                    {progress.status === 'uploading' && (
                                      <span>{formatFileSize(progress.uploadedSize)} / {formatFileSize(progress.totalSize)}</span>
                                    )}
                                  </div>
                                  <Progress value={progress.percentage} className="h-1" />
                                </div>
                              )}

                              {/* Expanded Details */}
                              {isExpanded && (
                                <div className="pt-2 border-t space-y-3">
                                  <div className="grid grid-cols-1 gap-2">
                                    <Input
                                      placeholder={t.titlePlaceholder}
                                      value={video.title}
                                      onChange={(e) => updateVideoField(video.id, 'title', e.target.value)}
                                      className="h-8 text-sm"
                                    />
                                    <Textarea
                                      placeholder={t.captionPlaceholder}
                                      value={video.caption}
                                      onChange={(e) => updateVideoField(video.id, 'caption', e.target.value)}
                                      rows={2}
                                      className="text-sm resize-none"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                      <Input
                                        placeholder={t.locationPlaceholder}
                                        value={video.location}
                                        onChange={(e) => updateVideoField(video.id, 'location', e.target.value)}
                                        className="h-8 text-sm"
                                      />
                                      <Input
                                        placeholder={t.provincePlaceholder}
                                        value={video.province}
                                        onChange={(e) => updateVideoField(video.id, 'province', e.target.value)}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    
                                    {/* Tags */}
                                    <div className="space-y-2">
                                      <div className="flex gap-1">
                                        <Input
                                          placeholder={t.tagPlaceholder}
                                          value={tagInput}
                                          onChange={(e) => setTagInput(e.target.value)}
                                          onKeyPress={(e) => handleTagKeyPress(e, video.id)}
                                          className="h-8 text-sm flex-1"
                                        />
                                        <Button 
                                          size="sm" 
                                          onClick={() => addTag(video.id)}
                                          className="h-8 px-3"
                                        >
                                          {t.addTag}
                                        </Button>
                                      </div>
                                      {video.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                          {video.tags.map((tag, tagIndex) => (
                                            <Badge
                                              key={tagIndex}
                                              variant="secondary"
                                              className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                              onClick={() => removeTag(video.id, tag)}
                                            >
                                              #{tag}
                                              <X className="h-2 w-2 ml-1" />
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Preview & Details */}
            <div className="space-y-4 flex flex-col min-h-0">
              {videoFiles.length > 0 && selectedFileIndex < videoFiles.length && (
                <>
                  {/* Video Preview */}
                  <Card className="flex-1">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>{t.preview}</span>
                        <div className="flex gap-1">
                          {videoFiles.map((_, index) => (
                            <button
                              key={index}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                selectedFileIndex === index ? 'bg-primary' : 'bg-muted-foreground/30'
                              }`}
                              onClick={() => setSelectedFileIndex(index)}
                            />
                          ))}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="relative bg-black rounded-lg overflow-hidden flex-1 min-h-[200px] flex items-center justify-center">
                        <video
                          ref={videoRef}
                          src={videoFiles[selectedFileIndex]?.preview}
                          className="max-w-full max-h-full object-contain"
                          controls
                          playsInline
                          muted
                        />
                      </div>
                      
                      {/* File Info */}
                      <div className="mt-3 space-y-2">
                        <div className="text-sm font-medium truncate">
                          {videoFiles[selectedFileIndex]?.file.name}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatFileSize(videoFiles[selectedFileIndex]?.file.size || 0)}</span>
                          <span>{videoFiles[selectedFileIndex]?.file.type}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Empty State */}
              {videoFiles.length === 0 && (
                <Card className="flex-1 flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t.noFiles}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t.chooseFromDevice}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {videoError && (
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 border border-red-200 dark:border-red-800 rounded-xl mt-4">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line">{videoError}</div>
          </div>
        )}

        <DialogFooter className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
            size="lg"
            className="px-6 py-2 rounded-full"
          >
            {t.cancel}
          </Button>
          
          <Button
            onClick={handleUploadAll}
            disabled={videoFiles.length === 0 || isUploading || !isOnline}
            size="lg"
            className="min-w-[140px] px-6 py-2 rounded-full bg-gradient-to-r from-primary to-accent-yellow hover:from-primary/90 hover:to-accent-yellow/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <RotateCw className="h-4 w-4 animate-spin" />
                {t.uploading}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {t.upload} ({videoFiles.length})
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MobileVideoUpload;