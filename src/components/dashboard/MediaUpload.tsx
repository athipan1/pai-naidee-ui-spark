import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/shared/hooks/use-toast";
import { Upload, FileImage, FileVideo, FileText, X } from "lucide-react";
import { MediaUploadData, SUPPORTED_IMAGE_TYPES, SUPPORTED_VIDEO_TYPES, MAX_FILE_SIZE } from "@/shared/types/media";

interface MediaUploadProps {
  currentLanguage: "th" | "en";
  onUpload: (data: MediaUploadData) => void;
}

const MediaUpload = ({ currentLanguage, onUpload }: MediaUploadProps) => {
  const [formData, setFormData] = useState<MediaUploadData>({
    title: "",
    description: "",
    type: "image",
    file: undefined
  });
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const texts = {
    en: {
      title: "Upload Media Content",
      subtitle: "Add images, videos, or text content to the application",
      contentTitle: "Content Title",
      contentDescription: "Content Description",
      contentType: "Content Type",
      image: "Image",
      video: "Video", 
      text: "Text Content",
      fileUpload: "File Upload",
      dragDrop: "Drag and drop your file here, or click to browse",
      supportedFormats: "Supported formats",
      maxSize: "Maximum file size: 50MB",
      upload: "Upload Content",
      titlePlaceholder: "Enter content title...",
      descriptionPlaceholder: "Enter content description...",
      noFileSelected: "No file selected",
      fileName: "File name",
      fileSize: "File size",
      removeFile: "Remove file",
      invalidFileType: "Invalid file type. Please select a supported format.",
      fileTooLarge: "File is too large. Maximum size is 50MB.",
      uploadSuccess: "Content uploaded successfully!",
      uploadError: "Failed to upload content. Please try again.",
      requiredFields: "Please fill in all required fields."
    },
    th: {
      title: "อัปโหลดเนื้อหาสื่อ",
      subtitle: "เพิ่มรูปภาพ วิดีโอ หรือเนื้อหาข้อความให้กับแอปพลิเคชัน",
      contentTitle: "ชื่อเนื้อหา",
      contentDescription: "คำอธิบายเนื้อหา",
      contentType: "ประเภทเนื้อหา",
      image: "รูปภาพ",
      video: "วิดีโอ",
      text: "เนื้อหาข้อความ",
      fileUpload: "อัปโหลดไฟล์",
      dragDrop: "ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์",
      supportedFormats: "รูปแบบไฟล์ที่รองรับ",
      maxSize: "ขนาดไฟล์สูงสุด: 50MB",
      upload: "อัปโหลดเนื้อหา",
      titlePlaceholder: "ใส่ชื่อเนื้อหา...",
      descriptionPlaceholder: "ใส่คำอธิบายเนื้อหา...",
      noFileSelected: "ไม่ได้เลือกไฟล์",
      fileName: "ชื่อไฟล์",
      fileSize: "ขนาดไฟล์",
      removeFile: "ลบไฟล์",
      invalidFileType: "ประเภทไฟล์ไม่ถูกต้อง กรุณาเลือกรูปแบบที่รองรับ",
      fileTooLarge: "ไฟล์มีขนาดใหญ่เกินไป ขนาดสูงสุดคือ 50MB",
      uploadSuccess: "อัปโหลดเนื้อหาสำเร็จ!",
      uploadError: "ไม่สามารถอัปโหลดเนื้อหาได้ กรุณาลองใหม่อีกครั้ง",
      requiredFields: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน"
    }
  };

  const t = texts[currentLanguage];

  const validateFile = useCallback((file: File): boolean => {
    const isImageType = SUPPORTED_IMAGE_TYPES.includes(file.type as any);
    const isVideoType = SUPPORTED_VIDEO_TYPES.includes(file.type as any);
    
    if (formData.type === 'image' && !isImageType) {
      toast({
        title: "Error",
        description: t.invalidFileType,
        variant: "destructive"
      });
      return false;
    }
    
    if (formData.type === 'video' && !isVideoType) {
      toast({
        title: "Error", 
        description: t.invalidFileType,
        variant: "destructive"
      });
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: t.fileTooLarge,
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  }, [formData.type, t, toast]);

  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      setFormData(prev => ({ ...prev, file }));
    }
  }, [validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback(() => {
    setFormData(prev => ({ ...prev, file: undefined }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: t.requiredFields,
        variant: "destructive"
      });
      return;
    }
    
    if (formData.type !== 'text' && !formData.file) {
      toast({
        title: "Error",
        description: t.requiredFields,
        variant: "destructive"
      });
      return;
    }

    try {
      onUpload(formData);
      toast({
        title: "Success",
        description: t.uploadSuccess
      });
      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "image",
        file: undefined
      });
    } catch {
      toast({
        title: "Error",
        description: t.uploadError,
        variant: "destructive"
      });
    }
  }, [formData, onUpload, t, toast]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <FileImage className="h-4 w-4" />;
      case 'video': return <FileVideo className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      default: return <FileImage className="h-4 w-4" />;
    }
  };

  const getSupportedFormats = () => {
    switch (formData.type) {
      case 'image': return 'JPEG, PNG';
      case 'video': return 'MP4';
      case 'text': return 'Text content only';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-600" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t.contentTitle} *</Label>
            <Input
              id="title"
              type="text"
              placeholder={t.titlePlaceholder}
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Content Type */}
          <div className="space-y-2">
            <Label>{t.contentType} *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'image' | 'video' | 'text') => 
                setFormData(prev => ({ ...prev, type: value, file: undefined }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    {t.image}
                  </div>
                </SelectItem>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <FileVideo className="h-4 w-4" />
                    {t.video}
                  </div>
                </SelectItem>
                <SelectItem value="text">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {t.text}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t.contentDescription} *</Label>
            <Textarea
              id="description"
              placeholder={t.descriptionPlaceholder}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
            />
          </div>

          {/* File Upload (for image and video) */}
          {formData.type !== 'text' && (
            <div className="space-y-2">
              <Label>{t.fileUpload} *</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {formData.file ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      {getTypeIcon(formData.type)}
                      <span className="font-medium">{formData.file.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{t.fileName}: {formData.file.name}</p>
                      <p>{t.fileSize}: {formatFileSize(formData.file.size)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      {t.removeFile}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-600">{t.dragDrop}</p>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept={formData.type === 'image' ? 'image/jpeg,image/jpg,image/png' : 'video/mp4'}
                        onChange={handleFileInputChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Browse Files
                      </Button>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>{t.supportedFormats}: {getSupportedFormats()}</p>
                      <p>{t.maxSize}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            {t.upload}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MediaUpload;