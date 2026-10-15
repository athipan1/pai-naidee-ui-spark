import * as React from "react";
import { Sparkles } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { ImageCredit } from "@/shared/types/attraction";

interface ImageGalleryProps {
  images: string[];
  alt: string;
  credits?: ImageCredit[];
  language?: "th" | "en";
}

const hasCredit = (c?: ImageCredit) =>
  !!c && (c.isAiGenerated || !!c.credit || !!c.source || !!c.license);

export const CreditLine: React.FC<{ credit?: ImageCredit; language?: "th" | "en"; className?: string }> = ({
  credit,
  language = "th",
  className = "",
}) => {
  if (!hasCredit(credit)) return null;
  const c = credit!;
  if (c.isAiGenerated) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground backdrop-blur ${className}`}>
        <Sparkles className="h-3 w-3" />
        {language === "th" ? "สร้างด้วย AI" : "AI generated"}
      </span>
    );
  }
  const who = [c.credit, c.source].filter(Boolean).join(" / ");
  const text = `📷 ${[who, c.license].filter(Boolean).join(" · ")}`;
  const base = `inline-block max-w-full truncate rounded bg-background/80 px-2 py-0.5 text-[11px] text-muted-foreground backdrop-blur ${className}`;
  return c.sourceUrl ? (
    <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className={`${base} underline-offset-2 hover:underline`} onClick={(e) => e.stopPropagation()}>
      {text}
    </a>
  ) : (
    <span className={base}>{text}</span>
  );
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, alt, credits, language = "th" }) => {
  if (!images || images.length === 0) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No image available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Carousel className="w-full h-full rounded-lg overflow-hidden [&>div]:h-full">
        <CarouselContent className="h-full">
          {images.map((src, index) => (
            <CarouselItem key={index} className="h-full">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative h-full w-full overflow-hidden cursor-zoom-in">
                    <OptimizedImage
                      src={src}
                      alt={`${alt} - image ${index + 1}`}
                      className="w-full h-full object-cover"
                      width="100%"
                      height="100%"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-5xl p-2 bg-transparent border-0">
                  <div className="relative">
                    <OptimizedImage
                      src={src}
                      alt={`${alt} - image ${index + 1}`}
                      className="w-full h-auto object-contain max-h-[90vh] rounded-lg"
                      width="100%"
                      height="auto"
                    />
                    <div className="absolute bottom-2 right-2 max-w-[90%]">
                      <CreditLine credit={credits?.[index]} language={language} />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              {/* Credit pinned to the bottom corner of each photo */}
              <div className="absolute bottom-1 right-2 z-20 max-w-[60%] text-right">
                <CreditLine credit={credits?.[index]} language={language} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <CarouselPrevious className="relative left-0 transform-none static text-white bg-black/50 hover:bg-black/70 hover:text-white" />
          <CarouselNext className="relative right-0 transform-none static text-white bg-black/50 hover:bg-black/70 hover:text-white" />
        </div>
      </Carousel>
    </div>
  );
};

export default ImageGallery;
