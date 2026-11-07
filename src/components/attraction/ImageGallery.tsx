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
import type { AttractionPhotoCredit } from '@/shared/types/attraction';

interface ImageGalleryProps {
  images: string[];
  alt: string;
  credits?: AttractionPhotoCredit[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, alt, credits = [] }) => {
  if (!images || images.length === 0) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center bg-muted">
        <p className="text-muted-foreground">No image available</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* CarouselContent adds a viewport wrapper; it must also fill the hero height. */}
      <Carousel className="h-full w-full overflow-hidden [&>div]:h-full">
        <CarouselContent className="h-full">
          {images.map((src, index) => (
            <CarouselItem key={index} className="relative h-full">
              <Dialog>
                <DialogTrigger asChild>
                  <button type="button" aria-label={`${alt} - image ${index + 1}`} className="h-full w-full cursor-zoom-in overflow-hidden">
                    <OptimizedImage
                      src={src}
                      alt={`${alt} - image ${index + 1}`}
                      className="h-full w-full object-cover object-center"
                      loading={index === 0 ? "eager" : "lazy"}
                      width="100%"
                      height="100%"
                    />
                  </button>
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
              {credits.filter(credit=>credit.url===src).map(credit=><p key={credit.url} className="absolute left-6 top-3 max-w-[80%] rounded-lg bg-white/95 p-2 text-xs text-slate-800">
                {credit.photographer} · {credit.sourcePage ? <a className="underline" href={credit.sourcePage} target="_blank" rel="noopener noreferrer">แหล่งภาพ</a> : credit.licenseName}
                {credit.licenseUrl && <> · <a className="underline" href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">{credit.licenseName}</a></>}
              </p>)}
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
