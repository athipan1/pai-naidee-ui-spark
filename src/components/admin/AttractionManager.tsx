import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, MapPin, Image as ImageIcon, Video, Save, Upload, Trash2, Edit, X, Compass, GripVertical, AlertTriangle, PackageOpen, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/shared/utils/cn';
import { useMedia } from '@/shared/contexts/MediaProvider';
import { mediaManagementService, type PlaceWithMedia } from '@/shared/services/mediaManagementService';
import type { MediaUploadData } from '@/shared/types/media';
import { notificationService } from '@/shared/services/notificationService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

interface AttractionManagerProps {
  currentLanguage: 'th' | 'en';
}

// Represents the state for the new attraction form
interface NewAttractionState {
  name: string;
  name_local: string;
  province: string;
  category: string;
  description: string;
  coordinates: string; // Keep as string for simplicity in form
  files: File[];
}

const AttractionManager = ({ currentLanguage }: AttractionManagerProps) => {
  const { isMobile } = useMedia();
  const [places, setPlaces] = useState<PlaceWithMedia[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceWithMedia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  
  // Form state for the selected place
  const [formState, setFormState] = useState<Partial<PlaceWithMedia>>({});
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

  // Form state for the new attraction modal
  const [newAttraction, setNewAttraction] = useState<NewAttractionState>({
    name: '',
    name_local: '',
    province: '',
    category: '',
    description: '',
    coordinates: '',
    files: [],
  });

  // Translation content
  const content = {
    th: {
      title: 'จัดการสถานที่ท่องเที่ยว',
      search: 'ค้นหาสถานที่...',
      newAttraction: 'เพิ่มสถานที่ใหม่',
      loading: 'กำลังโหลดข้อมูล...',
      noPlaces: 'ไม่พบสถานที่',
      selectAPlace: 'เลือกสถานที่เพื่อแก้ไข',
      saveChanges: 'บันทึกการเปลี่ยนแปลง',
      saving: 'กำลังบันทึก...',
      editDetails: 'แก้ไขรายละเอียด',
      placeName: 'ชื่อสถานที่',
      localName: 'ชื่อท้องถิ่น',
      province: 'จังหวัด',
      category: 'ประเภท',
      description: 'คำอธิบาย',
      coordinates: 'พิกัด (ละติจูด, ลองจิจูด)',
      mediaGallery: 'คลังสื่อ',
      uploadMedia: 'อัปโหลดสื่อใหม่',
      dropFilesHere: 'วางไฟล์ที่นี่ หรือคลิกเพื่อเลือก',
      changesSaved: 'บันทึกการเปลี่ยนแปลงสำเร็จ',
      errorLoading: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
      errorSaving: 'เกิดข้อผิดพลาดในการบันทึก',
      confirmDelete: 'คุณแน่ใจหรือไม่ว่าต้องการลบสื่อนี้?',
    },
    en: {
      title: 'Attraction Management',
      search: 'Search attractions...',
      newAttraction: 'New Attraction',
      loading: 'Loading attractions...',
      noPlaces: 'No attractions found.',
      selectAPlace: 'Select an attraction to edit',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      editDetails: 'Edit Details',
      placeName: 'Place Name',
      localName: 'Local Name',
      province: 'Province',
      category: 'Category',
      description: 'Description',
      coordinates: 'Coordinates (Lat, Lng)',
      mediaGallery: 'Media Gallery',
      uploadMedia: 'Upload New Media',
      dropFilesHere: 'Drop files here or click to select',
      changesSaved: 'Changes saved successfully',
      errorLoading: 'Error loading attractions',
      errorSaving: 'Error saving changes',
      confirmDelete: 'Are you sure you want to delete this media?',
    }
  };
  const t = content[currentLanguage];

  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  // Fetch all places on component mount, now with a pre-flight status check
  const fetchPlaces = useCallback(async () => {
    setIsLoading(true);
    setErrorInfo(null);
    try {
      // First, check the API status
      const statusResponse = await fetch('/api/status');
      const statusData = await statusResponse.json();

      if (!statusResponse.ok) {
        // If status check fails, show a detailed error
        const detailedError = statusData.errors ? statusData.errors.join(' ') : 'An unknown configuration error occurred.';
        throw new Error(`API Configuration Error: ${detailedError}`);
      }

      // If status is OK, proceed to fetch places
      const allPlaces = await mediaManagementService.getPlaces();
      setPlaces(allPlaces);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setErrorInfo(errorMessage); // Store the detailed error message for display
      notificationService.show('error', t.errorLoading, {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  }, [t.errorLoading]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Handle selecting a place from the list
  const handleSelectPlace = (place: PlaceWithMedia) => {
    setSelectedPlace(place);
    setFormState({ ...place });
  };

  // Handle input changes in the form
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  // Handle saving changes to a place
  const handleSaveChanges = async () => {
    if (!selectedPlace) return;

    setIsSaving(true);
    try {
      // Logic to parse coordinates from string to object if needed
      // For simplicity, we'll assume the API can handle the format
      await mediaManagementService.updatePlace(selectedPlace.id, {
        name: formState.name,
        name_local: formState.name_local,
        province: formState.province,
        category: formState.category,
        description: formState.description,
      });
      notificationService.show('success', t.changesSaved);
      // Refresh the list to show updated data
      fetchPlaces();
    } catch (error) {
      notificationService.show('error', t.errorSaving, {
        description: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle uploading new media for the selected place
  const handleUploadMedia = async () => {
    if (!selectedPlace || filesToUpload.length === 0) return;

    setIsSaving(true);
    try {
      const mediaData: MediaUploadData[] = filesToUpload.map(file => ({
        file,
        title: file.name,
        description: '',
        type: file.type.startsWith('video') ? 'video' : 'image',
      }));

      await mediaManagementService.replaceMediaForPlace(selectedPlace.id, mediaData);

      notificationService.show('success', 'Media Uploaded');

      // Refresh data to show new media and clear selection
      const updatedPlace = await mediaManagementService.getPlaceById(selectedPlace.id);
      setSelectedPlace(updatedPlace);
      setFilesToUpload([]);
      // Also refresh the main list in case any details changed
      await fetchPlaces();

    } catch (error) {
       notificationService.show('error', 'Upload Failed', {
        description: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle deleting a media item
  const handleDeleteMedia = async (mediaId: string) => {
    if (!selectedPlace) return;

    // A simple confirmation dialog
    if (!window.confirm(t.confirmDelete)) {
        return;
    }

    try {
        await mediaManagementService.deleteMedia(mediaId);
        notificationService.show('success', 'Media Deleted');

        // Refresh the selected place to update the media list
        const updatedPlace = await mediaManagementService.getPlaceById(selectedPlace.id);
        setSelectedPlace(updatedPlace);
         // Also refresh the main list in case any details changed
        await fetchPlaces();

    } catch (error) {
        notificationService.show('error', 'Deletion Failed', {
            description: error instanceof Error ? error.message : String(error)
        });
    }
  };

  // Handle creating a new attraction
  const handleNewAttraction = async () => {
    if (!newAttraction.name || !newAttraction.province || !newAttraction.coordinates) {
        notificationService.show('error', 'Validation Error', {
            description: 'Name, Province, and Coordinates are required.'
        });
        return;
    }

    const [latStr, lngStr] = newAttraction.coordinates.split(',').map(s => s.trim());
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
        notificationService.show('error', 'Invalid Coordinates', {
            description: 'Coordinates must be in "latitude, longitude" format.'
        });
        return;
    }

    setIsSaving(true);
    try {
        const placeData = {
            name: newAttraction.name,
            name_local: newAttraction.name_local,
            province: newAttraction.province,
            category: newAttraction.category,
            description: newAttraction.description,
            coordinates: { lat, lng },
        };

        const mediaData: MediaUploadData[] = newAttraction.files.map(file => ({
            file,
            title: file.name,
            description: '',
            type: file.type.startsWith('video') ? 'video' : 'image',
        }));

        await mediaManagementService.createPlaceWithMedia(placeData, mediaData);

        notificationService.show('success', 'Attraction Created', {
            description: `${newAttraction.name} has been successfully created.`
        });
        
        setCreateModalOpen(false); // Close modal on success
        setNewAttraction({ // Reset form
          name: '', name_local: '', province: '', category: '',
          description: '', coordinates: '', files: []
        });
        fetchPlaces(); // Refresh the list
    } catch (error) {
        notificationService.show('error', 'Creation Failed', {
            description: error instanceof Error ? error.message : String(error)
        });
    } finally {
        setIsSaving(false);
    }
  };

  // Filtered places based on search term
  const filteredPlaces = places.filter(place =>
    place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.province.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Main component layout
  return (
    <div className={cn("flex h-[calc(100vh-120px)] w-full bg-muted/20", isMobile ? "flex-col" : "")}>
      {/* Master View (Left Panel) */}
      <Card className={cn(
        "flex flex-col",
        isMobile ? "w-full h-1/3" : "w-1/3 lg:w-1/4",
        "border-r rounded-none"
      )}>
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t.title}</CardTitle>
            <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  {!isMobile && t.newAttraction}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.newAttraction}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input placeholder={t.placeName} value={newAttraction.name} onChange={(e) => setNewAttraction(s => ({...s, name: e.target.value}))} />
                  <Input placeholder={t.localName} value={newAttraction.name_local} onChange={(e) => setNewAttraction(s => ({...s, name_local: e.target.value}))} />
                  <Input placeholder={t.province} value={newAttraction.province} onChange={(e) => setNewAttraction(s => ({...s, province: e.target.value}))} />
                  <Input placeholder={t.category} value={newAttraction.category} onChange={(e) => setNewAttraction(s => ({...s, category: e.target.value}))} />
                  <Textarea placeholder={t.description} value={newAttraction.description} onChange={(e) => setNewAttraction(s => ({...s, description: e.target.value}))} />
                  <Input placeholder={t.coordinates} value={newAttraction.coordinates} onChange={(e) => setNewAttraction(s => ({...s, coordinates: e.target.value}))} />
                  <Input type="file" multiple onChange={(e) => setNewAttraction(s => ({...s, files: Array.from(e.target.files || [])}))} />
                </div>
                <DialogFooter>
                  <Button onClick={handleNewAttraction} disabled={isSaving}>
                    {isSaving ? t.saving : t.newAttraction}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.search}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          {isLoading && <div className="p-4 text-center text-muted-foreground">{t.loading}</div>}

          {errorInfo && (
            <Alert variant="destructive" className="m-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{t.errorLoading}:</strong> {errorInfo}
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !errorInfo && filteredPlaces.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">{t.noPlaces}</div>
          )}

          {!isLoading && !errorInfo && filteredPlaces.length > 0 && (
            <Table>
              <TableBody>
                {filteredPlaces.map((place) => (
                  <TableRow
                    key={place.id}
                    onClick={() => handleSelectPlace(place)}
                    className={cn(
                      "cursor-pointer",
                      selectedPlace?.id === place.id && "bg-muted hover:bg-muted"
                    )}
                  >
                    <TableCell className="font-medium">{place.name}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{place.province}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </Card>

      {/* Detail View (Right Panel) */}
      <div className={cn("flex-1", isMobile ? "h-2/3" : "")}>
        {selectedPlace ? (
          <ScrollArea className="h-full p-4 sm:p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{formState.name}</h2>
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                  {isSaving ? <>{t.saving}</> : <><Save className="mr-2 h-4 w-4" /> {t.saveChanges}</>}
                </Button>
              </div>

              {/* Editable Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Edit className="h-5 w-5" /> {t.editDetails}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="name">{t.placeName}</Label>
                    <Input id="name" name="name" value={formState.name || ''} onChange={handleFormChange} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="name_local">{t.localName}</Label>
                    <Input id="name_local" name="name_local" value={formState.name_local || ''} onChange={handleFormChange} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="province">{t.province}</Label>
                    <Input id="province" name="province" value={formState.province || ''} onChange={handleFormChange} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="category">{t.category}</Label>
                    <Input id="category" name="category" value={formState.category || ''} onChange={handleFormChange} />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="description">{t.description}</Label>
                    <Textarea id="description" name="description" value={formState.description || ''} onChange={handleFormChange} rows={4} />
                  </div>
                   <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="coordinates">{t.coordinates}</Label>
                    <Input id="coordinates" name="coordinates" value={formState.coordinates || ''} onChange={handleFormChange} />
                  </div>
                </CardContent>
              </Card>

              {/* Media Gallery Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ImageIcon className="h-5 w-5" /> {t.mediaGallery}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedPlace.media.map(mediaItem => (
                      <div key={mediaItem.id} className="relative group aspect-square">
                        <img src={mediaItem.url} alt={mediaItem.title || ''} className="object-cover w-full h-full rounded-md" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="destructive" size="icon" onClick={() => handleDeleteMedia(mediaItem.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Label htmlFor="media-upload">{t.uploadMedia}</Label>
                    <div className="flex gap-2 mt-2">
                        <Input
                            id="media-upload"
                            type="file"
                            multiple
                            onChange={(e) => setFilesToUpload(Array.from(e.target.files || []))}
                            className="flex-grow"
                        />
                        <Button onClick={handleUploadMedia} disabled={isSaving || filesToUpload.length === 0}>
                            <Upload className="mr-2 h-4 w-4" />
                            {isSaving ? t.saving : 'Upload'}
                        </Button>
                    </div>
                    {filesToUpload.length > 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                            {filesToUpload.length} file(s) selected.
                        </div>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <PackageOpen className="h-16 w-16" />
            <h3 className="mt-4 text-lg font-semibold">{t.selectAPlace}</h3>
            <p className="text-sm">Choose an attraction from the list to see its details and manage media.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttractionManager;
