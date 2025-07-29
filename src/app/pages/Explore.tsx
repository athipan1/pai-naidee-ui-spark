import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Plus,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreVertical,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoUpload from "@/components/VideoUpload";

interface VideoPost {
  id: string;
  videoUrl: string;
  thumbnail: string;
  title: string;
  location: string;
  province: string;
  hashtags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  user: {
    id: string;
    name: string;
    avatar: string;
    isFollowing: boolean;
  };
  createdAt: string;
}

interface ExploreProps {
  currentLanguage: "th" | "en";
  onBack: () => void;
}

const Explore = ({ currentLanguage, onBack }: ExploreProps) => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoPosts, setVideoPosts] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const content = {
    th: {
      search: "ค้นหา",
      upload: "อัปโหลด",
      likes: "การถูกใจ",
      comments: "ความคิดเห็น",
      share: "แชร์",
      save: "บันทึก",
      follow: "ติดตาม",
      following: "กำลังติดตาม",
      viewDetails: "ดูรายละเอียด",
      noVideos: "ยังไม่มีวิดีโอในตอนนี้",
      uploadFirst: "ลองอัปโหลดเป็นคนแรกสิ!",
      loading: "กำลังโหลดวิดีโอ...",
      today: "วันนี้",
      yesterday: "เมื่อวาน",
    },
    en: {
      search: "Search",
      upload: "Upload",
      likes: "Likes",
      comments: "Comments",
      share: "Share",
      save: "Save",
      follow: "Follow",
      following: "Following",
      viewDetails: "View Details",
      noVideos: "No videos available",
      uploadFirst: "Be the first to upload!",
      loading: "Loading videos...",
      today: "Today",
      yesterday: "Yesterday",
    },
  };

  const t = content[currentLanguage];

  // Mock data for video posts
  useEffect(() => {
    const mockPosts: VideoPost[] = [
      {
        id: "1",
        videoUrl:
          "https://videos.pexels.com/video-files/3209828/3209828-hd_1280_720_25fps.mp4", // In real app, this would be actual video URLs
        thumbnail: "/src/shared/assets/hero-beach.jpg",
        title: "เกาะสวยน้ำใสที่เกาะพีพี",
        location: "เกาะพีพี",
        province: "กระบี่",
        hashtags: ["#ทะเล", "#เกาะ", "#กระบี่", "#พีพี"],
        likes: 1247,
        comments: 89,
        shares: 34,
        isLiked: false,
        isSaved: false,
        user: {
          id: "user1",
          name: "นัท Travel",
          avatar: "/placeholder-avatar.jpg",
          isFollowing: false,
        },
        createdAt: "2024-01-15",
      },
      {
        id: "2",
        videoUrl:
          "https://videos.pexels.com/video-files/5490235/5490235-hd_1280_720_25fps.mp4",
        thumbnail: "/src/shared/assets/temple-culture.jpg",
        title: "วัดสวยๆ ในเชียงใหม่",
        location: "วัดพระธาตุดอยสุเทพ",
        province: "เชียงใหม่",
        hashtags: ["#วัด", "#เชียงใหม่", "#วัฒนธรรม", "#ดอยสุเทพ"],
        likes: 892,
        comments: 67,
        shares: 23,
        isLiked: true,
        isSaved: true,
        user: {
          id: "user2",
          name: "เที่ยวไทย",
          avatar: "/placeholder-avatar2.jpg",
          isFollowing: true,
        },
        createdAt: "2024-01-14",
      },
      {
        id: "3",
        videoUrl:
          "https://videos.pexels.com/video-files/5898740/5898740-hd_1280_720_25fps.mp4",
        thumbnail: "/src/shared/assets/mountain-nature.jpg",
        title: "ทะเลหมอกสวยๆ ที่ภูทับเบิก",
        location: "ภูทับเบิก",
        province: "เพชรบูรณ์",
        hashtags: ["#ภูเขา", "#ทะเลหมอก", "#เพชรบูรณ์", "#ธรรมชาติ"],
        likes: 2156,
        comments: 156,
        shares: 89,
        isLiked: false,
        isSaved: false,
        user: {
          id: "user3",
          name: "ภูเขาไทย",
          avatar: "/placeholder-avatar3.jpg",
          isFollowing: false,
        },
        createdAt: "2024-01-13",
      },
    ];

    setTimeout(() => {
      setVideoPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLike = (postId: string) => {
    setVideoPosts((posts) =>
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleSave = (postId: string) => {
    setVideoPosts((posts) =>
      posts.map((post) =>
        post.id === postId ? { ...post, isSaved: !post.isSaved } : post
      )
    );
  };

  const handleFollow = (userId: string) => {
    setVideoPosts((posts) =>
      posts.map((post) =>
        post.user.id === userId
          ? {
              ...post,
              user: { ...post.user, isFollowing: !post.user.isFollowing },
            }
          : post
      )
    );
  };

  const togglePlayPause = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const handleVideoUpload = (videoData: {
    videoFile: File;
    caption: string;
    tags: string[];
    title: string;
    location: string;
    province: string;
  }) => {
    // Create a new video post
    const newPost: VideoPost = {
      id: `user_${Date.now()}`,
      videoUrl: URL.createObjectURL(videoData.videoFile), // In a real app, this would be uploaded to a server
      thumbnail: URL.createObjectURL(videoData.videoFile), // Would generate thumbnail on server
      title: videoData.title,
      location: videoData.location,
      province: videoData.province,
      hashtags: videoData.tags.map((tag) => `#${tag}`),
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isSaved: false,
      user: {
        id: "current_user",
        name: currentLanguage === "th" ? "คุณ" : "You",
        avatar: "/placeholder-avatar.jpg",
        isFollowing: false,
      },
      createdAt: new Date().toISOString().split("T")[0],
    };

    // Add the new post to the beginning of the list
    setVideoPosts((posts) => [newPost, ...posts]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (videoPosts.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 px-6">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-medium text-foreground mb-2">
              {t.noVideos}
            </p>
            <p className="text-muted-foreground">{t.uploadFirst}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <h1 className="text-lg font-bold text-foreground">
            {currentLanguage === "th" ? "สำรวจ" : "Explore"}
          </h1>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowUploadModal(true)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Video Feed */}
      <div className="pt-16 pb-20">
        {videoPosts.map((post, index) => (
          <div key={post.id} className="relative h-screen w-full bg-black">
            {/* Video Background */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${post.thumbnail})` }}
            >
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Play/Pause Overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
              onClick={() => togglePlayPause(index)}
            >
              {!isPlaying && (
                <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              )}
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 z-20 flex">
              {/* Left side - Content */}
              <div className="flex-1 flex flex-col justify-end p-4 space-y-4">
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent-yellow rounded-full p-0.5">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-accent-sky rounded-full" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{post.user.name}</p>
                    <p className="text-white/80 text-sm">{t.today}</p>
                  </div>
                  <Button
                    variant={post.user.isFollowing ? "secondary" : "default"}
                    size="sm"
                    onClick={() => handleFollow(post.user.id)}
                  >
                    {post.user.isFollowing ? t.following : t.follow}
                  </Button>
                </div>

                {/* Location & Title */}
                <div className="space-y-2">
                  <h3 className="text-white text-lg font-bold">{post.title}</h3>
                  <div className="flex items-center text-white/90">
                    <span className="text-sm">
                      {post.location}, {post.province}
                    </span>
                  </div>

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-2">
                    {post.hashtags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-accent-yellow text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* View Details Button */}
                <Button
                  variant="outline"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  onClick={() => navigate(`/attraction/${post.id}`)}
                >
                  {t.viewDetails}
                </Button>
              </div>

              {/* Right side - Action Buttons */}
              <div className="w-16 flex flex-col justify-end items-center space-y-6 p-4">
                {/* Like */}
                <div className="flex flex-col items-center space-y-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full ${post.isLiked ? "text-red-500" : "text-white"} hover:bg-white/20`}
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart
                      className={`w-7 h-7 ${post.isLiked ? "fill-current" : ""}`}
                    />
                  </Button>
                  <span className="text-white text-xs">
                    {formatNumber(post.likes)}
                  </span>
                </div>

                {/* Comment */}
                <div className="flex flex-col items-center space-y-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white rounded-full hover:bg-white/20"
                  >
                    <MessageCircle className="w-7 h-7" />
                  </Button>
                  <span className="text-white text-xs">
                    {formatNumber(post.comments)}
                  </span>
                </div>

                {/* Share */}
                <div className="flex flex-col items-center space-y-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white rounded-full hover:bg-white/20"
                  >
                    <Share className="w-7 h-7" />
                  </Button>
                  <span className="text-white text-xs">
                    {formatNumber(post.shares)}
                  </span>
                </div>

                {/* Save */}
                <div className="flex flex-col items-center space-y-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full ${post.isSaved ? "text-accent-yellow" : "text-white"} hover:bg-white/20`}
                    onClick={() => handleSave(post.id)}
                  >
                    <Bookmark
                      className={`w-6 h-6 ${post.isSaved ? "fill-current" : ""}`}
                    />
                  </Button>
                </div>

                {/* More */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white rounded-full hover:bg-white/20"
                >
                  <MoreVertical className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Upload Modal */}
      <VideoUpload
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onVideoUpload={handleVideoUpload}
        currentLanguage={currentLanguage}
      />
    </div>
  );
};

export default Explore;
