import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  FileArchive,
  Sparkles,
  Zap,
  CheckCircle,
  Clock,
  Cpu,
  Activity
} from "lucide-react";
import { ProcessingProgress } from "@/shared/services/videoProcessingService";

interface VideoProcessingProgressProps {
  progress: ProcessingProgress;
  currentLanguage: "th" | "en";
  className?: string;
}

const VideoProcessingProgressComponent: React.FC<VideoProcessingProgressProps> = ({
  progress,
  currentLanguage,
  className = ""
}) => {
  const texts = {
    en: {
      title: "Processing Your Video",
      subtitle: "Enhancing quality with AI technology",
      stages: {
        analyzing: "Analyzing Video",
        compressing: "Smart Compression",
        upscaling: "AI Super-Resolution",
        enhancing: "Quality Enhancement",
        finalizing: "Finalizing",
        complete: "Processing Complete!"
      },
      stageDescriptions: {
        analyzing: "Examining video properties and optimal settings",
        compressing: "Applying lossless compression to reduce file size",
        upscaling: "Enhancing resolution and sharpness with AI",
        enhancing: "Applying denoising and color correction",
        finalizing: "Preparing your enhanced video",
        complete: "Your video is ready with improved quality!"
      },
      timeRemaining: "Time remaining",
      processingSpeed: "Processing speed",
      fast: "Fast",
      normal: "Normal",
      slow: "Intensive",
      pleaseWait: "Please keep this tab open while processing..."
    },
    th: {
      title: "กำลังประมวลผลวิดีโอของคุณ",
      subtitle: "ปรับปรุงคุณภาพด้วยเทคโนโลยี AI",
      stages: {
        analyzing: "กำลังวิเคราะห์วิดีโอ",
        compressing: "การบีบอัดอัจฉริยะ",
        upscaling: "การเพิ่มความคมชัดด้วย AI",
        enhancing: "การปรับปรุงคุณภาพ",
        finalizing: "กำลังเตรียมให้เสร็จสิ้น",
        complete: "ประมวลผลเสร็จสิ้น!"
      },
      stageDescriptions: {
        analyzing: "ตรวจสอบคุณสมบัติของวิดีโอและการตั้งค่าที่เหมาะสม",
        compressing: "ใช้การบีบอัดแบบไม่สูญเสียคุณภาพเพื่อลดขนาดไฟล์",
        upscaling: "เพิ่มความละเอียดและความคมชัดด้วย AI",
        enhancing: "ใช้การลดสัญญาณรบกวนและการปรับสี",
        finalizing: "เตรียมวิดีโอที่ปรับปรุงแล้วของคุณ",
        complete: "วิดีโอของคุณพร้อมแล้วพร้อมคุณภาพที่ดีขึ้น!"
      },
      timeRemaining: "เวลาที่เหลือ",
      processingSpeed: "ความเร็วในการประมวลผล",
      fast: "เร็ว",
      normal: "ปกติ",
      slow: "ใช้เวลามาก",
      pleaseWait: "กรุณาเปิดแท็บนี้ไว้ในระหว่างประมวลผล..."
    }
  };

  const t = texts[currentLanguage];

  const getStageIcon = (stage: ProcessingProgress['stage']) => {
    const iconClass = "h-5 w-5 text-white";
    switch (stage) {
      case 'analyzing':
        return <Search className={iconClass} />;
      case 'compressing':
        return <FileArchive className={iconClass} />;
      case 'upscaling':
        return <Sparkles className={iconClass} />;
      case 'enhancing':
        return <Zap className={iconClass} />;
      case 'finalizing':
        return <Activity className={iconClass} />;
      case 'complete':
        return <CheckCircle className={iconClass} />;
      default:
        return <Cpu className={iconClass} />;
    }
  };

  const getStageColor = (stage: ProcessingProgress['stage']) => {
    switch (stage) {
      case 'analyzing':
        return 'from-blue-500 to-blue-600';
      case 'compressing':
        return 'from-green-500 to-green-600';
      case 'upscaling':
        return 'from-purple-500 to-purple-600';
      case 'enhancing':
        return 'from-orange-500 to-orange-600';
      case 'finalizing':
        return 'from-cyan-500 to-cyan-600';
      case 'complete':
        return 'from-emerald-500 to-emerald-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getProgressColor = (stage: ProcessingProgress['stage']) => {
    switch (stage) {
      case 'analyzing':
        return 'bg-blue-500';
      case 'compressing':
        return 'bg-green-500';
      case 'upscaling':
        return 'bg-purple-500';
      case 'enhancing':
        return 'bg-orange-500';
      case 'finalizing':
        return 'bg-cyan-500';
      case 'complete':
        return 'bg-emerald-500';
      default:
        return 'bg-primary';
    }
  };

  const getProcessingSpeed = () => {
    if (progress.percentage > 80) return { text: t.fast, color: 'bg-green-100 text-green-800' };
    if (progress.percentage > 40) return { text: t.normal, color: 'bg-yellow-100 text-yellow-800' };
    return { text: t.slow, color: 'bg-red-100 text-red-800' };
  };

  const formatTime = (seconds?: number) => {
    if (!seconds || seconds <= 0) return '0s';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${Math.round(remainingSeconds)}s`;
  };

  const processingSpeed = getProcessingSpeed();
  const stageColor = getStageColor(progress.stage);
  const progressColor = getProgressColor(progress.stage);

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${stageColor} shadow-lg`}>
              {getStageIcon(progress.stage)}
            </div>
            <div>
              <h3 className="text-xl font-bold">{t.title}</h3>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-lg">{t.stages[progress.stage]}</p>
                <p className="text-sm text-muted-foreground">
                  {t.stageDescriptions[progress.stage]}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(progress.percentage)}%
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Progress 
                value={progress.percentage} 
                className="h-3 bg-muted rounded-full overflow-hidden"
              />
              <div 
                className={`absolute top-0 left-0 h-3 ${progressColor} rounded-full transition-all duration-500`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Status Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Time Remaining */}
            {progress.estimatedTimeRemaining !== undefined && progress.stage !== 'complete' && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t.timeRemaining}</p>
                  <p className="text-lg font-bold text-primary">
                    {formatTime(progress.estimatedTimeRemaining)}
                  </p>
                </div>
              </div>
            )}

            {/* Processing Speed */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                <Cpu className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{t.processingSpeed}</p>
                <Badge className={processingSpeed.color}>
                  {processingSpeed.text}
                </Badge>
              </div>
            </div>
          </div>

          {/* Processing Stages Indicator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              {(['analyzing', 'compressing', 'upscaling', 'enhancing', 'finalizing', 'complete'] as const).map((stage, index) => {
                const isActive = stage === progress.stage;
                const isCompleted = ['analyzing', 'compressing', 'upscaling', 'enhancing', 'finalizing'].indexOf(progress.stage) > 
                                   ['analyzing', 'compressing', 'upscaling', 'enhancing', 'finalizing'].indexOf(stage) ||
                                   progress.stage === 'complete';
                
                return (
                  <div 
                    key={stage}
                    className={`flex flex-col items-center space-y-2 ${
                      isActive ? 'text-primary font-medium' : 
                      isCompleted ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      isActive ? 'bg-primary animate-pulse' :
                      isCompleted ? 'bg-green-500' : 'bg-muted-foreground/30'
                    }`} />
                    <span className="text-xs text-center leading-tight">
                      {t.stages[stage].split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="relative">
              <div className="absolute top-1.5 left-0 right-0 h-0.5 bg-muted-foreground/20" />
              <div 
                className="absolute top-1.5 left-0 h-0.5 bg-primary transition-all duration-1000"
                style={{ 
                  width: `${Math.min(progress.percentage, 95)}%` 
                }}
              />
            </div>
          </div>

          {/* Message */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-medium">
              {progress.message}
            </p>
            {progress.stage !== 'complete' && (
              <p className="text-xs text-muted-foreground mt-2">
                {t.pleaseWait}
              </p>
            )}
          </div>

          {/* Completion Animation */}
          {progress.stage === 'complete' && (
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl border border-green-200 dark:border-green-800">
              <div className="inline-flex items-center gap-2 text-green-700 dark:text-green-300 font-semibold">
                <CheckCircle className="h-5 w-5 animate-pulse" />
                {t.stages.complete}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoProcessingProgressComponent;