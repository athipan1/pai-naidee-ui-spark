import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/shared/hooks/use-toast";
import MobileVideoUpload from "@/components/MobileVideoUpload";
import { 
  ArrowLeft,
  Smartphone,
  Upload,
  Wifi,
  RefreshCw,
  FileVideo,
  CheckCircle,
  Zap,
  Shield,
  Users,
  PlayCircle
} from "lucide-react";
import { useLanguage } from "@/shared/contexts/LanguageProvider";

interface VideoFile {
  id: string;
  file: File;
  preview: string;
  title: string;
  caption: string;
  location: string;
  province: string;
  tags: string[];
  uploadUrl?: string;
}

const VideoUploadPage: React.FC<{ onBack: () => void }> = ({
  onBack
}) => {
  const { language } = useLanguage();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadedVideos, setUploadedVideos] = useState<VideoFile[]>([]);

  const texts = {
    en: {
      title: "Mobile Video Upload",
      subtitle: "Professional video upload system optimized for mobile devices",
      description: "Upload multiple travel videos with advanced features like chunk upload, resume capability, and mobile-optimized interface.",
      
      features: {
        title: "Key Features",
        mobile: {
          title: "Mobile-First Design",
          description: "Touch-friendly interface optimized for smartphones and tablets"
        },
        chunk: {
          title: "Smart Chunk Upload",
          description: "Files are split into small chunks for reliable upload even on slow connections"
        },
        resume: {
          title: "Resume Support",
          description: "Interrupted uploads automatically resume when connection is restored"
        },
        multi: {
          title: "Multiple Files",
          description: "Upload multiple videos simultaneously with individual progress tracking"
        },
        validation: {
          title: "Smart Validation",
          description: "Comprehensive file validation with user-friendly error messages"
        },
        offline: {
          title: "Offline Awareness",
          description: "Detects connection status and manages uploads accordingly"
        }
      },

      benefits: {
        title: "Benefits",
        reliable: "99.9% Upload Success Rate",
        fast: "50% Faster Upload Speed",
        convenient: "Upload Multiple Files",
        secure: "Enterprise-Grade Security"
      },

      cta: {
        title: "Ready to Upload?",
        description: "Start uploading your travel videos with our advanced mobile upload system.",
        button: "Start Upload",
        demo: "Try Demo"
      },

      stats: {
        title: "Upload Statistics",
        uploaded: "Videos Uploaded",
        processing: "Currently Processing",
        success: "Success Rate",
        users: "Active Users"
      },

      recent: {
        title: "Recent Uploads",
        empty: "No videos uploaded yet",
        tryUpload: "Try uploading some videos to see them here!"
      }
    },
    th: {
      title: "อัปโหลดวิดีโอมือถือ",
      subtitle: "ระบบอัปโหลดวิดีโอระดับมืออาชีพที่เหมาะสำหรับมือถือ",
      description: "อัปโหลดวิดีโอท่องเที่ยวหลายไฟล์ด้วยฟีเจอร์ขั้นสูงเช่น การแบ่งส่วนไฟล์, การดำเนินการต่อ, และส่วนติดต่อผู้ใช้ที่เหมาะสำหรับมือถือ",
      
      features: {
        title: "ฟีเจอร์หลัก",
        mobile: {
          title: "ออกแบบเพื่อมือถือ",
          description: "ส่วนติดต่อผู้ใช้ที่เป็นมิตรกับการสัมผัสเหมาะสำหรับสมาร์ทโฟนและแท็บเล็ต"
        },
        chunk: {
          title: "อัปโหลดแบบแบ่งส่วนอัจฉริยะ",
          description: "แบ่งไฟล์เป็นส่วนเล็กๆ เพื่อการอัปโหลดที่เชื่อถือได้แม้ในการเชื่อมต่อที่ช้า"
        },
        resume: {
          title: "รองรับการดำเนินการต่อ",
          description: "การอัปโหลดที่ขัดจังหวะจะดำเนินการต่อโดยอัตโนมัติเมื่อเชื่อมต่ออีกครั้ง"
        },
        multi: {
          title: "หลายไฟล์",
          description: "อัปโหลดวิดีโอหลายไฟล์พร้อมกันพร้อมการติดตามความคืบหน้าแยกกัน"
        },
        validation: {
          title: "การตรวจสอบอัจฉริยะ",
          description: "การตรวจสอบไฟล์ที่ครอบคลุมพร้อมข้อความแสดงข้อผิดพลาดที่เป็นมิตรกับผู้ใช้"
        },
        offline: {
          title: "ตรวจจับการออฟไลน์",
          description: "ตรวจจับสถานะการเชื่อมต่อและจัดการการอัปโหลดตามนั้น"
        }
      },

      benefits: {
        title: "ประโยชน์",
        reliable: "อัตราความสำเร็จ 99.9%",
        fast: "เร็วขึ้น 50%",
        convenient: "อัปโหลดหลายไฟล์",
        secure: "ความปลอดภัยระดับองค์กร"
      },

      cta: {
        title: "พร้อมอัปโหลดแล้วหรือยัง?",
        description: "เริ่มอัปโหลดวิดีโอท่องเที่ยวของคุณด้วยระบบอัปโหลดมือถือขั้นสูงของเรา",
        button: "เริ่มอัปโหลด",
        demo: "ทดลองใช้"
      },

      stats: {
        title: "สถิติการอัปโหลด",
        uploaded: "วิดีโอที่อัปโหลด",
        processing: "กำลังประมวลผล",
        success: "อัตราความสำเร็จ",
        users: "ผู้ใช้งานปัจจุบัน"
      },

      recent: {
        title: "การอัปโหลดล่าสุด",
        empty: "ยังไม่มีวิดีโอที่อัปโหลด",
        tryUpload: "ลองอัปโหลดวิดีโอเพื่อดูที่นี่!"
      }
    }
  };

  const t = texts[language];

  const handleVideoUpload = async (videos: VideoFile[]) => {
    // Simulate API call to save video metadata
    // console.log("Uploading videos:", videos);
    
    // Add to uploaded videos list
    setUploadedVideos(prev => [...prev, ...videos]);
    
    toast({
      title: "Success",
      description: `Successfully uploaded ${videos.length} video${videos.length > 1 ? 's' : ''}!`
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Mock statistics
  const stats = {
    uploaded: "12,847",
    processing: "234",
    success: "99.9%",
    users: "5,632"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Beta
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center space-y-6 mb-12">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent-yellow shadow-lg">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent-yellow bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t.subtitle}
            </p>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              {t.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => setShowUploadDialog(true)}
              className="bg-gradient-to-r from-primary to-accent-yellow hover:from-primary/90 hover:to-accent-yellow/90 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Upload className="h-5 w-5 mr-2" />
              {t.cta.button}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowUploadDialog(true)}
              className="px-8 py-3 rounded-full border-2 hover:border-primary hover:bg-primary/5"
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              {t.cta.demo}
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-primary">{stats.uploaded}</div>
            <div className="text-sm text-muted-foreground">{t.stats.uploaded}</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-green-600">{stats.processing}</div>
            <div className="text-sm text-muted-foreground">{t.stats.processing}</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-blue-600">{stats.success}</div>
            <div className="text-sm text-muted-foreground">{t.stats.success}</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-purple-600">{stats.users}</div>
            <div className="text-sm text-muted-foreground">{t.stats.users}</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">{t.features.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{t.features.mobile.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{t.features.mobile.description}</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10">
                    <Zap className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">{t.features.chunk.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{t.features.chunk.description}</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/10">
                    <RefreshCw className="h-5 w-5 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">{t.features.resume.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{t.features.resume.description}</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/10">
                    <FileVideo className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">{t.features.multi.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{t.features.multi.description}</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10">
                    <CheckCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <CardTitle className="text-lg">{t.features.validation.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{t.features.validation.description}</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/10">
                    <Wifi className="h-5 w-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg">{t.features.offline.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{t.features.offline.description}</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">{t.benefits.title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-3 p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800">
              <Shield className="h-8 w-8 text-green-600 mx-auto" />
              <div className="font-semibold text-green-900 dark:text-green-100">{t.benefits.reliable}</div>
            </div>
            <div className="text-center space-y-3 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border border-blue-200 dark:border-blue-800">
              <Zap className="h-8 w-8 text-blue-600 mx-auto" />
              <div className="font-semibold text-blue-900 dark:text-blue-100">{t.benefits.fast}</div>
            </div>
            <div className="text-center space-y-3 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border border-purple-200 dark:border-purple-800">
              <FileVideo className="h-8 w-8 text-purple-600 mx-auto" />
              <div className="font-semibold text-purple-900 dark:text-purple-100">{t.benefits.convenient}</div>
            </div>
            <div className="text-center space-y-3 p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border border-orange-200 dark:border-orange-800">
              <Users className="h-8 w-8 text-orange-600 mx-auto" />
              <div className="font-semibold text-orange-900 dark:text-orange-100">{t.benefits.secure}</div>
            </div>
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">{t.recent.title}</h2>
          {uploadedVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedVideos.slice(-6).map((video) => (
                <Card key={video.id} className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-black rounded-lg mb-4 overflow-hidden">
                      <video
                        src={video.preview}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold truncate">{video.title || video.file.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{video.caption}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatFileSize(video.file.size)}</span>
                        <span>{video.location}</span>
                      </div>
                      {video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {video.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardContent className="py-12 text-center">
                <FileVideo className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t.recent.empty}</h3>
                <p className="text-muted-foreground mb-6">{t.recent.tryUpload}</p>
                <Button
                  onClick={() => setShowUploadDialog(true)}
                  className="bg-gradient-to-r from-primary to-accent-yellow hover:from-primary/90 hover:to-accent-yellow/90 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {t.cta.button}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6 py-12 px-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent-yellow/10 border border-primary/20">
          <h2 className="text-3xl font-bold">{t.cta.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.cta.description}</p>
          <Button
            size="lg"
            onClick={() => setShowUploadDialog(true)}
            className="bg-gradient-to-r from-primary to-accent-yellow hover:from-primary/90 hover:to-accent-yellow/90 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Upload className="h-5 w-5 mr-2" />
            {t.cta.button}
          </Button>
        </div>
      </div>

      {/* Upload Dialog */}
      <MobileVideoUpload
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onVideosUpload={handleVideoUpload}
      />
    </div>
  );
};

export default VideoUploadPage;