import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
  Folder
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
}

export const CreatePost: React.FC<CreatePostProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
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

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 10)); // Max 10 images
  };

  const handleCameraCapture = (file: File) => {
    setImages(prev => [...prev, file].slice(0, 10));
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setVideos(prev => [...prev, ...files].slice(0, 3)); // Max 3 videos
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
      title: title.trim(),
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
    setTitle('');
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>{t('createPost.title')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150" />
              <AvatarFallback>{t('createPost.userPlaceholder')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{t('createPost.userPlaceholder')}</p>
              <Select value={privacy} onValueChange={(value: any) => setPrivacy(value)}>
                <SelectTrigger className="w-auto h-auto p-1 border-0 text-xs text-muted-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-3 w-3" />
                      <span>{t('createPost.privacyPublic')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="friends">
                    <div className="flex items-center space-x-2">
                      <Users className="h-3 w-3" />
                      <span>{t('createPost.privacyFriends')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-3 w-3" />
                      <span>{t('createPost.privacyPrivate')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <Input
            placeholder={t('createPost.titlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold border-0 focus-visible:ring-0 px-0"
          />

          {/* Content */}
          <Textarea
            placeholder={t('createPost.placeholder')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none border-0 text-base focus-visible:ring-0"
          />

          {/* Location & Accommodation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{t('createPost.locationLabel')}</span>
              </label>
              <Input
                placeholder={t('createPost.locationPlaceholder')}
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
                <span>{t('createPost.accommodationLabel')}</span>
              </label>
              <Input
                placeholder={t('createPost.accommodationPlaceholder')}
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
              <span>{t('createPost.tagsLabel')}</span>
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
              placeholder={t('createPost.tagsPlaceholder')}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onBlur={addTag}
            />
          </div>

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
                        <h4 className="font-medium">{t('createPost.editImageTitle')}</h4>
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
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCamera(true)}
                className="flex items-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>{t('createPost.cameraButton')}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center space-x-2"
              >
                <Folder className="h-4 w-4" />
                <span>{t('createPost.galleryButton')}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center space-x-2"
              >
                <Video className="h-4 w-4" />
                <span>{t('createPost.videoButton')}</span>
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              {t('createPost.fileCount', { count: images.length + videos.length })}
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

          {/* Submit */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('createPost.cancelButton')}
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? t('createPost.submittingButton') : t('createPost.submitButton')}
            </Button>
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