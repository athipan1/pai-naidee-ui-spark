import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  Zap, 
  Settings, 
  Info, 
  MonitorSpeaker,
  Gauge,
  Cpu,
  RotateCcw,
  CheckCircle
} from "lucide-react";
import { VideoProcessingOptions } from "@/shared/services/videoProcessingService";

interface VideoQualitySettingsProps {
  options: VideoProcessingOptions;
  onOptionsChange: (options: VideoProcessingOptions) => void;
  onApplyRecommended: () => void;
  currentLanguage: "th" | "en";
  className?: string;
}

const VideoQualitySettings: React.FC<VideoQualitySettingsProps> = ({
  options,
  onOptionsChange,
  onApplyRecommended,
  currentLanguage,
  className = ""
}) => {
  const texts = {
    en: {
      title: "Video Quality Enhancement",
      subtitle: "Optimize your video for the best viewing experience",
      compression: {
        title: "Smart Compression",
        description: "Reduce file size while maintaining quality",
        quality: "Compression Quality",
        lossless: "Lossless (Best Quality)",
        high: "High Quality",
        medium: "Medium Quality", 
        low: "Fast Compression"
      },
      resolution: {
        title: "Resolution Optimization",
        description: "Enhance video resolution for sharper details",
        target: "Target Resolution",
        auto: "Auto (Recommended)",
        "720p": "720p HD",
        "1080p": "1080p Full HD",
        "4K": "4K Ultra HD"
      },
      superResolution: {
        title: "AI Super-Resolution",
        description: "Use AI to enhance sharpness and detail",
        enabled: "Enable AI Enhancement"
      },
      denoising: {
        title: "Smart Denoising",
        description: "Remove noise and grain for cleaner video",
        enabled: "Enable Denoising"
      },
      stabilization: {
        title: "Video Stabilization",
        description: "Reduce camera shake and motion blur",
        enabled: "Enable Stabilization"
      },
      recommendations: {
        title: "Smart Recommendations",
        description: "Apply optimal settings for your device",
        apply: "Apply Recommended",
        currentSettings: "Current Settings",
        recommended: "Recommended",
        performance: "Performance Impact",
        low: "Low",
        medium: "Medium", 
        high: "High"
      },
      processing: {
        estimatedTime: "Estimated Processing Time",
        fast: "< 30s",
        medium: "30s - 2min",
        slow: "> 2min"
      }
    },
    th: {
      title: "การปรับปรุงคุณภาพวิดีโอ",
      subtitle: "ปรับแต่งวิดีโอให้มีคุณภาพสูงสุดสำหรับการชม",
      compression: {
        title: "การบีบอัดอัจฉริยะ",
        description: "ลดขนาดไฟล์โดยคงคุณภาพไว้",
        quality: "คุณภาพการบีบอัด",
        lossless: "ไม่สูญเสียคุณภาพ (คุณภาพดีที่สุด)",
        high: "คุณภาพสูง",
        medium: "คุณภาพปานกลาง",
        low: "บีบอัดเร็ว"
      },
      resolution: {
        title: "การปรับความละเอียด",
        description: "เพิ่มความละเอียดให้ภาพคมชัดขึ้น",
        target: "ความละเอียดเป้าหมาย",
        auto: "อัตโนมัติ (แนะนำ)",
        "720p": "720p HD",
        "1080p": "1080p Full HD",
        "4K": "4K Ultra HD"
      },
      superResolution: {
        title: "การเพิ่มความคมชัดด้วย AI",
        description: "ใช้ AI เพื่อเพิ่มความคมชัดและรายละเอียด",
        enabled: "เปิดใช้งานการปรับปรุงด้วย AI"
      },
      denoising: {
        title: "การลดสัญญาณรบกวนอัจฉริยะ",
        description: "ลดสัญญาณรบกวนและเกรนเพื่อวิดีโอที่สะอาดขึ้น",
        enabled: "เปิดใช้งานการลดสัญญาณรบกวน"
      },
      stabilization: {
        title: "การทรงตัวของวิดีโอ",
        description: "ลดการสั่นของกล้องและความเบลอจากการเคลื่อนไหว",
        enabled: "เปิดใช้งานการทรงตัว"
      },
      recommendations: {
        title: "คำแนะนำอัจฉริยะ",
        description: "ใช้การตั้งค่าที่เหมาะสมสำหรับอุปกรณ์ของคุณ",
        apply: "ใช้การตั้งค่าที่แนะนำ",
        currentSettings: "การตั้งค่าปัจจุบัน",
        recommended: "แนะนำ",
        performance: "ผลกระทบต่อประสิทธิภาพ",
        low: "ต่ำ",
        medium: "ปานกลาง",
        high: "สูง"
      },
      processing: {
        estimatedTime: "เวลาประมวลผลโดยประมาณ",
        fast: "< 30 วินาที",
        medium: "30 วินาที - 2 นาที",
        slow: "> 2 นาที"
      }
    }
  };

  const t = texts[currentLanguage];

  const updateOption = <K extends keyof VideoProcessingOptions>(
    key: K,
    value: VideoProcessingOptions[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  const getPerformanceImpact = () => {
    let impact = 0;
    if (options.enableCompression) impact += 1;
    if (options.enableSuperResolution) impact += 3;
    if (options.enableDenoising) impact += 1;
    if (options.enableStabilization) impact += 2;
    if (options.targetResolution === '4K') impact += 2;
    
    if (impact <= 2) return { level: 'low', text: t.recommendations.low, color: 'bg-green-100 text-green-800' };
    if (impact <= 4) return { level: 'medium', text: t.recommendations.medium, color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'high', text: t.recommendations.high, color: 'bg-red-100 text-red-800' };
  };

  const getEstimatedTime = () => {
    const impact = getPerformanceImpact();
    if (impact.level === 'low') return t.processing.fast;
    if (impact.level === 'medium') return t.processing.medium;
    return t.processing.slow;
  };

  const performanceImpact = getPerformanceImpact();

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {t.title}
        </CardTitle>
        <CardDescription className="text-base">
          {t.subtitle}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Recommendations Section */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
              <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">{t.recommendations.title}</p>
              <p className="text-sm text-blue-700 dark:text-blue-200">{t.recommendations.description}</p>
            </div>
          </div>
          <Button 
            onClick={onApplyRecommended}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {t.recommendations.apply}
          </Button>
        </div>

        {/* Performance Impact */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t.recommendations.performance}:</span>
          </div>
          <Badge className={performanceImpact.color}>
            {performanceImpact.text}
          </Badge>
        </div>

        {/* Estimated Processing Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t.processing.estimatedTime}:</span>
          </div>
          <Badge variant="outline">
            {getEstimatedTime()}
          </Badge>
        </div>

        <Separator />

        {/* Compression Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{t.compression.title}</h3>
              <p className="text-sm text-muted-foreground">{t.compression.description}</p>
            </div>
            <Switch
              checked={options.enableCompression}
              onCheckedChange={(checked) => updateOption('enableCompression', checked)}
            />
          </div>

          {options.enableCompression && (
            <div className="ml-11 space-y-2">
              <Label className="text-sm font-medium">{t.compression.quality}</Label>
              <Select
                value={options.compressionQuality}
                onValueChange={(value: VideoProcessingOptions['compressionQuality']) =>
                  updateOption('compressionQuality', value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lossless">{t.compression.lossless}</SelectItem>
                  <SelectItem value="high">{t.compression.high}</SelectItem>
                  <SelectItem value="medium">{t.compression.medium}</SelectItem>
                  <SelectItem value="low">{t.compression.low}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Separator />

        {/* Resolution Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900">
              <MonitorSpeaker className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{t.resolution.title}</h3>
              <p className="text-sm text-muted-foreground">{t.resolution.description}</p>
            </div>
          </div>

          <div className="ml-11 space-y-2">
            <Label className="text-sm font-medium">{t.resolution.target}</Label>
            <Select
              value={options.targetResolution}
              onValueChange={(value: VideoProcessingOptions['targetResolution']) =>
                updateOption('targetResolution', value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">{t.resolution.auto}</SelectItem>
                <SelectItem value="720p">{t.resolution["720p"]}</SelectItem>
                <SelectItem value="1080p">{t.resolution["1080p"]}</SelectItem>
                <SelectItem value="4K">{t.resolution["4K"]}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* AI Super-Resolution */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{t.superResolution.title}</h3>
            <p className="text-sm text-muted-foreground">{t.superResolution.description}</p>
          </div>
          <Switch
            checked={options.enableSuperResolution}
            onCheckedChange={(checked) => updateOption('enableSuperResolution', checked)}
          />
        </div>

        <Separator />

        {/* Denoising */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900">
            <Info className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{t.denoising.title}</h3>
            <p className="text-sm text-muted-foreground">{t.denoising.description}</p>
          </div>
          <Switch
            checked={options.enableDenoising}
            onCheckedChange={(checked) => updateOption('enableDenoising', checked)}
          />
        </div>

        <Separator />

        {/* Stabilization */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900">
            <RotateCcw className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{t.stabilization.title}</h3>
            <p className="text-sm text-muted-foreground">{t.stabilization.description}</p>
          </div>
          <Switch
            checked={options.enableStabilization}
            onCheckedChange={(checked) => updateOption('enableStabilization', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoQualitySettings;