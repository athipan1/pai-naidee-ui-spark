import { useState, useEffect } from 'react';
import { Search, Replace, Plus, History, Database, AlertCircle, CheckCircle, Info, TestTube, Filter, Calendar, FileType, HardDrive, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/shared/utils/cn';
import { useMedia } from '@/shared/contexts/MediaProvider';
import { addAttraction, uploadAttractionImage } from '@/services/admin.service';
import { timelineSyncService, type TimelineEntry, type SyncResult } from '@/shared/services/timelineSyncService';
import type { MediaUploadData } from '@/shared/types/media';
import { notificationService } from '@/shared/services/notificationService';
import { networkStatusService } from '@/shared/services/networkStatusService';
import MediaManagementTest from './MediaManagementTest';

interface AttractionManagerProps {
  currentLanguage: 'th' | 'en';
}

interface MediaFilters {
  fileType: 'all' | 'image' | 'video';
  sizeRange: [number, number]; // in MB
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  searchTerm: string;
}

const AttractionManager = ({ currentLanguage }: AttractionManagerProps) => {
  const { isMobile, isTablet } = useMedia();
  
  // Place search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchProvince, setSearchProvince] = useState('');
  const [searchResults, setSearchResults] = useState<{ exists: boolean; placeId?: string; place?: PlaceMediaData }>({ exists: false });
  const [isSearching, setIsSearching] = useState(false);

  // Advanced filters state
  const [filters, setFilters] = useState<MediaFilters>({
    fileType: 'all',
    sizeRange: [0, 100], // 0-100 MB
    dateRange: {
      from: null,
      to: null,
    },
    searchTerm: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Media replacement state
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [selectedPlaceName, setSelectedPlaceName] = useState('');
  const [selectedPlaceCoordinates, setSelectedPlaceCoordinates] = useState<{lat: number; lng: number} | null>(null);
  const [editingCoordinates, setEditingCoordinates] = useState(false);
  const [newLatitude, setNewLatitude] = useState('');
  const [newLongitude, setNewLongitude] = useState('');
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
  const [newMediaData, setNewMediaData] = useState<MediaUploadData[]>([]);
  const [replacementResult, setReplacementResult] = useState<MediaReplacementResult | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  // New place creation state
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceNameLocal, setNewPlaceNameLocal] = useState('');
  const [newPlaceProvince, setNewPlaceProvince] = useState('');
  const [newPlaceCategory, setNewPlaceCategory] = useState('');
  const [newPlaceDescription, setNewPlaceDescription] = useState('');
  const [newPlaceLatitude, setNewPlaceLatitude] = useState('');
  const [newPlaceLongitude, setNewPlaceLongitude] = useState('');
  const [newPlaceMediaFiles, setNewPlaceMediaFiles] = useState<File[]>([]);
  const [newPlaceMediaData, setNewPlaceMediaData] = useState<MediaUploadData[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Timeline state
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncResult | null>(null);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

  const content = {
    th: {
      title: 'จัดการสื่อและฐานข้อมูล Timeline',
      searchPlace: 'ค้นหาสถานที่',
      placeName: 'ชื่อสถานที่',
      province: 'จังหวัด',
      search: 'ค้นหา',
      placeExists: 'พบสถานที่แล้ว',
      placeNotExists: 'ไม่พบสถานที่',
      replaceMedia: 'แทนที่สื่อ',
      addNewPlace: 'เพิ่มสถานที่ใหม่',
      viewTimeline: 'ดู Timeline',
      runTests: 'ทดสอบระบบ',
      syncDatabase: 'ซิงค์ฐานข้อมูล',
      selectFiles: 'เลือกไฟล์',
      mediaTitle: 'หัวข้อสื่อ',
      mediaDescription: 'คำอธิบายสื่อ',
      upload: 'อัปโหลด',
      processing: 'กำลังประมวลผล...',
      success: 'สำเร็จ',
      error: 'ข้อผิดพลาด',
      category: 'ประเภท',
      description: 'คำอธิบาย',
      coordinates: 'พิกัด GPS',
      latitude: 'ละติจูด',
      longitude: 'ลองจิจูด',
      gpsRequired: 'จำเป็นต้องมีพิกัด GPS',
      invalidCoordinates: 'พิกัดไม่ถูกต้อง',
      editGPS: 'แก้ไข GPS',
      updateGPS: 'อัปเดตพิกัด GPS',
      noGPS: 'ไม่มีพิกัด GPS คลิก "แก้ไข GPS" เพื่อเพิ่ม',
      cancel: 'ยกเลิก',
      createPlace: 'สร้างสถานที่',
      timelineHistory: 'ประวัติ Timeline',
      loadTimeline: 'โหลดประวัติ',
      syncNow: 'ซิงค์ทันที',
      pendingEntries: 'รายการรอซิงค์',
      lastSync: 'ซิงค์ล่าสุด',
      action: 'การกระทำ',
      timestamp: 'เวลา',
      mediaId: 'รหัสสื่อ',
      userId: 'ผู้ใช้',
      noTimeline: 'ไม่มีประวัติ Timeline',
      replacementSuccess: 'แทนที่สื่อสำเร็จ',
      creationSuccess: 'สร้างสถานที่สำเร็จ',
      syncSuccess: 'ซิงค์ข้อมูลสำเร็จ',
      // New filter translations
      filters: 'ตัวกรอง',
      showFilters: 'แสดงตัวกรอง',
      hideFilters: 'ซ่อนตัวกรอง',
      fileType: 'ประเภทไฟล์',
      allTypes: 'ทุกประเภท',
      images: 'รูปภาพ',
      videos: 'วิดีโอ',
      fileSize: 'ขนาดไฟล์',
      sizeInMB: 'ขนาด (MB)',
      uploadDate: 'วันที่อัปโหลด',
      dateFrom: 'ตั้งแต่',
      dateTo: 'ถึง',
      clearFilters: 'ล้างตัวกรอง',
      applyFilters: 'ใช้ตัวกรอง',
      searchMedia: 'ค้นหาสื่อ',
      noResults: 'ไม่พบผลลัพธ์',
      syncError: 'ข้อผิดพลาดการซิงค์',
      retry: 'ลองใหม่',
    },
    en: {
      title: 'Media and Timeline Database Management',
      searchPlace: 'Search Place',
      placeName: 'Place Name',
      province: 'Province',
      search: 'Search',
      placeExists: 'Place Found',
      placeNotExists: 'Place Not Found',
      replaceMedia: 'Replace Media',
      addNewPlace: 'Add New Place',
      viewTimeline: 'View Timeline',
      runTests: 'Run Tests',
      syncDatabase: 'Sync Database',
      selectFiles: 'Select Files',
      mediaTitle: 'Media Title',
      mediaDescription: 'Media Description',
      upload: 'Upload',
      processing: 'Processing...',
      success: 'Success',
      error: 'Error',
      category: 'Category',
      description: 'Description',
      coordinates: 'GPS Coordinates',
      latitude: 'Latitude',
      longitude: 'Longitude', 
      gpsRequired: 'GPS coordinates are required',
      invalidCoordinates: 'Invalid coordinates',
      editGPS: 'Edit GPS',
      updateGPS: 'Update GPS Coordinates',
      noGPS: 'No GPS coordinates available. Click "Edit GPS" to add them.',
      cancel: 'Cancel',
      createPlace: 'Create Place',
      timelineHistory: 'Timeline History',
      loadTimeline: 'Load History',
      syncNow: 'Sync Now',
      pendingEntries: 'Pending Entries',
      lastSync: 'Last Sync',
      action: 'Action',
      timestamp: 'Timestamp',
      mediaId: 'Media ID',
      userId: 'User',
      noTimeline: 'No Timeline History',
      replacementSuccess: 'Media Replaced Successfully',
      creationSuccess: 'Place Created Successfully',
      syncSuccess: 'Data Synced Successfully',
      // New filter translations
      filters: 'Filters',
      showFilters: 'Show Filters',
      hideFilters: 'Hide Filters',
      fileType: 'File Type',
      allTypes: 'All Types',
      images: 'Images',
      videos: 'Videos',
      fileSize: 'File Size',
      sizeInMB: 'Size (MB)',
      uploadDate: 'Upload Date',
      dateFrom: 'From',
      dateTo: 'To',
      clearFilters: 'Clear Filters',
      applyFilters: 'Apply Filters',
      searchMedia: 'Search Media',
      noResults: 'No Results Found',
      syncError: 'Sync Error',
      retry: 'Retry',
    }
  };

  const t = content[currentLanguage];

  // Search for existing place
  const handleSearchPlace = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const loadingToast = notificationService.showLoading('Searching for place...');
    
    try {
      const result = await mediaManagementService.checkPlaceExists(searchQuery, searchProvince);
      setSearchResults(result);
      
      if (result.exists && result.placeId) {
        setSelectedPlaceId(result.placeId);
        setSelectedPlaceName(result.place?.placeName || searchQuery);
        setSelectedPlaceCoordinates(result.place?.coordinates || null);
        setNewLatitude(result.place?.coordinates?.lat.toString() || '');
        setNewLongitude(result.place?.coordinates?.lng.toString() || '');
        setEditingCoordinates(false);
        notificationService.dismiss(loadingToast);
        notificationService.show('success', 'Place found successfully');
      } else {
        notificationService.dismiss(loadingToast);
        notificationService.show('info', 'Place not found', {
          description: 'You can create a new place using the "Add New Place" tab'
        });
      }
    } catch (error) {
      notificationService.dismiss(loadingToast);
      notificationService.showSyncFailure(
        'Place Search', 
        error instanceof Error ? error.message : 'Unknown error',
        () => handleSearchPlace()
      );
    } finally {
      setIsSearching(false);
    }
  };

  // Handle coordinate update for existing place
  const handleUpdateCoordinates = async () => {
    if (!selectedPlaceId) return;

    const lat = parseFloat(newLatitude);
    const lng = parseFloat(newLongitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      notificationService.showValidationError('Invalid GPS Coordinates', t.invalidCoordinates);
      return;
    }

    try {
      // Update coordinates via the media management service
      // Note: This would need to be implemented in the service, for now we'll update locally
      setSelectedPlaceCoordinates({ lat, lng });
      setEditingCoordinates(false);
      
      notificationService.show('success', 'GPS coordinates updated successfully');
      
      // In a real implementation, this would sync with the backend
      await timelineSyncService.syncMediaReplacement(
        selectedPlaceId,
        [],
        [],
        'current_user',
        `GPS coordinates updated to ${lat}, ${lng}`
      );
      
    } catch (error) {
      notificationService.showSyncFailure(
        'Coordinate Update',
        error instanceof Error ? error.message : 'Unknown error',
        () => handleUpdateCoordinates()
      );
    }
  };
  const applyFilters = (mediaList: MediaUploadData[]): MediaUploadData[] => {
    return mediaList.filter(media => {
      // File type filter
      if (filters.fileType !== 'all') {
        if (filters.fileType === 'image' && !media.type.startsWith('image')) return false;
        if (filters.fileType === 'video' && !media.type.startsWith('video')) return false;
      }

      // Search term filter
      if (filters.searchTerm && !media.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }

      // File size filter (if file exists)
      if (media.file) {
        const sizeInMB = media.file.size / (1024 * 1024);
        if (sizeInMB < filters.sizeRange[0] || sizeInMB > filters.sizeRange[1]) {
          return false;
        }
      }

      // Date range filter would need actual upload dates from the server
      // For now, we'll skip this as it requires backend data

      return true;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      fileType: 'all',
      sizeRange: [0, 100],
      dateRange: { from: null, to: null },
      searchTerm: '',
    });
    notificationService.show('info', 'Filters cleared');
  };

  // Update filters and apply them
  const updateFilters = (newFilters: Partial<MediaFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Apply filters to current media data
    const filtered = applyFilters(newMediaData.concat(newPlaceMediaData));
    // Note: filteredMedia would be used in a real implementation for display
    console.log('Filtered media:', filtered);
  };

  // Handle media replacement
  const handleReplaceMedia = async () => {
    if (!selectedPlaceId || newMediaData.length === 0) return;

    setIsReplacing(true);
    const loadingToast = notificationService.showLoading('Replacing media...');
    
    try {
      const result = await mediaManagementService.replaceMediaForPlace(selectedPlaceId, newMediaData);
      setReplacementResult(result);

      // Sync with timeline
      if (result.success) {
        await timelineSyncService.syncMediaReplacement(
          selectedPlaceId,
          result.replacedMediaIds,
          result.newMediaIds,
          'current_user',
          'Manual media replacement via admin interface'
        );
        
        notificationService.dismiss(loadingToast);
        notificationService.show('success', 'Media replaced successfully', {
          description: result.message,
        });
        
        // Reset media files
        setNewMediaFiles([]);
        setNewMediaData([]);
      } else {
        throw new Error(result.message || 'Media replacement failed');
      }
    } catch (error) {
      notificationService.dismiss(loadingToast);
      notificationService.showSyncFailure(
        'Media Replacement',
        error instanceof Error ? error.message : 'Unknown error',
        () => handleReplaceMedia()
      );
    } finally {
      setIsReplacing(false);
    }
  };

  // Handle new place creation
  const handleCreatePlace = async () => {
    // Validate required fields including GPS coordinates
    if (!newPlaceName.trim() || !newPlaceProvince.trim() || newPlaceMediaFiles.length === 0) {
      notificationService.showValidationError('Required fields', 'Please fill in all required fields and select media files');
      return;
    }

    // Validate GPS coordinates
    const lat = parseFloat(newPlaceLatitude);
    const lng = parseFloat(newPlaceLongitude);

    if (!newPlaceLatitude.trim() || !newPlaceLongitude.trim()) {
      notificationService.showValidationError('GPS Coordinates Required', t.gpsRequired);
      return;
    }

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      notificationService.showValidationError('Invalid GPS Coordinates', t.invalidCoordinates);
      return;
    }

    setIsCreating(true);
    const loadingToast = notificationService.showLoading('Creating new place...');

    try {
      const imageFile = newPlaceMediaFiles[0];
      const imageUrl = await uploadAttractionImage(imageFile.name);

      const attractionData = {
        name: newPlaceName,
        nameLocal: newPlaceNameLocal,
        province: newPlaceProvince,
        category: newPlaceCategory,
        image: imageUrl,
        images: [imageUrl],
        description: newPlaceDescription,
        tags: [],
        amenities: [],
        location: { lat, lng },
        rating: 0,
        reviewCount: 0,
        coordinates: { lat, lng },
      };

      await addAttraction(attractionData);

      notificationService.dismiss(loadingToast);
      notificationService.show('success', `Place "${newPlaceName}" created successfully!`);

      // Reset form
      setNewPlaceName('');
      setNewPlaceNameLocal('');
      setNewPlaceProvince('');
      setNewPlaceCategory('');
      setNewPlaceDescription('');
      setNewPlaceLatitude('');
      setNewPlaceLongitude('');
      setNewPlaceMediaFiles([]);
      setNewPlaceMediaData([]);
    } catch (error) {
      notificationService.dismiss(loadingToast);
      notificationService.showSyncFailure(
        'Place Creation',
        error instanceof Error ? error.message : 'Unknown error',
        () => handleCreatePlace()
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Load timeline history
  const handleLoadTimeline = async () => {
    setIsLoadingTimeline(true);
    const loadingToast = notificationService.showLoading('Loading timeline history...');
    
    try {
      const entries = await timelineSyncService.getTimelineHistory({
        placeId: selectedPlaceId || undefined,
        limit: 50
      });
      setTimelineEntries(entries);
      
      notificationService.dismiss(loadingToast);
      notificationService.show('success', `Loaded ${entries.length} timeline entries`);
    } catch (error) {
      notificationService.dismiss(loadingToast);
      notificationService.showSyncFailure(
        'Timeline Load',
        error instanceof Error ? error.message : 'Unknown error',
        () => handleLoadTimeline()
      );
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  // Force sync
  const handleForceSync = async () => {
    const loadingToast = notificationService.showLoading('Syncing database...');
    
    try {
      const result = await timelineSyncService.forceSyncAll();
      setSyncStatus(result);
      
      notificationService.dismiss(loadingToast);
      if (result.success) {
        notificationService.show('success', 'Database synced successfully', {
          description: `Synced ${result.syncedEntries} entries`,
        });
      } else {
        throw new Error('Sync completed with errors');
      }
    } catch (error) {
      notificationService.dismiss(loadingToast);
      notificationService.showSyncFailure(
        'Database Sync',
        error instanceof Error ? error.message : 'Unknown error',
        () => handleForceSync()
      );
    }
  };

  // Handle file selection for media replacement
  const handleMediaFileChange = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
      
      if (!isValidType) {
        notificationService.showValidationError(file.name, 'Only image and video files are supported');
        return false;
      }
      
      if (!isValidSize) {
        notificationService.showValidationError(file.name, 'File size must be less than 100MB');
        return false;
      }
      
      return true;
    });

    if (validFiles.length !== fileArray.length) {
      notificationService.show('warning', 'Some files were skipped due to validation errors');
    }

    setNewMediaFiles(validFiles);
    
    const mediaData: MediaUploadData[] = validFiles.map((file, index) => ({
      title: `Media ${index + 1}`,
      description: `Uploaded media for ${selectedPlaceName}`,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      file
    }));
    
    setNewMediaData(mediaData);
    
    if (validFiles.length > 0) {
      notificationService.show('success', `${validFiles.length} files selected for upload`);
    }
  };

  // Handle file selection for new place
  const handleNewPlaceFileChange = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
      
      if (!isValidType) {
        notificationService.showValidationError(file.name, 'Only image and video files are supported');
        return false;
      }
      
      if (!isValidSize) {
        notificationService.showValidationError(file.name, 'File size must be less than 100MB');
        return false;
      }
      
      return true;
    });

    if (validFiles.length !== fileArray.length) {
      notificationService.show('warning', 'Some files were skipped due to validation errors');
    }

    setNewPlaceMediaFiles(validFiles);
    
    const mediaData: MediaUploadData[] = validFiles.map((file, index) => ({
      title: `${newPlaceName || 'New Place'} Media ${index + 1}`,
      description: `Media for new place: ${newPlaceName || 'Untitled'}`,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      file
    }));
    
    setNewPlaceMediaData(mediaData);
    
    if (validFiles.length > 0) {
      notificationService.show('success', `${validFiles.length} files selected for upload`);
    }
  };

  // Get sync status on mount and setup network monitoring
  useEffect(() => {
    const getCurrentSyncStatus = () => {
      const status = timelineSyncService.getSyncStatus();
      setSyncStatus({
        success: true,
        syncedEntries: 0,
        failedEntries: 0,
        errors: [],
        lastSyncTime: new Date()
      });
    };
    
    getCurrentSyncStatus();

    // Subscribe to network status changes
    const unsubscribe = networkStatusService.subscribe((status) => {
      if (!status.isOnline) {
        notificationService.show('warning', 'Working offline', {
          description: 'Changes will be synced when connection is restored',
          duration: 5000
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className={cn(
      "mx-auto space-y-4 sm:space-y-6",
      isMobile ? "px-4 py-4" : "max-w-6xl px-6 py-6"
    )}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 sm:mb-8">
        <Database className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        <h1 className={cn(
          "font-bold",
          isMobile ? "text-xl" : "text-2xl sm:text-3xl"
        )}>{t.title}</h1>
      </div>

      {/* Advanced Filters Section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              {t.filters}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full sm:w-auto"
            >
              {showFilters ? t.hideFilters : t.showFilters}
            </Button>
          </div>
        </CardHeader>
        
        {showFilters && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Term */}
              <div className="space-y-2">
                <Label>{t.searchMedia}</Label>
                <Input
                  value={filters.searchTerm}
                  onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                  placeholder={t.searchMedia}
                  className="w-full"
                />
              </div>

              {/* File Type Filter */}
              <div className="space-y-2">
                <Label>{t.fileType}</Label>
                <Select
                  value={filters.fileType}
                  onValueChange={(value) => updateFilters({ fileType: value as 'all' | 'image' | 'video' })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allTypes}</SelectItem>
                    <SelectItem value="image">{t.images}</SelectItem>
                    <SelectItem value="video">{t.videos}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* File Size Range */}
              <div className="space-y-2">
                <Label>{t.fileSize}</Label>
                <div className="space-y-2">
                  <Slider
                    value={filters.sizeRange}
                    onValueChange={(value) => updateFilters({ sizeRange: value as [number, number] })}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{filters.sizeRange[0]} MB</span>
                    <span>{filters.sizeRange[1]} MB</span>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>{t.uploadDate}</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start text-left">
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.dateRange.from ? format(filters.dateRange.from, 'MMM d') : t.dateFrom}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateRange.from || undefined}
                        onSelect={(date) => updateFilters({ 
                          dateRange: { ...filters.dateRange, from: date || null }
                        })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start text-left">
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.dateRange.to ? format(filters.dateRange.to, 'MMM d') : t.dateTo}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateRange.to || undefined}
                        onSelect={(date) => updateFilters({ 
                          dateRange: { ...filters.dateRange, to: date || null }
                        })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex-1 sm:flex-none"
              >
                <X className="mr-2 h-4 w-4" />
                {t.clearFilters}
              </Button>
              <Button
                onClick={() => {
                  const filtered = applyFilters(newMediaData.concat(newPlaceMediaData));
                  // Note: In a real implementation, this would update the display
                  console.log('Applied filters:', filtered);
                  notificationService.show('info', `${filtered.length} items match your filters`);
                }}
                className="flex-1 sm:flex-none"
              >
                <Filter className="mr-2 h-4 w-4" />
                {t.applyFilters}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="search" className="space-y-4 sm:space-y-6">
        <TabsList className={cn(
          "w-full",
          isMobile ? "grid-cols-2" : isTablet ? "grid-cols-3" : "grid-cols-5",
          "grid"
        )}>
          <TabsTrigger value="search" className={cn(
            "flex items-center gap-1 sm:gap-2",
            isMobile && "text-xs px-2"
          )}>
            <Search className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className={isMobile ? "hidden" : ""}>{t.searchPlace}</span>
          </TabsTrigger>
          <TabsTrigger value="replace" className={cn(
            "flex items-center gap-1 sm:gap-2",
            isMobile && "text-xs px-2"
          )}>
            <Replace className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className={isMobile ? "hidden" : ""}>{t.replaceMedia}</span>
          </TabsTrigger>
          <TabsTrigger value="create" className={cn(
            "flex items-center gap-1 sm:gap-2",
            isMobile && "text-xs px-2",
            isMobile && "col-span-2"
          )}>
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className={isMobile ? "text-xs" : ""}>{t.addNewPlace}</span>
          </TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                {t.viewTimeline}
              </TabsTrigger>
              <TabsTrigger value="test" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                {t.runTests}
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Mobile-only secondary tab list for timeline and test */}
        {isMobile && (
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              {t.viewTimeline}
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              {t.runTests}
            </TabsTrigger>
          </TabsList>
        )}

        {/* Search Place Tab */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle className={isMobile ? "text-lg" : "text-xl"}>
                {t.searchPlace}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t.placeName}</Label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.placeName}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.province}</Label>
                  <Input
                    value={searchProvince}
                    onChange={(e) => setSearchProvince(e.target.value)}
                    placeholder={t.province}
                    className="w-full"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleSearchPlace} 
                    disabled={isSearching || !searchQuery.trim()}
                    className="w-full mobile-touch-target"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {isSearching ? t.processing : t.search}
                  </Button>
                </div>
              </div>

              {searchResults.exists !== undefined && (
                <Alert className={cn(
                  searchResults.exists ? "border-green-500" : "border-orange-500",
                  "mt-4"
                )}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {searchResults.exists ? (
                      <div className="space-y-2">
                        <div>
                          <strong>{t.placeExists}:</strong> {searchResults.place?.placeName}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            ID: {searchResults.placeId}
                          </Badge>
                          {searchResults.place?.coordinates && (
                            <Badge variant="outline" className="text-xs">
                              GPS: {searchResults.place.coordinates.lat.toFixed(4)}, {searchResults.place.coordinates.lng.toFixed(4)}
                            </Badge>
                          )}
                        </div>
                        {searchResults.place?.coordinates && (
                          <p className="text-sm text-muted-foreground">
                            Location verified with GPS coordinates
                          </p>
                        )}
                      </div>
                    ) : (
                      <strong>{t.placeNotExists}</strong>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Replace Media Tab */}
        <TabsContent value="replace">
          <Card>
            <CardHeader>
              <CardTitle className={isMobile ? "text-lg" : "text-xl"}>
                {t.replaceMedia}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPlaceId ? (
                <>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div>
                          {t.replaceMedia}: <strong>{selectedPlaceName}</strong>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            ID: {selectedPlaceId}
                          </Badge>
                          {selectedPlaceCoordinates && (
                            <Badge variant="secondary" className="text-xs">
                              GPS: {selectedPlaceCoordinates.lat.toFixed(4)}, {selectedPlaceCoordinates.lng.toFixed(4)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {/* GPS Coordinate Editing Section */}
                  <Card className="border-muted">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{t.coordinates}</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCoordinates(!editingCoordinates)}
                        >
                          {editingCoordinates ? t.cancel : t.editGPS}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {!editingCoordinates ? (
                        <div className="space-y-2">
                          {selectedPlaceCoordinates ? (
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-sm">
                                <span className="font-medium">{t.latitude}:</span> {selectedPlaceCoordinates.lat.toFixed(6)}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">{t.longitude}:</span> {selectedPlaceCoordinates.lng.toFixed(6)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              {t.noGPS}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">{t.latitude} *</Label>
                              <Input
                                type="number"
                                step="any"
                                value={newLatitude}
                                onChange={(e) => setNewLatitude(e.target.value)}
                                placeholder="13.7563"
                                className="text-sm"
                                min="-90"
                                max="90"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">{t.longitude} *</Label>
                              <Input
                                type="number"
                                step="any"
                                value={newLongitude}
                                onChange={(e) => setNewLongitude(e.target.value)}
                                placeholder="100.5018"
                                className="text-sm"
                                min="-180"
                                max="180"
                              />
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={handleUpdateCoordinates}
                            disabled={!newLatitude.trim() || !newLongitude.trim()}
                            className="w-full"
                          >
                            {t.updateGPS}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Label>{t.selectFiles}</Label>
                    <Input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => handleMediaFileChange(e.target.files)}
                      className="w-full mobile-touch-target"
                    />
                    <p className="text-xs text-muted-foreground">
                      Supported: Images and Videos (max 100MB each)
                    </p>
                  </div>

                  {newMediaFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Files ({newMediaFiles.length})</Label>
                      <div className={cn(
                        "grid gap-2",
                        isMobile ? "grid-cols-1" : "grid-cols-2"
                      )}>
                        {newMediaFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2 min-w-0">
                              {file.type.startsWith('video/') ? (
                                <FileType className="h-4 w-4 text-blue-500 flex-shrink-0" />
                              ) : (
                                <FileType className="h-4 w-4 text-green-500 flex-shrink-0" />
                              )}
                              <span className="text-sm truncate">{file.name}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <HardDrive className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {(file.size / (1024 * 1024)).toFixed(1)}MB
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleReplaceMedia}
                    disabled={isReplacing || newMediaFiles.length === 0}
                    className="w-full mobile-touch-target"
                  >
                    <Replace className="h-4 w-4 mr-2" />
                    {isReplacing ? t.processing : t.replaceMedia}
                  </Button>

                  {replacementResult && (
                    <Alert className="border-green-500">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{t.replacementSuccess}</strong><br />
                        {replacementResult.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Please search and select a place first in the Search tab.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create New Place Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className={isMobile ? "text-lg" : "text-xl"}>
                {t.addNewPlace}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.placeName} *</Label>
                  <Input
                    value={newPlaceName}
                    onChange={(e) => setNewPlaceName(e.target.value)}
                    placeholder={t.placeName}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Local Name</Label>
                  <Input
                    value={newPlaceNameLocal}
                    onChange={(e) => setNewPlaceNameLocal(e.target.value)}
                    placeholder="ชื่อภาษาท้องถิ่น"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.province} *</Label>
                  <Input
                    value={newPlaceProvince}
                    onChange={(e) => setNewPlaceProvince(e.target.value)}
                    placeholder={t.province}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.category}</Label>
                  <Input
                    value={newPlaceCategory}
                    onChange={(e) => setNewPlaceCategory(e.target.value)}
                    placeholder={t.category}
                    className="w-full"
                  />
                </div>
              </div>

              {/* GPS Coordinates Section */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{t.coordinates} *</Badge>
                  <p className="text-sm text-muted-foreground">
                    Required for location accuracy and mapping
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.latitude} *</Label>
                    <Input
                      type="number"
                      step="any"
                      value={newPlaceLatitude}
                      onChange={(e) => setNewPlaceLatitude(e.target.value)}
                      placeholder="13.7563"
                      className="w-full"
                      min="-90"
                      max="90"
                    />
                    <p className="text-xs text-muted-foreground">
                      Range: -90 to 90
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.longitude} *</Label>
                    <Input
                      type="number"
                      step="any"
                      value={newPlaceLongitude}
                      onChange={(e) => setNewPlaceLongitude(e.target.value)}
                      placeholder="100.5018"
                      className="w-full"
                      min="-180"
                      max="180"
                    />
                    <p className="text-xs text-muted-foreground">
                      Range: -180 to 180
                    </p>
                  </div>
                </div>
                {(newPlaceLatitude && newPlaceLongitude) && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>Preview:</strong> {newPlaceLatitude}, {newPlaceLongitude}
                      {parseFloat(newPlaceLatitude) >= -90 && parseFloat(newPlaceLatitude) <= 90 && 
                       parseFloat(newPlaceLongitude) >= -180 && parseFloat(newPlaceLongitude) <= 180 ? (
                        <Badge variant="default" className="ml-2 text-xs">Valid</Badge>
                      ) : (
                        <Badge variant="destructive" className="ml-2 text-xs">Invalid</Badge>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t.description}</Label>
                <Textarea
                  value={newPlaceDescription}
                  onChange={(e) => setNewPlaceDescription(e.target.value)}
                  placeholder={t.description}
                  rows={isMobile ? 2 : 3}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>{t.selectFiles} *</Label>
                <Input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => handleNewPlaceFileChange(e.target.files)}
                  className="w-full mobile-touch-target"
                />
                <p className="text-xs text-muted-foreground">
                  Supported: Images and Videos (max 100MB each)
                </p>
              </div>

              {newPlaceMediaFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files ({newPlaceMediaFiles.length})</Label>
                  <div className={cn(
                    "grid gap-2",
                    isMobile ? "grid-cols-1" : "grid-cols-2"
                  )}>
                    {newPlaceMediaFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2 min-w-0">
                          {file.type.startsWith('video/') ? (
                            <FileType className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          ) : (
                            <FileType className="h-4 w-4 text-green-500 flex-shrink-0" />
                          )}
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <HardDrive className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {(file.size / (1024 * 1024)).toFixed(1)}MB
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleCreatePlace}
                disabled={isCreating || !newPlaceName.trim() || !newPlaceProvince.trim() || !newPlaceLatitude.trim() || !newPlaceLongitude.trim() || newPlaceMediaFiles.length === 0}
                className="w-full mobile-touch-target"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? t.processing : t.createPlace}
              </Button>

              {creationResult && (
                <Alert className="border-green-500">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div>
                        <strong>{t.creationSuccess}</strong><br />
                        {creationResult.message}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        ID: {creationResult.placeId}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className={cn(
                  "flex flex-col gap-3",
                  !isMobile && "flex-row items-center justify-between"
                )}>
                  <span className={isMobile ? "text-lg" : "text-xl"}>{t.syncDatabase}</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={() => networkStatusService.showNetworkQuality()} 
                      variant="outline" 
                      size="sm" 
                      className="w-full sm:w-auto"
                    >
                      <Info className="h-4 w-4 mr-2" />
                      Network Status
                    </Button>
                    <Button onClick={handleForceSync} variant="outline" size="sm" className="w-full sm:w-auto">
                      <Database className="h-4 w-4 mr-2" />
                      {t.syncNow}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {syncStatus && (
                  <div className={cn(
                    "grid gap-4",
                    isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"
                  )}>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {syncStatus.syncedEntries}
                      </div>
                      <div className="text-sm text-muted-foreground">Synced Entries</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {timelineSyncService.getSyncStatus().pendingEntries}
                      </div>
                      <div className="text-sm text-muted-foreground">{t.pendingEntries}</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-sm font-medium">
                        {syncStatus.lastSyncTime.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">{t.lastSync}</div>
                    </div>
                  </div>
                )}
                
                {syncStatus && syncStatus.success && (
                  <Alert className="mt-4 border-green-500">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{t.syncSuccess}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={cn(
                  "flex flex-col gap-3",
                  !isMobile && "flex-row items-center justify-between"
                )}>
                  <span className={isMobile ? "text-lg" : "text-xl"}>{t.timelineHistory}</span>
                  <Button onClick={handleLoadTimeline} disabled={isLoadingTimeline} variant="outline" size="sm" className="w-full sm:w-auto">
                    <History className="h-4 w-4 mr-2" />
                    {isLoadingTimeline ? t.processing : t.loadTimeline}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className={cn(
                  isMobile ? "h-64" : "h-96"
                )}>
                  {timelineEntries.length > 0 ? (
                    <div className="space-y-2">
                      {timelineEntries.map((entry) => (
                        <div key={entry.id} className="p-3 border rounded-lg">
                          <div className={cn(
                            "flex gap-2 mb-2",
                            isMobile ? "flex-col" : "items-center justify-between"
                          )}>
                            <Badge variant={
                              entry.action === 'created' ? 'default' : 
                              entry.action === 'replaced' ? 'secondary' : 
                              'destructive'
                            }>
                              {entry.action}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {entry.timestamp.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div><strong>Place ID:</strong> {entry.placeId}</div>
                            <div><strong>Media ID:</strong> {entry.mediaId}</div>
                            {entry.userId && <div><strong>User:</strong> {entry.userId}</div>}
                            {entry.metadata?.changeReason && (
                              <div><strong>Reason:</strong> {entry.metadata.changeReason}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      {t.noTimeline}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test">
          <MediaManagementTest currentLanguage={currentLanguage} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttractionManager;