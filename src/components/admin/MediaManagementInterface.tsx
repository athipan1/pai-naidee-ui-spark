import { useState, useEffect } from 'react';
import { Upload, Search, Replace, Plus, History, Database, AlertCircle, CheckCircle, Info, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mediaManagementService, type PlaceMediaData, type MediaReplacementResult, type PlaceCreationResult } from '@/shared/services/mediaManagementService';
import { timelineSyncService, type TimelineEntry, type SyncResult } from '@/shared/services/timelineSyncService';
import type { MediaUploadData } from '@/shared/types/media';
import MediaManagementTest from './MediaManagementTest';

interface MediaManagementInterfaceProps {
  currentLanguage: 'th' | 'en';
}

const MediaManagementInterface = ({ currentLanguage }: MediaManagementInterfaceProps) => {
  // Place search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchProvince, setSearchProvince] = useState('');
  const [searchResults, setSearchResults] = useState<{ exists: boolean; placeId?: string; place?: PlaceMediaData }>({ exists: false });
  const [isSearching, setIsSearching] = useState(false);

  // Media replacement state
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [selectedPlaceName, setSelectedPlaceName] = useState('');
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
  const [newPlaceMediaFiles, setNewPlaceMediaFiles] = useState<File[]>([]);
  const [newPlaceMediaData, setNewPlaceMediaData] = useState<MediaUploadData[]>([]);
  const [creationResult, setCreationResult] = useState<PlaceCreationResult | null>(null);
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
      syncSuccess: 'ซิงค์ข้อมูลสำเร็จ'
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
      syncSuccess: 'Data Synced Successfully'
    }
  };

  const t = content[currentLanguage];

  // Search for existing place
  const handleSearchPlace = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const result = await mediaManagementService.checkPlaceExists(searchQuery, searchProvince);
      setSearchResults(result);
      
      if (result.exists && result.placeId) {
        setSelectedPlaceId(result.placeId);
        setSelectedPlaceName(result.place?.placeName || searchQuery);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle media replacement
  const handleReplaceMedia = async () => {
    if (!selectedPlaceId || newMediaData.length === 0) return;

    setIsReplacing(true);
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
      }
    } catch (error) {
      console.error('Media replacement failed:', error);
    } finally {
      setIsReplacing(false);
    }
  };

  // Handle new place creation
  const handleCreatePlace = async () => {
    if (!newPlaceName.trim() || !newPlaceProvince.trim() || newPlaceMediaData.length === 0) return;

    setIsCreating(true);
    try {
      const placeData = {
        placeId: '',
        placeName: newPlaceName,
        placeNameLocal: newPlaceNameLocal,
        province: newPlaceProvince,
        category: newPlaceCategory,
        description: newPlaceDescription,
        media: []
      };

      const result = await mediaManagementService.createPlaceWithMedia(placeData, newPlaceMediaData);
      setCreationResult(result);

      // Sync with timeline
      if (result.success) {
        await timelineSyncService.syncPlaceCreation(
          result.placeId,
          result.mediaIds,
          'current_user'
        );
      }

      // Reset form
      if (result.success) {
        setNewPlaceName('');
        setNewPlaceNameLocal('');
        setNewPlaceProvince('');
        setNewPlaceCategory('');
        setNewPlaceDescription('');
        setNewPlaceMediaFiles([]);
        setNewPlaceMediaData([]);
      }
    } catch (error) {
      console.error('Place creation failed:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Load timeline history
  const handleLoadTimeline = async () => {
    setIsLoadingTimeline(true);
    try {
      const entries = await timelineSyncService.getTimelineHistory({
        placeId: selectedPlaceId || undefined,
        limit: 50
      });
      setTimelineEntries(entries);
    } catch (error) {
      console.error('Timeline load failed:', error);
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  // Force sync
  const handleForceSync = async () => {
    try {
      const result = await timelineSyncService.forceSyncAll();
      setSyncStatus(result);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  // Handle file selection for media replacement
  const handleMediaFileChange = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    setNewMediaFiles(fileArray);
    
    const mediaData: MediaUploadData[] = fileArray.map((file, index) => ({
      title: `Media ${index + 1}`,
      description: `Uploaded media for ${selectedPlaceName}`,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      file
    }));
    
    setNewMediaData(mediaData);
  };

  // Handle file selection for new place
  const handleNewPlaceFileChange = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    setNewPlaceMediaFiles(fileArray);
    
    const mediaData: MediaUploadData[] = fileArray.map((file, index) => ({
      title: `${newPlaceName} Media ${index + 1}`,
      description: `Media for new place: ${newPlaceName}`,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      file
    }));
    
    setNewPlaceMediaData(mediaData);
  };

  // Get sync status on mount
  useEffect(() => {
    const status = timelineSyncService.getSyncStatus();
    setSyncStatus({
      success: true,
      syncedEntries: 0,
      failedEntries: 0,
      errors: [],
      lastSyncTime: new Date()
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Database className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">{t.title}</h1>
      </div>

      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            {t.searchPlace}
          </TabsTrigger>
          <TabsTrigger value="replace" className="flex items-center gap-2">
            <Replace className="h-4 w-4" />
            {t.replaceMedia}
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t.addNewPlace}
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            {t.viewTimeline}
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            {t.runTests}
          </TabsTrigger>
        </TabsList>

        {/* Search Place Tab */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>{t.searchPlace}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t.placeName}</Label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.placeName}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.province}</Label>
                  <Input
                    value={searchProvince}
                    onChange={(e) => setSearchProvince(e.target.value)}
                    placeholder={t.province}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleSearchPlace} 
                    disabled={isSearching || !searchQuery.trim()}
                    className="w-full"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {isSearching ? t.processing : t.search}
                  </Button>
                </div>
              </div>

              {searchResults.exists !== undefined && (
                <Alert className={searchResults.exists ? "border-green-500" : "border-orange-500"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {searchResults.exists ? (
                      <div>
                        <strong>{t.placeExists}:</strong> {searchResults.place?.placeName}
                        <Badge className="ml-2" variant="secondary">
                          ID: {searchResults.placeId}
                        </Badge>
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
              <CardTitle>{t.replaceMedia}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPlaceId ? (
                <>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {t.replaceMedia}: <strong>{selectedPlaceName}</strong>
                      <Badge className="ml-2" variant="outline">
                        ID: {selectedPlaceId}
                      </Badge>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label>{t.selectFiles}</Label>
                    <Input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => handleMediaFileChange(e.target.files)}
                    />
                  </div>

                  {newMediaFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Files ({newMediaFiles.length})</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {newMediaFiles.map((file, index) => (
                          <Badge key={index} variant="outline">
                            {file.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleReplaceMedia}
                    disabled={isReplacing || newMediaFiles.length === 0}
                    className="w-full"
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
              <CardTitle>{t.addNewPlace}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.placeName} *</Label>
                  <Input
                    value={newPlaceName}
                    onChange={(e) => setNewPlaceName(e.target.value)}
                    placeholder={t.placeName}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Local Name</Label>
                  <Input
                    value={newPlaceNameLocal}
                    onChange={(e) => setNewPlaceNameLocal(e.target.value)}
                    placeholder="ชื่อภาษาท้องถิ่น"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.province} *</Label>
                  <Input
                    value={newPlaceProvince}
                    onChange={(e) => setNewPlaceProvince(e.target.value)}
                    placeholder={t.province}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.category}</Label>
                  <Input
                    value={newPlaceCategory}
                    onChange={(e) => setNewPlaceCategory(e.target.value)}
                    placeholder={t.category}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t.description}</Label>
                <Textarea
                  value={newPlaceDescription}
                  onChange={(e) => setNewPlaceDescription(e.target.value)}
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
                  onChange={(e) => handleNewPlaceFileChange(e.target.files)}
                />
              </div>

              {newPlaceMediaFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files ({newPlaceMediaFiles.length})</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {newPlaceMediaFiles.map((file, index) => (
                      <Badge key={index} variant="outline">
                        {file.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleCreatePlace}
                disabled={isCreating || !newPlaceName.trim() || !newPlaceProvince.trim() || newPlaceMediaFiles.length === 0}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? t.processing : t.createPlace}
              </Button>

              {creationResult && (
                <Alert className="border-green-500">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{t.creationSuccess}</strong><br />
                    {creationResult.message}
                    <Badge className="ml-2" variant="secondary">
                      ID: {creationResult.placeId}
                    </Badge>
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
                <CardTitle className="flex items-center justify-between">
                  {t.syncDatabase}
                  <Button onClick={handleForceSync} variant="outline" size="sm">
                    <Database className="h-4 w-4 mr-2" />
                    {t.syncNow}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {syncStatus && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {syncStatus.syncedEntries}
                      </div>
                      <div className="text-sm text-muted-foreground">Synced Entries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {timelineSyncService.getSyncStatus().pendingEntries}
                      </div>
                      <div className="text-sm text-muted-foreground">{t.pendingEntries}</div>
                    </div>
                    <div className="text-center">
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
                <CardTitle className="flex items-center justify-between">
                  {t.timelineHistory}
                  <Button onClick={handleLoadTimeline} disabled={isLoadingTimeline} variant="outline" size="sm">
                    <History className="h-4 w-4 mr-2" />
                    {isLoadingTimeline ? t.processing : t.loadTimeline}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {timelineEntries.length > 0 ? (
                    <div className="space-y-2">
                      {timelineEntries.map((entry) => (
                        <div key={entry.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
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

export default MediaManagementInterface;