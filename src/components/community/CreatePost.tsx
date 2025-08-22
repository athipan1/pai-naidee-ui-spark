import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  ChevronDown
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { CreatePostData, LocationTag, AccommodationTag } from '@/shared/types/community';
import { cn } from '@/shared/lib/utils';
import { CameraCapture } from './CameraCapture';
import { ImageFilters, ImageFilter } from './ImageFilters';

interface CreatePostProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (postData: CreatePostData) => void;
  isSubmitting?: boolean;
}

export const CreatePost: React.FC<CreatePostProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false
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
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    setImages(prev => [...prev, ...imageFiles].slice(0, 10));
    setVideos(prev => [...prev, ...videoFiles].slice(0, 3));
  };

  const handleCameraCapture = (file: File) => {
    setImages(prev => [...prev, file].slice(0, 10));
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

  const handleSubmit = () => {
    if (!content.trim()) return;

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
<DialogContent className="sm:max-w-2xl w-full h-full sm:h-auto sm:max-h-[90vh] flex flex-col p-0 rounded-none sm:rounded-lg">
  <DialogHeader className="p-4 border-b sm:p-6">
    <DialogTitle className="flex items-center justify-between">
            <span>สร้างโพสต์ใหม่</span>
      <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="sm:hidden">
        <X className="h-5 w-5" />
      </Button>
          </DialogTitle>
        </DialogHeader>

  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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

          {/* Content */}
          <Textarea
            placeholder="แชร์ประสบการณ์น่าประทับใจของคุณ ✨"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none border-0 text-base focus-visible:ring-0"
          />

          {/* Advanced Options */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-center text-sm text-muted-foreground">
                <span className="mr-2">ตัวเลือกขั้นสูง</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", isAdvancedOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4 animate-accordion-down">
              {/* Location & Accommodation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>สถานที่</span>
                  </label>
                  <Input
                    placeholder="เช่น ดอยสุเทพ, เชียงใหม่"
                    value={location?.name || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setLocation({
                          id: Date.now().toString(),
                          name: e.target.value,
                          province: 'เชียงใหม่' // This would be autocompleted
                        });
                      } else {
                        setLocation(undefined);
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-1">
                    <Building2 className="h-4 w-4" />
                    <span>ที่พัก</span>
                  </label>
                  <Input
                    placeholder="เช่น โรงแรม ABC"
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
                  <Hash className="h-4 w-4" />
                  <span>แท็ก</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>#{tag}</span>
                      <button onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="เพิ่มแท็ก (กด Enter เพื่อเพิ่ม)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onBlur={addTag}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Media Preview */}
          {(images.length > 0 || videos.length > 0) && (
            <div className="space-y-4">
              {/* Images */}
              {images.length > 0 && (
                 <div className="space-y-3">
                   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg cursor-pointer"
                          style={{
                            filter: imageFilters[index]?.filter || 'none'
                          }}
                          onClick={() => setSelectedImageIndex(index)}
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 bg-gray-900/70 text-white rounded-full p-0.5"
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {videos.map((video, index) => (
                    <div key={index} className="relative group">
                      <video
                        src={URL.createObjectURL(video)}
                        className="w-full h-full object-cover rounded-lg"
                        controls
                      />
                      <button
                        onClick={() => removeVideo(index)}
                        className="absolute -top-1 -right-1 bg-gray-900/70 text-white rounded-full p-0.5"
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
          <div className="flex items-center gap-2 pt-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowCamera(true)}
              className="flex-1 flex items-center space-x-2"
            >
              <Camera className="h-5 w-5" />
              <span>ถ่ายภาพ</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => imageInputRef.current?.click()}
              className="flex-1 flex items-center space-x-2"
            >
              <ImagePlus className="h-5 w-5" />
              <span>รูปภาพ/วิดีโอ</span>
            </Button>
          </div>

        </div>

        {/* Hidden File Inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Sticky Footer for Actions */}
        <div className="p-4 border-t bg-background">
            <div className="flex justify-between items-center">
                 <div className="text-xs text-muted-foreground">
                    {images.length + videos.length}/13 ไฟล์
                </div>
                <div className="flex space-x-2">
                    <Button
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                    className="hidden sm:inline-flex"
                    >
                    ยกเลิก
                    </Button>
                    <Button
                    onClick={handleSubmit}
                    disabled={!content.trim() || isSubmitting}
                    className="bg-travel-green-500 hover:bg-travel-green-500/90 text-white font-bold py-3 px-6 rounded-lg w-full sm:w-auto"
                    >
                    {isSubmitting ? 'กำลังโพสต์...' : 'โพสต์'}
                    </Button>
                </div>
            </div>
        </div>
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