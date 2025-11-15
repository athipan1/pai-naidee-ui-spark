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
import { mediaManagementService, type PlaceMediaData, type MediaReplacementResult, type PlaceCreationResult } from '@/shared/services/mediaManagementService';
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
  const [searchResultsList, setSearchResultsList] = useState<PlaceMediaData[]>([]);
  const [noResultsFound, setNoResultsFound] = useState(false);
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

  // Unified state for the active place being created or edited
  const [activePlace, setActivePlace] = useState<Partial<PlaceMediaData>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaToDelete, setMediaToDelete] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const handleSelectPlace = async (place: PlaceMediaData) => {
    const loadingToast = notificationService.showLoading('Loading place details...');
    try {
      const fullPlaceDetails = await mediaManagementService.getPlaceMedia(place.id);
      if (fullPlaceDetails) {
        setActivePlace(fullPlaceDetails);
        setIsEditing(true);
        setSearchResultsList([]); // Clear search results
        setNoResultsFound(false);
      } else {
        notificationService.show('error', 'Failed to load place details.');
      }
    } catch (error) {
      notificationService.showSyncFailure(
        'Load Failed',
        error instanceof Error ? error.message : 'Unknown error',
        () => handleSelectPlace(place)
      );
    } finally {
      notificationService.dismiss(loadingToast);
    }
  };

  const handleSearchPlace = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setNoResultsFound(false);
    setSearchResultsList([]);
    setActivePlace({});
    const loadingToast = notificationService.showLoading('Searching for place...');
    
    try {
      const results = await mediaManagementService.searchPlaces(searchQuery, searchProvince);
      
      if (results.length > 0) {
        setSearchResultsList(results);
        notificationService.dismiss(loadingToast);
        notificationService.show('success', `${results.length} place(s) found.`);
      } else {
        setNoResultsFound(true);
        setActivePlace({ placeName: searchQuery, province: searchProvince });
        setIsEditing(false);
        notificationService.dismiss(loadingToast);
        notificationService.show('info', 'No places found. You can create a new one.');
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

  const handleSubmit = async () => {
    // Basic Validation
    if (!activePlace.placeName || !activePlace.province || !activePlace.coordinates) {
      notificationService.showValidationError('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (mediaFiles.length === 0 && !isEditing) {
      notificationService.showValidationError('Missing Media', 'Please select at least one media file.');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = notificationService.showLoading(isEditing ? 'Updating place...' : 'Creating new place...');

    try {
      const mediaUploadData: MediaUploadData[] = mediaFiles.map(file => ({
        file,
        title: file.name,
        description: '',
        type: file.type.startsWith('video') ? 'video' : 'image',
      }));

      if (isEditing) {
        const result = await mediaManagementService.updatePlace(activePlace.placeId, activePlace, mediaUploadData, mediaToDelete);
        if (result.success) {
          notificationService.show('success', 'Place updated successfully!');
          setMediaToDelete([]);
          setMediaFiles([]);
          // Re-fetch data to show changes
          handleSelectPlace(activePlace);
        }
      } else {
        const result = await mediaManagementService.createPlaceWithMedia(activePlace, mediaUploadData);
        if (result.success) {
          notificationService.show('success', 'Place created successfully!');
          // Reset form
          setActivePlace({});
          setMediaFiles([]);
          setSearchResults({ exists: undefined });
        }
      }
    } catch (error) {
      notificationService.showSyncFailure(
        isEditing ? 'Update Failed' : 'Creation Failed',
        error instanceof Error ? error.message : 'Unknown error',
        handleSubmit
      );
    } finally {
      notificationService.dismiss(loadingToast);
      setIsSubmitting(false);
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

      <Tabs defaultValue="manage" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage">Manage Place</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="test">Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          {/* Search Place Section */}
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

            </CardContent>
          </Card>

          {/* Search Results List */}
          {searchResultsList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {searchResultsList.map(place => (
                    <div
                      key={place.id}
                      className="p-2 border rounded-md cursor-pointer hover:bg-muted"
                      onClick={() => handleSelectPlace(place)}
                    >
                      <p className="font-semibold">{place.name}</p>
                      <p className="text-sm text-muted-foreground">{place.province}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create/Edit Form Section */}
          {(noResultsFound || activePlace.id) && (
            <Card>
              <CardHeader>
                <CardTitle className={isMobile ? "text-lg" : "text-xl"}>
                  {isEditing ? `Editing: ${activePlace.placeName}` : 'Create New Place'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.placeName} *</Label>
                    <Input
                      value={activePlace.placeName || ''}
                      onChange={(e) => setActivePlace(p => ({ ...p, placeName: e.target.value }))}
                      placeholder={t.placeName}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Local Name</Label>
                    <Input
                      value={activePlace.placeNameLocal || ''}
                      onChange={(e) => setActivePlace(p => ({ ...p, placeNameLocal: e.target.value }))}
                      placeholder="ชื่อภาษาท้องถิ่น"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.province} *</Label>
                    <Input
                      value={activePlace.province || ''}
                      onChange={(e) => setActivePlace(p => ({ ...p, province: e.target.value }))}
                      placeholder={t.province}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.category}</Label>
                    <Input
                      value={activePlace.category || ''}
                      onChange={(e) => setActivePlace(p => ({ ...p, category: e.target.value }))}
                      placeholder={t.category}
                    />
                  </div>
                </div>

                {/* GPS Coordinates Section */}
                <div className="space-y-2 p-4 border rounded-lg">
                  <Label className="font-semibold">{t.coordinates} *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="number"
                      value={activePlace.coordinates?.lat || ''}
                      onChange={(e) => setActivePlace(p => ({ ...p, coordinates: { ...p.coordinates, lat: parseFloat(e.target.value) } }))}
                      placeholder={t.latitude}
                    />
                    <Input
                      type="number"
                      value={activePlace.coordinates?.lng || ''}
                      onChange={(e) => setActivePlace(p => ({ ...p, coordinates: { ...p.coordinates, lng: parseFloat(e.target.value) } }))}
                      placeholder={t.longitude}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t.description}</Label>
                  <Textarea
                    value={activePlace.description || ''}
                    onChange={(e) => setActivePlace(p => ({ ...p, description: e.target.value }))}
                    placeholder={t.description}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.selectFiles} *</Label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
                  />
                </div>

                {/* Display existing media if editing */}
                {isEditing && activePlace.media && activePlace.media.length > 0 && (
                  <div>
                    <Label>Existing Media</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {activePlace.media.filter(m => !mediaToDelete.includes(m.id)).map(m => (
                        <div key={m.id} className="relative">
                          <img src={m.url} alt={m.title} className="rounded-md object-cover aspect-square" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => setMediaToDelete(prev => [...prev, m.id])}
                        >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? t.processing : (isEditing ? 'Update Place' : t.createPlace)}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

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

        <TabsContent value="test">
          <MediaManagementTest currentLanguage={currentLanguage} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttractionManager;