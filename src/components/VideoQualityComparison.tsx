import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Eye,
  Download,
  Share,
  TrendingUp,
  FileVideo,
  HardDrive,
  Clock,
  Star,
  Maximize2
} from "lucide-react";
import { VideoQualityMetrics } from "@/shared/services/videoProcessingService";

interface VideoQualityComparisonProps {
  originalVideoUrl: string;
  processedVideoUrl: string;
  metrics: VideoQualityMetrics;
  onDownload: () => void;
  onShare: () => void;
  onUseProcessed: () => void;
  onUseOriginal: () => void;
  currentLanguage: "th" | "en";
  className?: string;
}

const VideoQualityComparison: React.FC<VideoQualityComparisonProps> = ({
  originalVideoUrl,
  processedVideoUrl,
  metrics,
  onDownload,
  onShare,
  onUseProcessed,
  onUseOriginal,
  currentLanguage,
  className = ""
}) => {
  const [activeVideo, setActiveVideo] = useState<'original' | 'processed'>('processed');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  
  const originalVideoRef = useRef<HTMLVideoElement>(null);
  const processedVideoRef = useRef<HTMLVideoElement>(null);

  const texts = {
    en: {
      title: "Quality Comparison",
      subtitle: "Compare your original and enhanced video",
      original: "Original",
      processed: "AI Enhanced",
      metrics: {
        title: "Enhancement Results",
        resolution: "Resolution",
        fileSize: "File Size",
        compression: "Compression Ratio",
        quality: "Quality Score",
        processingTime: "Processing Time",
        improvement: "Improvement"
      },
      controls: {
        play: "Play",
        pause: "Pause",
        mute: "Mute",
        unmute: "Unmute",
        fullscreen: "Fullscreen"
      },
      actions: {
        useProcessed: "Use Enhanced Video",
        useOriginal: "Use Original Video",
        download: "Download Enhanced",
        share: "Share Result"
      },
      stats: {
        sizeSaved: "Size Saved",
        qualityGain: "Quality Improved",
        resolutionBoost: "Resolution Boost",
        timeSpent: "Processing Time"
      },
      comparison: {
        betterQuality: "Better Quality",
        smallerSize: "Smaller Size",
        sameQuality: "Same Quality",
        largerSize: "Larger Size"
      }
    },
    th: {
      title: "เปรียบเทียบคุณภาพ",
      subtitle: "เปรียบเทียบวิดีโอต้นฉบับและวิดีโอที่ปรับปรุงแล้ว",
      original: "ต้นฉบับ",
      processed: "ปรับปรุงด้วย AI",
      metrics: {
        title: "ผลการปรับปรุง",
        resolution: "ความละเอียด",
        fileSize: "ขนาดไฟล์",
        compression: "อัตราการบีบอัด",
        quality: "คะแนนคุณภาพ",
        processingTime: "เวลาประมวลผล",
        improvement: "การปรับปรุง"
      },
      controls: {
        play: "เล่น",
        pause: "หยุด",
        mute: "ปิดเสียง",
        unmute: "เปิดเสียง",
        fullscreen: "เต็มจอ"
      },
      actions: {
        useProcessed: "ใช้วิดีโอที่ปรับปรุงแล้ว",
        useOriginal: "ใช้วิดีโอต้นฉบับ",
        download: "ดาวน์โหลดวิดีโอที่ปรับปรุงแล้ว",
        share: "แบ่งปันผลลัพธ์"
      },
      stats: {
        sizeSaved: "ขนาดที่ประหยัด",
        qualityGain: "คุณภาพที่ดีขึ้น",
        resolutionBoost: "ความละเอียดที่เพิ่มขึ้น",
        timeSpent: "เวลาประมวลผล"
      },
      comparison: {
        betterQuality: "คุณภาพดีขึ้น",
        smallerSize: "ขนาดเล็กลง",
        sameQuality: "คุณภาพเดิม",
        largerSize: "ขนาดใหญ่ขึ้น"
      }
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

  const togglePlay = () => {
    const activeRef = activeVideo === 'original' ? originalVideoRef : processedVideoRef;
    const inactiveRef = activeVideo === 'original' ? processedVideoRef : originalVideoRef;
    
    if (activeRef.current) {
      if (isPlaying) {
        activeRef.current.pause();
        inactiveRef.current?.pause();
      } else {
        activeRef.current.play();
        // Sync the other video
        if (inactiveRef.current) {
          inactiveRef.current.currentTime = activeRef.current.currentTime;
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    if (originalVideoRef.current) originalVideoRef.current.muted = newMuted;
    if (processedVideoRef.current) processedVideoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const switchVideo = (video: 'original' | 'processed') => {
    const currentRef = activeVideo === 'original' ? originalVideoRef : processedVideoRef;
    const newRef = video === 'original' ? originalVideoRef : processedVideoRef;
    
    // Sync time when switching
    if (currentRef.current && newRef.current) {
      newRef.current.currentTime = currentRef.current.currentTime;
      if (isPlaying) {
        newRef.current.play();
        currentRef.current.pause();
      }
    }
    
    setActiveVideo(video);
  };

  const getQualityBadge = () => {
    const qualityDiff = metrics.qualityScore - 70; // Assuming 70 as baseline
    if (qualityDiff > 15) return { text: t.comparison.betterQuality, color: 'bg-green-100 text-green-800' };
    if (qualityDiff > 5) return { text: t.comparison.betterQuality, color: 'bg-blue-100 text-blue-800' };
    return { text: t.comparison.sameQuality, color: 'bg-gray-100 text-gray-800' };
  };

  const getSizeBadge = () => {
    if (metrics.compressionRatio > 1.2) return { text: t.comparison.smallerSize, color: 'bg-green-100 text-green-800' };
    if (metrics.compressionRatio < 0.8) return { text: t.comparison.largerSize, color: 'bg-orange-100 text-orange-800' };
    return { text: t.comparison.sameQuality, color: 'bg-gray-100 text-gray-800' };
  };

  const qualityBadge = getQualityBadge();
  const sizeBadge = getSizeBadge();

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-600">
            <Eye className="h-5 w-5 text-white" />
          </div>
          {t.title}
        </CardTitle>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Video Comparison */}
        <div className="space-y-4">
          {/* Video Selection Buttons */}
          <div className="flex gap-2">
            <Button
              variant={activeVideo === 'original' ? 'default' : 'outline'}
              onClick={() => switchVideo('original')}
              className="flex-1"
            >
              <FileVideo className="h-4 w-4 mr-2" />
              {t.original}
            </Button>
            <Button
              variant={activeVideo === 'processed' ? 'default' : 'outline'}
              onClick={() => switchVideo('processed')}
              className="flex-1"
            >
              <Star className="h-4 w-4 mr-2" />
              {t.processed}
            </Button>
          </div>

          {/* Video Player */}
          <div className="relative bg-black rounded-xl overflow-hidden shadow-lg">
            <video
              ref={originalVideoRef}
              src={originalVideoUrl}
              className={`w-full h-64 object-contain ${activeVideo === 'original' ? 'block' : 'hidden'}`}
              muted={isMuted}
              onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
            />
            <video
              ref={processedVideoRef}
              src={processedVideoUrl}
              className={`w-full h-64 object-contain ${activeVideo === 'processed' ? 'block' : 'hidden'}`}
              muted={isMuted}
              onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
            />
            
            {/* Video Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0"
                  onClick={togglePlay}
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
              
              <div className="flex items-center gap-3">
                <Badge className="bg-black/50 text-white">
                  {activeVideo === 'original' ? t.original : t.processed}
                </Badge>
                <Button
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0"
                >
                  <Maximize2 className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Quality Metrics */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t.metrics.title}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Resolution Comparison */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t.metrics.resolution}</span>
                {metrics.processedResolution.height > metrics.originalResolution.height && (
                  <Badge className="bg-green-100 text-green-800">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {t.metrics.improvement}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.original}:</span>
                  <span>{metrics.originalResolution.width}×{metrics.originalResolution.height}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">{t.processed}:</span>
                  <span>{metrics.processedResolution.width}×{metrics.processedResolution.height}</span>
                </div>
              </div>
            </div>

            {/* File Size Comparison */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t.metrics.fileSize}</span>
                <Badge className={sizeBadge.color}>
                  <HardDrive className="h-3 w-3 mr-1" />
                  {sizeBadge.text}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.original}:</span>
                  <span>{formatFileSize(metrics.originalFileSize)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">{t.processed}:</span>
                  <span>{formatFileSize(metrics.processedFileSize)}</span>
                </div>
              </div>
            </div>

            {/* Quality Score */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t.metrics.quality}</span>
                <Badge className={qualityBadge.color}>
                  <Star className="h-3 w-3 mr-1" />
                  {qualityBadge.text}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-primary">
                  {metrics.qualityScore}
                </div>
                <div className="text-sm text-muted-foreground">/ 100</div>
              </div>
            </div>

            {/* Processing Time */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t.metrics.processingTime}</span>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(metrics.processingTime)}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  {metrics.compressionRatio > 1 ? 
                    `${Math.round((metrics.compressionRatio - 1) * 100)}% ${t.stats.sizeSaved}` :
                    `${Math.round((1 - metrics.compressionRatio) * 100)}% larger size`
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onUseProcessed}
            className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
          >
            <Star className="h-4 w-4 mr-2" />
            {t.actions.useProcessed}
          </Button>
          
          <Button
            variant="outline"
            onClick={onUseOriginal}
            className="flex-1"
          >
            <FileVideo className="h-4 w-4 mr-2" />
            {t.actions.useOriginal}
          </Button>
          
          <Button
            variant="outline"
            onClick={onDownload}
            className="sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            {t.actions.download}
          </Button>
          
          <Button
            variant="outline"
            onClick={onShare}
            className="sm:w-auto"
          >
            <Share className="h-4 w-4 mr-2" />
            {t.actions.share}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoQualityComparison;