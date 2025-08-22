import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Share2, Heart } from 'lucide-react';

interface StickyBottomBarProps {
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPostExperience: () => void;
  onShare: () => void;
  currentLanguage: 'th' | 'en';
}

const content = {
    th: {
        postExperience: 'โพสต์ประสบการณ์ของคุณ',
    },
    en: {
        postExperience: 'Post Your Experience',
    }
}

const StickyBottomBar: React.FC<StickyBottomBarProps> = ({
  isFavorite,
  onToggleFavorite,
  onPostExperience,
  onShare,
  currentLanguage
}) => {
  const t = content[currentLanguage];
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-3 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onToggleFavorite} aria-label="Toggle Favorite">
                <Heart className={`w-5 h-5 transition-all ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onShare} aria-label="Share">
                <Share2 className="w-5 h-5 text-muted-foreground" />
            </Button>
        </div>
        <Button onClick={onPostExperience} className="flex-grow">
            <Camera className="w-4 h-4 mr-2" />
            {t.postExperience}
        </Button>
      </div>
    </div>
  );
};

export default StickyBottomBar;
