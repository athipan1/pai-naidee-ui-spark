import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/shared/hooks/use-toast";
import { 
  Image, 
  Video, 
  FileText, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  AlertCircle,
  Search,
  Filter
} from "lucide-react";
import { MediaItem } from "@/shared/types/media";

interface MediaGalleryProps {
  currentLanguage: "th" | "en";
  mediaItems: MediaItem[];
  onEdit: (id: string, data: Partial<MediaItem>) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

const MediaGallery = ({ 
  currentLanguage, 
  mediaItems, 
  onEdit, 
  onDelete, 
  onApprove, 
  onReject 
}: MediaGalleryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const { toast } = useToast();

  const texts = {
    en: {
      title: "Media Gallery",
      subtitle: "Manage uploaded content, approve or reject items",
      search: "Search content...",
      filterStatus: "Filter by Status",
      filterType: "Filter by Type",
      all: "All",
      draft: "Draft",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      image: "Image",
      video: "Video",
      text: "Text",
      noItems: "No media items found",
      edit: "Edit",
      delete: "Delete",
      approve: "Approve",
      reject: "Reject",
      editContent: "Edit Content",
      deleteConfirm: "Delete Content",
      deleteMessage: "Are you sure you want to delete this content? This action cannot be undone.",
      rejectContent: "Reject Content",
      rejectReason: "Rejection Reason",
      rejectReasonPlaceholder: "Please provide a reason for rejection...",
      save: "Save Changes",
      cancel: "Cancel",
      confirmDelete: "Delete",
      confirmReject: "Reject",
      uploadedAt: "Uploaded",
      updatedAt: "Updated",
      approvedBy: "Approved by",
      fileSize: "File size",
      editSuccess: "Content updated successfully",
      deleteSuccess: "Content deleted successfully",
      approveSuccess: "Content approved successfully",
      rejectSuccess: "Content rejected successfully",
      contentTitle: "Title",
      description: "Description",
      status: "Status"
    },
    th: {
      title: "แกลเลอรีสื่อ",
      subtitle: "จัดการเนื้อหาที่อัปโหลด อนุมัติหรือปฏิเสธรายการ",
      search: "ค้นหาเนื้อหา...",
      filterStatus: "กรองตามสถานะ",
      filterType: "กรองตามประเภท",
      all: "ทั้งหมด",
      draft: "ร่าง",
      pending: "รอการพิจารณา",
      approved: "อนุมัติแล้ว",
      rejected: "ปฏิเสธแล้ว",
      image: "รูปภาพ",
      video: "วิดีโอ",
      text: "ข้อความ",
      noItems: "ไม่พบรายการสื่อ",
      edit: "แก้ไข",
      delete: "ลบ",
      approve: "อนุมัติ",
      reject: "ปฏิเสธ",
      editContent: "แก้ไขเนื้อหา",
      deleteConfirm: "ลบเนื้อหา",
      deleteMessage: "คุณแน่ใจหรือไม่ที่จะลบเนื้อหานี้? การดำเนินการนี้ไม่สามารถยกเลิกได้",
      rejectContent: "ปฏิเสธเนื้อหา",
      rejectReason: "เหตุผลการปฏิเสธ",
      rejectReasonPlaceholder: "กรุณาระบุเหตุผลในการปฏิเสธ...",
      save: "บันทึกการเปลี่ยนแปลง",
      cancel: "ยกเลิก",
      confirmDelete: "ลบ",
      confirmReject: "ปฏิเสธ",
      uploadedAt: "อัปโหลดเมื่อ",
      updatedAt: "อัปเดตเมื่อ",
      approvedBy: "อนุมัติโดย",
      fileSize: "ขนาดไฟล์",
      editSuccess: "อัปเดตเนื้อหาสำเร็จ",
      deleteSuccess: "ลบเนื้อหาสำเร็จ",
      approveSuccess: "อนุมัติเนื้อหาสำเร็จ",
      rejectSuccess: "ปฏิเสธเนื้อหาสำเร็จ",
      contentTitle: "ชื่อเรื่อง",
      description: "คำอธิบาย",
      status: "สถานะ"
    }
  };

  const t = texts[currentLanguage];

  const getStatusBadge = (status: MediaItem['status']) => {
    const variants = {
      draft: { variant: "secondary" as const, icon: Clock },
      pending: { variant: "default" as const, icon: Clock },
      approved: { variant: "default" as const, icon: Check },
      rejected: { variant: "destructive" as const, icon: X }
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {t[status]}
      </Badge>
    );
  };

  const getTypeIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(currentLanguage === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleEdit = useCallback((item: MediaItem) => {
    setEditingItem(item);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingItem) return;
    
    onEdit(editingItem.id, {
      title: editingItem.title,
      description: editingItem.description,
      updatedAt: new Date()
    });
    
    toast({
      title: "Success",
      description: t.editSuccess
    });
    
    setEditingItem(null);
  }, [editingItem, onEdit, t, toast]);

  const handleDelete = useCallback((id: string) => {
    onDelete(id);
    toast({
      title: "Success",
      description: t.deleteSuccess
    });
  }, [onDelete, t, toast]);

  const handleApprove = useCallback((id: string) => {
    onApprove(id);
    toast({
      title: "Success",
      description: t.approveSuccess
    });
  }, [onApprove, t, toast]);

  const handleReject = useCallback((id: string) => {
    if (!rejectReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive"
      });
      return;
    }
    
    onReject(id, rejectReason);
    toast({
      title: "Success",
      description: t.rejectSuccess
    });
    
    setRejectReason("");
  }, [onReject, rejectReason, t, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5 text-blue-600" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.all}</SelectItem>
              <SelectItem value="draft">{t.draft}</SelectItem>
              <SelectItem value="pending">{t.pending}</SelectItem>
              <SelectItem value="approved">{t.approved}</SelectItem>
              <SelectItem value="rejected">{t.rejected}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.all}</SelectItem>
              <SelectItem value="image">{t.image}</SelectItem>
              <SelectItem value="video">{t.video}</SelectItem>
              <SelectItem value="text">{t.text}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Media Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t.noItems}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      <span className="font-medium text-sm truncate">{item.title}</span>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  {/* Media Preview */}
                  {item.url && item.type === 'image' && (
                    <div className="mb-3">
                      <img 
                        src={item.url} 
                        alt={item.title}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                  
                  {item.url && item.type === 'video' && (
                    <div className="mb-3">
                      <video 
                        src={item.url}
                        className="w-full h-32 object-cover rounded-md"
                        controls={false}
                        muted
                      />
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Metadata */}
                  <div className="text-xs text-gray-500 space-y-1 mb-4">
                    <div>{t.uploadedAt}: {formatDate(item.uploadedAt)}</div>
                    {item.size && <div>{t.fileSize}: {formatFileSize(item.size)}</div>}
                    {item.approvedBy && (
                      <div>{t.approvedBy}: {item.approvedBy}</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {/* Edit */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                          <Edit2 className="h-3 w-3 mr-1" />
                          {t.edit}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t.editContent}</DialogTitle>
                        </DialogHeader>
                        {editingItem && editingItem.id === item.id && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-title">{t.contentTitle}</Label>
                              <Input
                                id="edit-title"
                                value={editingItem.title}
                                onChange={(e) => setEditingItem(prev => 
                                  prev ? { ...prev, title: e.target.value } : null
                                )}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-description">{t.description}</Label>
                              <Textarea
                                id="edit-description"
                                value={editingItem.description}
                                onChange={(e) => setEditingItem(prev => 
                                  prev ? { ...prev, description: e.target.value } : null
                                )}
                                rows={4}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleSaveEdit}>{t.save}</Button>
                              <Button variant="outline" onClick={() => setEditingItem(null)}>
                                {t.cancel}
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Approve */}
                    {item.status === 'pending' && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleApprove(item.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        {t.approve}
                      </Button>
                    )}

                    {/* Reject */}
                    {item.status === 'pending' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <X className="h-3 w-3 mr-1" />
                            {t.reject}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t.rejectContent}</AlertDialogTitle>
                            <AlertDialogDescription>
                              Rejecting: &quot;{item.title}&quot;
                              <div className="space-y-3">
                                <div>
                                  <Label htmlFor="reject-reason">{t.rejectReason}</Label>
                                  <Textarea
                                    id="reject-reason"
                                    placeholder={t.rejectReasonPlaceholder}
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={3}
                                  />
                                </div>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setRejectReason("")}>
                              {t.cancel}
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleReject(item.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {t.confirmReject}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {/* Delete */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3 mr-1" />
                          {t.delete}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t.deleteConfirm}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t.deleteMessage}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {t.confirmDelete}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaGallery;