import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/shared/hooks/use-toast';
import { 
  Camera, 
  Image as ImageIcon, 
  Video, 
  MapPin, 
  Users, 
  Hash, 
  X, 
  Plus,
  ArrowLeft,
  Eye,
  Send,
  Smile,
  Search,
  Loader2,
  CheckCircle,
  FileText,
  Globe
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { CameraCapture } from './CameraCapture';
import { useIsMobile } from '@/shared/hooks/use-mobile';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video';
  preview: string;
}

interface LocationSuggestion {
  id: string;
  name: string;
  description: string;
  coordinates?: { lat: number; lng: number };
}

interface UserSuggestion {
  id: string;
  username: string;
  name: string;
  avatar?: string;
}

interface HashtagSuggestion {
  tag: string;
  count: number;
  trending?: boolean;
}

interface PostData {
  caption: string;
  media: MediaFile[];
  location?: LocationSuggestion;
  taggedUsers: UserSuggestion[];
  hashtags: string[];
  privacy: 'public' | 'friends' | 'private';
}

interface InstagramStylePostCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (postData: PostData) => void;
  isSubmitting?: boolean;
  currentLanguage?: 'th' | 'en';
}

export const InstagramStylePostCreator: React.FC<InstagramStylePostCreatorProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  currentLanguage = 'th'
}) => {
  const isMobile = useIsMobile();
  
  // Media states
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  // Content states
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState<LocationSuggestion | undefined>();
  const [taggedUsers, setTaggedUsers] = useState<UserSuggestion[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  
  // UI states
  const [step, setStep] = useState<'media' | 'details' | 'preview'>('media');
  const [locationInput, setLocationInput] = useState('');
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [userMentionInput, setUserMentionInput] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  
  // Refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);

  // Text content
  const texts = {
    th: {
      newPost: 'โพสต์ใหม่',
      cancel: 'ยกเลิก',
      next: 'ถัดไป',
      back: 'กลับ',
      preview: 'ดูตัวอย่างโพสต์',
      post: 'โพสต์',
      posting: 'กำลังโพสต์...',
      captionPlaceholder: 'เขียนคำบรรยาย...',
      addPhoto: 'เพิ่มรูปภาพ',
      takePhoto: 'ถ่ายรูป',
      addVideo: 'เพิ่มวิดีโอ',
      selectFromGallery: 'เลือกจากแกลเลอรี',
      location: 'สถานที่',
      addLocation: 'เพิ่มสถานที่',
      searchLocation: 'ค้นหาสถานที่...',
      tagFriends: 'แท็กเพื่อน',
      searchFriends: 'ค้นหาเพื่อน...',
      hashtags: 'แท็ก',
      addHashtag: 'เพิ่มแท็ก',
      trending: 'ยอดนิยม',
      public: 'สาธารณะ',
      friends: 'เฉพาะเพื่อน',
      private: 'ส่วนตัว',
      selectMedia: 'เลือกรูปภาพหรือวิดีโอ',
      mediaRequired: 'กรุณาเลือกรูปภาพหรือวิดีโอ',
      maxMedia: 'สามารถเลือกได้สูงสุด 10 ไฟล์',
      removeMedia: 'ลบสื่อ',
      editMedia: 'แก้ไขสื่อ'
    },
    en: {
      newPost: 'New Post',
      cancel: 'Cancel',
      next: 'Next',
      back: 'Back',
      preview: 'Preview Post',
      post: 'Post',
      posting: 'Posting...',
      captionPlaceholder: 'Write a caption...',
      addPhoto: 'Add Photo',
      takePhoto: 'Take Photo',
      addVideo: 'Add Video',
      selectFromGallery: 'Select from Gallery',
      location: 'Location',
      addLocation: 'Add Location',
      searchLocation: 'Search location...',
      tagFriends: 'Tag Friends',
      searchFriends: 'Search friends...',
      hashtags: 'Hashtags',
      addHashtag: 'Add Hashtag',
      trending: 'Trending',
      public: 'Public',
      friends: 'Friends Only',
      private: 'Private',
      selectMedia: 'Select photo or video',
      mediaRequired: 'Please select a photo or video',
      maxMedia: 'Maximum 10 files allowed',
      removeMedia: 'Remove media',
      editMedia: 'Edit media'
    }
  };

  const t = texts[currentLanguage];

  // Mock data - in real app these would come from API
  const locationSuggestions: LocationSuggestion[] = [
    { id: '1', name: 'วัดพระแก้ว', description: 'พระนคร, กรุงเทพฯ' },
    { id: '2', name: 'ดอยสุเทพ', description: 'เชียงใหม่' },
    { id: '3', name: 'หาดป่าตอง', description: 'ภูเก็ต' },
    { id: '4', name: 'ตลาดนัดจตุจักร', description: 'จตุจักร, กรุงเทพฯ' },
  ];

  const userSuggestions: UserSuggestion[] = [
    { id: '1', username: 'travel_lover', name: 'นักเดินทาง', avatar: '' },
    { id: '2', username: 'foodie_thailand', name: 'คนรักอาหาร' },
    { id: '3', username: 'adventure_seeker', name: 'นักผจญภัย' },
  ];

  const trendingHashtags: HashtagSuggestion[] = [
    { tag: 'เชียงใหม่', count: 245, trending: true },
    { tag: 'แบกเป้', count: 189, trending: true },
    { tag: 'เที่ยวคนเดียว', count: 156 },
    { tag: 'สายกิน', count: 134 },
    { tag: 'ประหยัด', count: 98 },
    { tag: 'ธรรมชาติ', count: 87 },
  ];

  const generateMediaId = () => `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleFileSelect = useCallback((files: FileList, type: 'image' | 'video') => {
    if (media.length >= 10) {
      toast({
        title: "Error",
        description: t.maxMedia,
        variant: "destructive"
      });
      return;
    }

    const newMedia: MediaFile[] = [];
    Array.from(files).forEach(file => {
      if (media.length + newMedia.length >= 10) return;
      
      const mediaFile: MediaFile = {
        id: generateMediaId(),
        file,
        type,
        preview: URL.createObjectURL(file)
      };
      newMedia.push(mediaFile);
    });

    setMedia(prev => [...prev, ...newMedia]);
    if (media.length === 0 && newMedia.length > 0) {
      setStep('details');
    }
  }, [media.length, t.maxMedia]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileSelect(files, 'image');
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileSelect(files, 'video');
    }
  };

  const handleCameraCapture = (file: File) => {
    handleFileSelect(new DataTransfer().files, 'image');
    const mediaFile: MediaFile = {
      id: generateMediaId(),
      file,
      type: 'image',
      preview: URL.createObjectURL(file)
    };
    setMedia(prev => [...prev, mediaFile]);
    if (media.length === 0) {
      setStep('details');
    }
  };

  const removeMedia = (id: string) => {
    setMedia(prev => {
      const mediaFile = prev.find(m => m.id === id);
      if (mediaFile) {
        URL.revokeObjectURL(mediaFile.preview);
      }
      const newMedia = prev.filter(m => m.id !== id);
      if (newMedia.length === 0) {
        setStep('media');
      }
      return newMedia;
    });
  };

  const handleCaptionChange = (value: string) => {
    setCaption(value);
    
    // Auto-detect hashtags
    const hashtagMatches = value.match(/#[\u0E00-\u0E7Fa-zA-Z0-9_]+/g);
    if (hashtagMatches) {
      const newHashtags = hashtagMatches.map(tag => tag.substring(1));
      setHashtags(prev => {
        const combined = [...prev, ...newHashtags];
        return [...new Set(combined)]; // Remove duplicates
      });
    }

    // Auto-detect user mentions
    const mentionMatches = value.match(/@[a-zA-Z0-9_]+/g);
    if (mentionMatches) {
      // In a real app, this would trigger user search
      setShowUserSearch(true);
    }
  };

  const addHashtag = (tag: string) => {
    if (!hashtags.includes(tag) && hashtags.length < 30) {
      setHashtags(prev => [...prev, tag]);
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(prev => prev.filter(t => t !== tag));
  };

  const handleLocationSelect = (location: LocationSuggestion) => {
    setLocation(location);
    setLocationInput(location.name);
    setShowLocationSearch(false);
  };

  const handleUserTag = (user: UserSuggestion) => {
    if (!taggedUsers.find(u => u.id === user.id) && taggedUsers.length < 20) {
      setTaggedUsers(prev => [...prev, user]);
      setUserMentionInput('');
      setShowUserSearch(false);
    }
  };

  const removeUserTag = (userId: string) => {
    setTaggedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleSubmit = () => {
    if (media.length === 0) {
      toast({
        title: "Error",
        description: t.mediaRequired,
        variant: "destructive"
      });
      return;
    }

    const postData: PostData = {
      caption,
      media,
      location,
      taggedUsers,
      hashtags,
      privacy
    };

    onSubmit(postData);
  };

  const resetForm = () => {
    // Clean up media URLs
    media.forEach(m => URL.revokeObjectURL(m.preview));
    
    setMedia([]);
    setCaption('');
    setLocation(undefined);
    setTaggedUsers([]);
    setHashtags([]);
    setPrivacy('public');
    setStep('media');
    setLocationInput('');
    setUserMentionInput('');
    setShowLocationSearch(false);
    setShowUserSearch(false);
    setCurrentMediaIndex(0);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onOpenChange(false);
    }
  };

  // Media Selection Step
  const renderMediaStep = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-muted/30 to-muted/10 rounded-2xl border-2 border-dashed border-muted-foreground/25">
        <div className="text-center space-y-6 p-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-accent-yellow flex items-center justify-center shadow-lg">
            <ImageIcon className="h-12 w-12 text-white" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{t.selectMedia}</h3>
            <p className="text-muted-foreground text-sm">
              {t.maxMedia}
            </p>
          </div>

          <div className="space-y-3 w-full max-w-xs">
            <Button
              onClick={() => setShowCamera(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl h-12"
            >
              <Camera className="h-5 w-5 mr-2" />
              {t.takePhoto}
            </Button>

            <Button
              onClick={() => imageInputRef.current?.click()}
              variant="outline"
              className="w-full rounded-xl h-12 border-2 hover:border-primary hover:bg-primary/5"
            >
              <ImageIcon className="h-5 w-5 mr-2" />
              {t.addPhoto}
            </Button>

            <Button
              onClick={() => videoInputRef.current?.click()}
              variant="outline"
              className="w-full rounded-xl h-12 border-2 hover:border-primary hover:bg-primary/5"
            >
              <Video className="h-5 w-5 mr-2" />
              {t.addVideo}
            </Button>
          </div>
        </div>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />

      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        onChange={handleVideoUpload}
        className="hidden"
      />
    </div>
  );

  // Post Details Step
  const renderDetailsStep = () => (
    <div className="space-y-6">
      {/* Media Preview */}
      {media.length > 0 && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-square">
            {media[currentMediaIndex]?.type === 'image' ? (
              <img
                src={media[currentMediaIndex]?.preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={media[currentMediaIndex]?.preview}
                className="w-full h-full object-cover"
                controls
                playsInline
              />
            )}

            {/* Media Navigation */}
            {media.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {media.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      currentMediaIndex === index ? "bg-white" : "bg-white/50"
                    )}
                    onClick={() => setCurrentMediaIndex(index)}
                  />
                ))}
              </div>
            )}

            {/* Remove Media Button */}
            <button
              onClick={() => removeMedia(media[currentMediaIndex]?.id)}
              className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Add More Media */}
          <div className="flex gap-2">
            <Button
              onClick={() => imageInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="rounded-xl"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t.addPhoto}
            </Button>
            <Button
              onClick={() => videoInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="rounded-xl"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t.addVideo}
            </Button>
          </div>
        </div>
      )}

      {/* Caption Input */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150" />
            <AvatarFallback>คุ</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              ref={captionRef}
              placeholder={t.captionPlaceholder}
              value={caption}
              onChange={(e) => handleCaptionChange(e.target.value)}
              className="min-h-[120px] resize-none border-0 bg-transparent text-base focus-visible:ring-0 placeholder:text-muted-foreground/60"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Location */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm font-medium">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{t.location}</span>
        </div>
        
        <div className="relative">
          <Input
            placeholder={t.searchLocation}
            value={locationInput}
            onChange={(e) => {
              setLocationInput(e.target.value);
              setShowLocationSearch(e.target.value.length > 0);
              if (e.target.value.length > 2) {
                setIsSearchingLocation(true);
                // Simulate search delay
                setTimeout(() => setIsSearchingLocation(false), 500);
              }
            }}
            className="rounded-xl"
          />
          
          {showLocationSearch && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
              {isSearchingLocation ? (
                <div className="p-3 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">กำลังค้นหา...</span>
                </div>
              ) : (
                locationSuggestions
                  .filter(loc => loc.name.toLowerCase().includes(locationInput.toLowerCase()))
                  .map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => handleLocationSelect(loc)}
                      className="w-full text-left p-3 hover:bg-muted/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      <div className="font-medium text-sm">{loc.name}</div>
                      <div className="text-xs text-muted-foreground">{loc.description}</div>
                    </button>
                  ))
              )}
            </div>
          )}
        </div>

        {location && (
          <div className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium text-sm">{location.name}</div>
                <div className="text-xs text-muted-foreground">{location.description}</div>
              </div>
            </div>
            <button
              onClick={() => {
                setLocation(undefined);
                setLocationInput('');
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <Separator />

      {/* Tag Friends */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm font-medium">
          <Users className="h-4 w-4 text-primary" />
          <span>{t.tagFriends}</span>
        </div>

        {taggedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {taggedUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center space-x-2 bg-muted/50 rounded-full pl-1 pr-3 py-1"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">@{user.username}</span>
                <button
                  onClick={() => removeUserTag(user.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <Input
            placeholder={t.searchFriends}
            value={userMentionInput}
            onChange={(e) => {
              setUserMentionInput(e.target.value);
              setShowUserSearch(e.target.value.length > 0);
            }}
            className="rounded-xl"
          />

          {showUserSearch && userMentionInput.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
              {userSuggestions
                .filter(user => 
                  user.username.toLowerCase().includes(userMentionInput.toLowerCase()) ||
                  user.name.toLowerCase().includes(userMentionInput.toLowerCase())
                )
                .map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleUserTag(user)}
                    className="w-full text-left p-3 hover:bg-muted/50 transition-colors first:rounded-t-xl last:rounded-b-xl flex items-center space-x-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">@{user.username}</div>
                      <div className="text-xs text-muted-foreground">{user.name}</div>
                    </div>
                  </button>
                ))
              }
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Hashtags */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm font-medium">
          <Hash className="h-4 w-4 text-primary" />
          <span>{t.hashtags}</span>
        </div>

        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center space-x-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <span>#{tag}</span>
                <button
                  onClick={() => removeHashtag(tag)}
                  className="hover:text-primary/70 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Trending Hashtags */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground flex items-center space-x-1">
            <span>{t.trending}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingHashtags.slice(0, 6).map(hashtag => (
              <button
                key={hashtag.tag}
                onClick={() => addHashtag(hashtag.tag)}
                className="text-xs bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground px-2 py-1 rounded-full transition-colors"
              >
                #{hashtag.tag} {hashtag.trending && '🔥'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Preview Step
  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{t.preview}</h3>
        <p className="text-sm text-muted-foreground">ตรวจสอบโพสต์ก่อนเผยแพร่</p>
      </div>

      {/* Post Preview */}
      <div className="border rounded-2xl overflow-hidden bg-background">
        {/* Header */}
        <div className="p-4 flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150" />
            <AvatarFallback>คุ</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium text-sm">คุณผู้ใช้</div>
            {location && (
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{location.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Globe className="h-3 w-3" />
            <span>{t[privacy]}</span>
          </div>
        </div>

        {/* Media */}
        {media.length > 0 && (
          <div className="relative aspect-square bg-black">
            {media[currentMediaIndex]?.type === 'image' ? (
              <img
                src={media[currentMediaIndex]?.preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={media[currentMediaIndex]?.preview}
                className="w-full h-full object-cover"
                controls
                playsInline
              />
            )}

            {media.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {media.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      currentMediaIndex === index ? "bg-white" : "bg-white/50"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-3">
          {caption && (
            <div className="text-sm leading-relaxed">
              {caption}
            </div>
          )}

          {taggedUsers.length > 0 && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>
                กับ {taggedUsers.map(u => `@${u.username}`).join(', ')}
              </span>
            </div>
          )}

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hashtags.map((tag, index) => (
                <span key={index} className="text-xs text-primary">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={cn(
          "max-w-md w-full mx-4 max-h-[95vh] overflow-hidden p-0",
          isMobile ? "h-[95vh]" : "max-h-[90vh]"
        )}>
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              {step !== 'media' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (step === 'details') setStep('media');
                    else if (step === 'preview') setStep('details');
                  }}
                  className="p-1"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <DialogTitle className="text-lg font-semibold">
                {t.newPost}
              </DialogTitle>
            </div>

            <div className="flex items-center space-x-2">
              {step === 'details' && media.length > 0 && (
                <Button
                  onClick={() => setStep('preview')}
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80"
                >
                  {t.next}
                </Button>
              )}
              
              {step === 'preview' && (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t.posting}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {t.post}
                    </>
                  )}
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-muted-foreground hover:text-foreground"
              >
                {t.cancel}
              </Button>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full p-4">
              {step === 'media' && renderMediaStep()}
              {step === 'details' && renderDetailsStep()}
              {step === 'preview' && renderPreviewStep()}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Camera Capture Modal */}
      <CameraCapture
        open={showCamera}
        onOpenChange={setShowCamera}
        onCapture={handleCameraCapture}
      />
    </>
  );
};

export default InstagramStylePostCreator;