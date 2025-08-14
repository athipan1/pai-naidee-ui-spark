import React, { useRef, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, SwitchCamera, X, RotateCcw } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface CameraCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  open,
  onOpenChange,
  onCapture
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string>('');

  const startCamera = useCallback(async () => {
    try {
      setError('');
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้งานกล้อง');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        onCapture(file);
        stopCamera();
        onOpenChange(false);
      }
    }, 'image/jpeg', 0.9);
  }, [onCapture, onOpenChange, stopCamera]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Start camera when dialog opens
  React.useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [open, startCamera, stopCamera]);

  // Restart camera when facing mode changes
  React.useEffect(() => {
    if (isStreaming) {
      startCamera();
    }
  }, [facingMode, startCamera, isStreaming]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center justify-between">
            <span>ถ่ายภาพ</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          {error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={startCamera} size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                ลองใหม่
              </Button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-square object-cover bg-black"
              />
              
              <canvas
                ref={canvasRef}
                className="hidden"
              />

              {/* Camera Controls */}
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center space-x-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={switchCamera}
                  className="rounded-full h-12 w-12 p-0"
                >
                  <SwitchCamera className="h-5 w-5" />
                </Button>

                <Button
                  onClick={capturePhoto}
                  disabled={!isStreaming}
                  className="rounded-full h-16 w-16 p-0"
                >
                  <Camera className="h-6 w-6" />
                </Button>

                <div className="w-12" /> {/* Spacer */}
              </div>

              {/* Camera indicator */}
              {isStreaming && (
                <div className="absolute top-4 right-4">
                  <div className="flex items-center space-x-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span>LIVE</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};