import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { cn } from "@/shared/lib/utils";

interface ImageGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

export function ImageGallery({ images, title, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
        <img
          src={`https://images.unsplash.com/${images[selectedIndex]}?w=800&h=500&fit=crop`}
          alt={`${title} - รูปที่ ${selectedIndex + 1}`}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute bottom-4 right-4 rounded-full bg-background/80 px-3 py-1 text-sm backdrop-blur-sm">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Carousel */}
      <Carousel className="w-full max-w-sm mx-auto">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index} className="basis-1/3">
              <Card 
                className={cn(
                  "cursor-pointer overflow-hidden transition-all duration-200 hover:ring-2 hover:ring-primary",
                  selectedIndex === index && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedIndex(index)}
              >
                <img
                  src={`https://images.unsplash.com/${image}?w=200&h=150&fit=crop`}
                  alt={`${title} - ภาพย่อที่ ${index + 1}`}
                  className="aspect-[4/3] w-full object-cover"
                />
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}