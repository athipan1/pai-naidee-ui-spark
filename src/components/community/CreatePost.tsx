import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  ImagePlus, 
  Video, 
  MapPin, 
  Building2, 
  X, 
  Globe, 
  Users, 
  Lock,
  Hash,
  Camera,
  Folder,
  Save,
  Eye,
  Loader2,
  Heart,
  Smile,
  MapPinIcon,
  Navigation,
  Sparkles
} from 'lucide-react';
import { CreatePostData, LocationTag, AccommodationTag } from '@/shared/types/community';
import { cn } from '@/shared/lib/utils';
import { CameraCapture } from './CameraCapture';
import { ImageFilters, ImageFilter } from './ImageFilters';

interface CreatePostProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (postData: CreatePostData) => void;
  isSubmitting?: boolean;
  currentLanguage?: 'th' | 'en';
  onSaveDraft?: (draftData: CreatePostData) => void;
}

// Emotional prompts for travel storytelling
const inspirationalPrompts = {
  th: [
    "แบ่งปันเส้นทางที่ทำให้คุณประทับใจ...",
    "เล่าเรื่องราวการเดินทางที่เปลี่ยนมุมมองของคุณ...",
    "ที่ไหนที่ทำให้หัวใจคุณเต้นแรง?",
    "แรงบันดาลใจจากการเดินทางครั้งล่าสุดของคุณ...",
    "สถานที่ไหนที่ทำให้คุณรู้สึกมีชีวิตชีวา?",
    "ผจญภัยไหนที่คุณอยากแนะนำให้เพื่อนๆ ไป?",
    "ช่วงเวลาไหนในการเดินทางที่คุณจะไม่มีวันลืม?",
  ],
  en: [
    "Share your journey that left you breathless...",
    "Tell us about a trip that changed your perspective...",
    "Where did your heart skip a beat?",
    "What inspired you from your latest adventure?",
    "Which place made you feel most alive?",
    "What adventure would you recommend to fellow travelers?",
    "What travel moment will you never forget?",
  ]
};

// Location suggestions for Thailand
const popularLocations = [
  { name: "ดอยสุเทพ", province: "เชียงใหม่", region: "เหนือ" },
  { name: "หาดไร่เลย์", province: "กระบี่", region: "ใต้" },
  { name: "เกาะพีพี", province: "กระบี่", region: "ใต้" },
  { name: "อยุธยา", province: "พระนครศรีอยุธยา", region: "กลาง" },
  { name: "ปาย", province: "แม่ฮ่องสอน", region: "เหนือ" },
  { name: "เกาะสมุย", province: "สุราษฎร์ธานี", region: "ใต้" },
  { name: "เขาใหญ่", province: "นครราชสีมา", region: "อีสาน" },
  { name: "หัวหิน", province: "ประจวบคีรีขันธ์", region: "กลาง" },
];

export const CreatePost: React.FC<CreatePostProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  currentLanguage = 'th',
  onSaveDraft
}) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [imageFilters, setImageFilters] = useState<Record<number, ImageFilter>>({});
  const [location, setLocation] = useState<LocationTag | undefined>();
  const [accommodation, setAccommodation] = useState<AccommodationTag | undefined>();
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [showCamera, setShowCamera] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Initialize with a random inspirational prompt
  useEffect(() => {
    if (open) {
      const prompts = inspirationalPrompts[currentLanguage];
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      setCurrentPrompt(randomPrompt);
      loadDraft();
    }
  }, [open, currentLanguage]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!open || !content.trim()) return;
    
    const interval = setInterval(() => {
      saveDraft();
    }, 30000);

    return () => clearInterval(interval);
  }, [open, content, images, videos, location, accommodation, tags, privacy]);

  const saveDraft = () => {
    if (!content.trim() && images.length === 0 && videos.length === 0) return;

    const draftData = {
      content: content.trim(),
      images,
      videos,
      location,
      accommodation,
      tags,
      privacy
    };

    localStorage.setItem('post_draft', JSON.stringify({
      ...draftData,
      savedAt: new Date().toISOString()
    }));

    if (onSaveDraft) {
      onSaveDraft(draftData);
    }

    toast.success(currentLanguage === 'th' ? 'บันทึกแบบร่างแล้ว' : 'Draft saved');
  };

  const loadDraft = () => {
    const savedDraft = localStorage.getItem('post_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const savedAt = new Date(draft.savedAt);
        const hoursSinceLastSave = (Date.now() - savedAt.getTime()) / (1000 * 60 * 60);
        
        // Only load draft if it's less than 24 hours old
        if (hoursSinceLastSave < 24) {
          setContent(draft.content || '');
          setLocation(draft.location);
          setAccommodation(draft.accommodation);
          setTags(draft.tags || []);
          setPrivacy(draft.privacy || 'public');
          
          toast.info(currentLanguage === 'th' ? 'โหลดแบบร่างล่าสุด' : 'Loaded recent draft');
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('post_draft');
  };

  const detectCurrentLocation = async () => {
    setIsDetectingLocation(true);
    setErrors(prev => ({ ...prev, location: '' }));

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      // For demo purposes, we'll use the coordinates to suggest a nearby location
      // In a real app, you'd call a reverse geocoding API
      const nearestLocation = popularLocations[Math.floor(Math.random() * popularLocations.length)];
      
      setLocation({
        id: Date.now().toString(),
        name: nearestLocation.name,
        province: nearestLocation.province,
        region: nearestLocation.region,
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      });

      toast.success(currentLanguage === 'th' ? 'ตรวจพบตำแหน่งปัจจุบัน' : 'Current location detected');
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        location: currentLanguage === 'th' 
          ? 'ไม่สามารถตรวจพบตำแหน่งได้' 
          : 'Unable to detect location'
      }));
      toast.error(currentLanguage === 'th' ? 'ไม่สามารถตรวจพบตำแหน่งได้' : 'Unable to detect location');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file size (max 10MB per file)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} ${currentLanguage === 'th' ? 'ขนาดไฟล์ใหญ่เกินไป (สูงสุด 10MB)' : 'is too large (max 10MB)'}`);
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles].slice(0, 10)); // Max 10 images
    setErrors(prev => ({ ...prev, media: '' }));
  };

  const handleCameraCapture = (file: File) => {
    setImages(prev => [...prev, file].slice(0, 10));
    setErrors(prev => ({ ...prev, media: '' }));
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate video file size (max 50MB per file)
    const validFiles = files.filter(file => {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} ${currentLanguage === 'th' ? 'ขนาดไฟล์ใหญ่เกินไป (สูงสุด 50MB)' : 'is too large (max 50MB)'}`);
        return false;
      }
      return true;
    });

    setVideos(prev => [...prev, ...validFiles].slice(0, 3)); // Max 3 videos
    setErrors(prev => ({ ...prev, media: '' }));
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[index];
      // Reindex remaining filters
      const reindexed: Record<number, ImageFilter> = {};
      Object.entries(newFilters).forEach(([key, value]) => {
        const numKey = parseInt(key);
        if (numKey > index) {
          reindexed[numKey - 1] = value;
        } else {
          reindexed[numKey] = value;
        }
      });
      return reindexed;
    });
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 10) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTag();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!content.trim()) {
      newErrors.content = currentLanguage === 'th' 
        ? 'กรุณาเขียนเรื่องราวของคุณ' 
        : 'Please share your story';
    }

    if (content.trim().length > 2000) {
      newErrors.content = currentLanguage === 'th' 
        ? 'เรื่องราวยาวเกินไป (สูงสุด 2000 ตัวอักษร)' 
        : 'Story is too long (max 2000 characters)';
    }

    if (images.length === 0 && videos.length === 0) {
      newErrors.media = currentLanguage === 'th' 
        ? 'กรุณาเพิ่มรูปภาพหรือวิดีโอ' 
        : 'Please add at least one photo or video';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error(currentLanguage === 'th' ? 'กรุณาตรวจสอบข้อมูล' : 'Please check your information');
      return;
    }

    const postData: CreatePostData = {
      content: content.trim(),
      images,
      videos,
      location,
      accommodation,
      tags,
      privacy
    };

    onSubmit(postData);
    clearDraft();
    
    // Reset form
    setContent('');
    setImages([]);
    setVideos([]);
    setImageFilters({});
    setLocation(undefined);
    setAccommodation(undefined);
    setTags([]);
    setTagInput('');
    setPrivacy('public');
    setErrors({});
    setShowPreview(false);
  };

  const getPrivacyIcon = (privacyType: string) => {
    switch (privacyType) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'friends': return <Users className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getPrivacyText = (privacyType: string) => {
    switch (privacyType) {
      case 'public': return 'สาธารณะ';
      case 'friends': return 'เฉพาะเพื่อน';
      case 'private': return 'ส่วนตัว';
      default: return 'สาธารณะ';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <span className="text-lg font-semibold">
                {currentLanguage === 'th' ? 'แบ่งปันเรื่องราวการเดินทาง' : 'Share Your Journey'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {!showPreview && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={saveDraft}
                  className="text-xs"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {currentLanguage === 'th' ? 'บันทึก' : 'Save'}
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs"
              >
                <Eye className="h-4 w-4 mr-1" />
                {showPreview 
                  ? (currentLanguage === 'th' ? 'แก้ไข' : 'Edit')
                  : (currentLanguage === 'th' ? 'ดูตัวอย่าง' : 'Preview')
                }
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {showPreview ? (
          <div className="p-4 space-y-4">
            {/* Preview Content */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-medium mb-3 flex items-center">
                <Smile className="h-4 w-4 mr-2 text-yellow-500" />
                {currentLanguage === 'th' ? 'ตัวอย่างโพสต์' : 'Post Preview'}
              </h3>
              
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150" />
                  <AvatarFallback>คุ</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {currentLanguage === 'th' ? 'คุณผู้ใช้' : 'You'}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center">
                    {getPrivacyIcon(privacy)}
                    <span className="ml-1">{getPrivacyText(privacy)}</span>
                    {location && (
                      <>
                        <span className="mx-1">•</span>
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{location.name}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <p className="text-sm whitespace-pre-wrap">{content}</p>
              </div>

              {/* Media Preview */}
              {(images.length > 0 || videos.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {images.slice(0, 6).map((image, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                      style={{ filter: imageFilters[index]?.filter || 'none' }}
                    />
                  ))}
                  {videos.slice(0, 2).map((video, index) => (
                    <video
                      key={index}
                      src={URL.createObjectURL(video)}
                      className="w-full h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Preview Actions */}
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(false)}
                disabled={isSubmitting}
              >
                {currentLanguage === 'th' ? 'แก้ไข' : 'Edit'}
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {currentLanguage === 'th' ? 'กำลังโพสต์...' : 'Publishing...'}
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    {currentLanguage === 'th' ? 'แบ่งปันเรื่องราว' : 'Share Story'}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150" />
              <AvatarFallback>คุ</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">คุณผู้ใช้</p>
              <Select value={privacy} onValueChange={(value: any) => setPrivacy(value)}>
                <SelectTrigger className="w-auto h-auto p-1 border-0 text-xs text-muted-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-3 w-3" />
                      <span>สาธารณะ</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="friends">
                    <div className="flex items-center space-x-2">
                      <Users className="h-3 w-3" />
                      <span>เฉพาะเพื่อน</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-3 w-3" />
                      <span>ส่วนตัว</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

            {/* Inspirational prompt */}
            <div className="bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-950/20 dark:to-orange-950/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-pink-500" />
                {currentPrompt}
              </p>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Textarea
                placeholder={currentLanguage === 'th' 
                  ? "เล่าเรื่องราวการเดินทางที่น่าจดจำของคุณ... ทำให้นักเดินทางคนอื่นได้รับแรงบันดาลใจ 💭"
                  : "Tell us about your memorable journey... Inspire fellow travelers 💭"
                }
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setErrors(prev => ({ ...prev, content: '' }));
                }}
                className={cn(
                  "min-h-[120px] resize-none border-0 text-base focus-visible:ring-0 bg-transparent",
                  errors.content && "border-red-500"
                )}
              />
              {errors.content && (
                <p className="text-xs text-red-500 flex items-center">
                  <X className="h-3 w-3 mr-1" />
                  {errors.content}
                </p>
              )}
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{content.length}/2000</span>
                <span className="flex items-center">
                  <Heart className="h-3 w-3 mr-1 text-pink-500" />
                  {currentLanguage === 'th' ? 'แรงบันดาลใจให้เพื่อนนักเดินทาง' : 'Inspire fellow travelers'}
                </span>
              </div>
            </div>

            {/* Location & Accommodation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-1">
                  <MapPinIcon className="h-4 w-4 text-green-500" />
                  <span>{currentLanguage === 'th' ? 'สถานที่' : 'Location'}</span>
                </label>
                <div className="flex space-x-2">
                  <Input
                    placeholder={currentLanguage === 'th' ? "เช่น ดอยสุเทพ, เชียงใหม่" : "e.g. Doi Suthep, Chiang Mai"}
                    value={location?.name || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setLocation({
                          id: Date.now().toString(),
                          name: e.target.value,
                          province: location?.province || 'เชียงใหม่' // This would be autocompleted
                        });
                      } else {
                        setLocation(undefined);
                      }
                      setErrors(prev => ({ ...prev, location: '' }));
                    }}
                    className={cn(errors.location && "border-red-500")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={detectCurrentLocation}
                    disabled={isDetectingLocation}
                    className="flex-shrink-0"
                  >
                    {isDetectingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.location && (
                  <p className="text-xs text-red-500 flex items-center">
                    <X className="h-3 w-3 mr-1" />
                    {errors.location}
                  </p>
                )}
            </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-1">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  <span>{currentLanguage === 'th' ? 'ที่พัก' : 'Accommodation'}</span>
                </label>
                <Input
                  placeholder={currentLanguage === 'th' ? "เช่น โรงแรม ABC" : "e.g. ABC Hotel"}
                  value={accommodation?.name || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setAccommodation({
                        id: Date.now().toString(),
                        name: e.target.value,
                        type: 'hotel',
                        location: location || {
                          id: '',
                          name: '',
                          province: ''
                        }
                      });
                    } else {
                      setAccommodation(undefined);
                    }
                  }}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-1">
                <Hash className="h-4 w-4 text-purple-500" />
                <span>{currentLanguage === 'th' ? 'แท็ก' : 'Tags'}</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1 hover:bg-destructive/10 transition-colors">
                    <span>#{tag}</span>
                    <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder={currentLanguage === 'th' 
                  ? "เพิ่มแท็ก (กด Enter เพื่อเพิ่ม)" 
                  : "Add tags (press Enter to add)"
                }
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={addTag}
              />
              <p className="text-xs text-muted-foreground">
                {currentLanguage === 'th' 
                  ? 'แท็กช่วยให้นักเดินทางคนอื่นค้นหาเรื่องราวของคุณได้ง่ายขึ้น' 
                  : 'Tags help other travelers discover your story'
                }
              </p>
            </div>

            {/* Media error */}
            {errors.media && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <X className="h-4 w-4 mr-2" />
                  {errors.media}
                </p>
              </div>
            )}

          {/* Media Preview */}
          {(images.length > 0 || videos.length > 0) && (
            <div className="space-y-4">
              {/* Images */}
              {images.length > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg cursor-pointer"
                          style={{
                            filter: imageFilters[index]?.filter || 'none'
                          }}
                          onClick={() => setSelectedImageIndex(index)}
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {imageFilters[index] && imageFilters[index].name !== 'none' && (
                          <div className="absolute bottom-1 left-1 bg-black/50 text-white px-1 rounded text-xs">
                            {imageFilters[index].label}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Image Filter Editor */}
                  {selectedImageIndex !== null && images[selectedImageIndex] && (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">แก้ไขรูปภาพ</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedImageIndex(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <ImageFilters
                        imageUrl={URL.createObjectURL(images[selectedImageIndex])}
                        selectedFilter={imageFilters[selectedImageIndex]?.name || 'none'}
                        onFilterChange={(filter) => {
                          setImageFilters(prev => ({
                            ...prev,
                            [selectedImageIndex]: filter
                          }));
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Videos */}
              {videos.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {videos.map((video, index) => (
                    <div key={index} className="relative group">
                      <video
                        src={URL.createObjectURL(video)}
                        className="w-full h-32 object-cover rounded-lg"
                        controls
                      />
                      <button
                        onClick={() => removeVideo(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

            {/* Media Upload Buttons */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm flex items-center">
                  <ImagePlus className="h-4 w-4 mr-2 text-green-500" />
                  {currentLanguage === 'th' ? 'เพิ่มรูปภาพ/วิดีโอ' : 'Add Photos/Videos'}
                </h4>
                <div className="text-xs text-muted-foreground">
                  {images.length + videos.length}/10 {currentLanguage === 'th' ? 'ไฟล์' : 'files'}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCamera(true)}
                  className="flex items-center space-x-2 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                >
                  <Camera className="h-4 w-4 text-blue-500" />
                  <span className="hidden sm:inline">{currentLanguage === 'th' ? 'ถ่ายภาพ' : 'Camera'}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center space-x-2 hover:bg-green-50 dark:hover:bg-green-950/20"
                >
                  <Folder className="h-4 w-4 text-green-500" />
                  <span className="hidden sm:inline">{currentLanguage === 'th' ? 'แกลเลอรี' : 'Gallery'}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center space-x-2 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                >
                  <Video className="h-4 w-4 text-purple-500" />
                  <span className="hidden sm:inline">{currentLanguage === 'th' ? 'วิดีโอ' : 'Video'}</span>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                {currentLanguage === 'th' 
                  ? 'รูปภาพ: สูงสุด 10MB, วิดีโอ: สูงสุด 50MB' 
                  : 'Images: max 10MB, Videos: max 50MB'
                }
              </p>

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

            {/* Submit Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="text-muted-foreground"
              >
                {currentLanguage === 'th' ? 'ยกเลิก' : 'Cancel'}
              </Button>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={saveDraft}
                  disabled={isSubmitting || (!content.trim() && images.length === 0 && videos.length === 0)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {currentLanguage === 'th' ? 'บันทึกแบบร่าง' : 'Save Draft'}
                </Button>
                
                <Button 
                  onClick={() => setShowPreview(true)}
                  disabled={!content.trim() && images.length === 0 && videos.length === 0}
                  className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {currentLanguage === 'th' ? 'ดูตัวอย่าง' : 'Preview'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Camera Capture Modal */}
      <CameraCapture
        open={showCamera}
        onOpenChange={setShowCamera}
        onCapture={handleCameraCapture}
      />
    </Dialog>
  );
};