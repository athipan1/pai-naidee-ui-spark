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
  Hash
} from 'lucide-react';
import { CreatePostData, LocationTag, AccommodationTag } from '@/shared/types/community';
import { cn } from '@/shared/lib/utils';

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
  const [location, setLocation] = useState<LocationTag | undefined>();
  const [accommodation, setAccommodation] = useState<AccommodationTag | undefined>();
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 10)); // Max 10 images
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setVideos(prev => [...prev, ...files].slice(0, 3)); // Max 3 videos
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>สร้างโพสต์ใหม่</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
            placeholder="คุณคิดอะไรอยู่? แบ่งปันเรื่องราวการเดินทางของคุณ..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none border-0 text-base focus-visible:ring-0"
          />

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

          {/* Media Preview */}
          {(images.length > 0 || videos.length > 0) && (
            <div className="space-y-3">
              {/* Images */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Videos */}
              {videos.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {videos.map((video, index) => (
                    <div key={index} className="relative">
                      <video
                        src={URL.createObjectURL(video)}
                        className="w-full h-32 object-cover rounded-lg"
                        controls
                      />
                      <button
                        onClick={() => removeVideo(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
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
          <div className="flex items-center space-x-3 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center space-x-2"
            >
              <ImagePlus className="h-4 w-4" />
              <span>รูปภาพ</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center space-x-2"
            >
              <Video className="h-4 w-4" />
              <span>วิดีโอ</span>
            </Button>

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

          {/* Submit */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? 'กำลังโพสต์...' : 'โพสต์'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};