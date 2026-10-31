import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import OptimizedImage from "@/components/common/OptimizedImage";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, alt }) => {
  if (!images || images.length === 0) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center bg-muted">
        <p className="text-muted-foreground">No image available</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Carousel className="h-full w-full overflow-hidden">
        <CarouselContent className="h-full">
          {images.map((src, index) => (
            <CarouselItem key={index} className="h-full">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="h-full w-full cursor-zoom-in overflow-hidden">
                    <OptimizedImage
                      src={src}
                      alt={`${alt} - image ${index + 1}`}
                      className="h-full w-full object-cover object-center"
                      loading={index === 0 ? "eager" : "lazy"}
                      width="100%"
                      height="100%"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-5xl p-2 bg-transparent border-0">
                  <OptimizedImage
                    src={src}
                    alt={`${alt} - image ${index + 1}`}
                    className="w-full h-auto object-contain max-h-[90vh] rounded-lg"
                    width="100%"
                    height="auto"
                  />
                </DialogContent>
              </Dialog>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          <CarouselPrevious className="relative left-0 transform-none static text-white bg-black/50 hover:bg-black/70 hover:text-white" />
          <CarouselNext className="relative right-0 transform-none static text-white bg-black/50 hover:bg-black/70 hover:text-white" />
        </div>}
      </Carousel>
    </div>
  );
};

export default ImageGallery;
