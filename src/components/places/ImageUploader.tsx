import { useState } from 'react';
import { supabase } from '@/services/supabase.service';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

interface ImageUploaderProps {
  onUploadSuccess: (publicUrl: string) => void;
}

export const ImageUploader = ({ onUploadSuccess }: ImageUploaderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      // Basic validation
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      setUploadedImageUrl(null); // Reset preview if a new file is selected
    }
  };

  const handleUpload = async () => {
    if (!file || !user) {
      toast({
        title: 'Upload Error',
        description: 'Please select a file to upload and make sure you are logged in.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from('place_images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        // Duplex option for progress tracking
        duplex: 'half',
        // @ts-ignore - Supabase JS v2 has experimental progress tracking
        onProgress: (event) => {
          if (event.total) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            setProgress(percentage);
          }
        },
      });

    setUploading(false);

    if (error) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
      console.error('Upload error:', error);
      return;
    }

    // Get public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('place_images')
      .getPublicUrl(filePath);

    if (!publicUrl) {
      toast({
        title: 'Error getting public URL',
        description: 'The image was uploaded, but we could not get its public URL.',
        variant: 'destructive',
      });
      return;
    }

    setUploadedImageUrl(publicUrl);
    onUploadSuccess(publicUrl); // Pass the URL to the parent component
    toast({
      title: 'Upload Successful',
      description: 'Image has been uploaded successfully.',
    });
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} disabled={uploading} />
      {uploading && <Progress value={progress} className="w-full" />}
      <Button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? `Uploading... ${progress}%` : 'Upload Image'}
      </Button>
      {uploadedImageUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium">Image Preview:</p>
          <img src={uploadedImageUrl} alt="Uploaded preview" className="mt-2 rounded-md max-w-xs h-auto" />
        </div>
      )}
    </div>
  );
};