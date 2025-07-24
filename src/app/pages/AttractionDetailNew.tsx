import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BackButton } from '@/components/attraction/BackButton';
import { ImageGallery } from '@/components/attraction/ImageGallery';
import { PlaceDetails } from '@/components/attraction/PlaceDetails';
import { ActionButtons } from '@/components/attraction/ActionButtons';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useMediaQuery } from '@/shared/hooks/use-media-query';

interface AttractionData {
  id: string;
  name: string;
  images: string[];
  rating: number;
  reviewCount: number;
  description: string;
  openingHours: string;
  location: string;
  phone?: string;
  website?: string;
  activities: string[];
  highlights: string[];
  latitude: number;
  longitude: number;
}

// Mock data for demonstration
const mockAttractionData: Record<string, AttractionData> = {
  '1': {
    id: '1',
    name: 'หมู่เกาะพีพี',
    images: [
      'photo-1500375592092-40eb2168fd21',
      'photo-1482938289607-e9573fc25ebb', 
      'photo-1506744038136-46273834b3fb',
      'photo-1501854140801-50d01698950b'
    ],
    rating: 4.8,
    reviewCount: 2450,
    description: 'หมู่เกาะพีพีเป็นหมู่เกาะที่มีความงามตามธรรมชาติ ตั้งอยู่ในจังหวัดกระบี่ มีน้ำทะเลใสสีเขียวมรกต หาดทรายขาวสะอาด และภูเขาหินปูนที่สวยงาม เหมาะสำหรับการพักผ่อนและทำกิจกรรมทางน้ำต่างๆ เช่น ดำน้ำดูปะการัง, สนอร์คเกลิ้ง, และนั่งเรือชมวิวรอบเกาะ',
    openingHours: 'เปิดตลอด 24 ชั่วโมง',
    location: 'อำเภอเมือง จังหวัดกระบี่ 81000',
    phone: '075-637-200',
    website: 'https://krabi.go.th',
    activities: [
      'ดำน้ำดูปะการัง',
      'สนอร์คเกลิ้ง', 
      'นั่งเรือชมวิว',
      'อาบแดดชายหาด',
      'ถ่ายรูปธรรมชาติ',
      'ทำกิจกรรมทางน้ำ'
    ],
    highlights: ['มรดกโลก', 'ธรรมชาติ', 'ทะเล', 'ดำน้ำ'],
    latitude: 7.7407,
    longitude: 98.7784
  },
  '2': {
    id: '2', 
    name: 'เกาะล้าน',
    images: [
      'photo-1472396961693-142e6e269027',
      'photo-1433086966358-54859d0ed716',
      'photo-1465146344425-f00d5f5c8f07'
    ],
    rating: 4.6,
    reviewCount: 1850,
    description: 'เกาะล้านเป็นเกาะยอดนิยมในพัทยา มีหาดทรายขาวสะอาดและน้ำใสสีฟ้า เหมาะสำหรับการพักผ่อนและทำกิจกรรมทางน้ำ',
    openingHours: '06:00 - 18:00 น.',
    location: 'เกาะล้าน อำเภอบางละมุง จังหวัดชลบุรี',
    activities: ['ดำน้ำ', 'พาราเซลลิ่ง', 'นั่งเรือกล้วย', 'อาบแดด'],
    highlights: ['ทะเล', 'พักผ่อน', 'กิจกรรมน้ำ'],
    latitude: 12.9167,
    longitude: 100.7667
  }
};

interface AttractionDetailProps {
  currentLanguage?: 'th' | 'en';
  onBack?: () => void;
}

function AttractionDetailNew({ currentLanguage = 'th', onBack }: AttractionDetailProps) {
  const { id } = useParams<{ id: string }>();
  const [attraction, setAttraction] = useState<AttractionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const loadAttraction = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (id && mockAttractionData[id]) {
        setAttraction(mockAttractionData[id]);
      } else {
        setAttraction(null);
      }
      
      setIsLoading(false);
    };

    loadAttraction();
  }, [id]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">ไม่พบข้อมูลสถานที่ท่องเที่ยว</h1>
          <p className="text-muted-foreground">สถานที่ที่คุณกำลังมองหาอาจไม่มีอยู่ในระบบ</p>
        </div>
        <BackButton onClick={handleBack} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button - Floating on mobile, Header on desktop */}
      <BackButton 
        onClick={handleBack} 
        variant={isMobile ? "floating" : "header"}
        className={!isMobile ? "absolute top-6 left-6 z-40" : ""}
      />

      <div className="container mx-auto px-4 py-6 space-y-8 max-w-4xl">
        {/* Image Gallery */}
        <ImageGallery
          images={attraction.images}
          title={attraction.name}
          className="mt-16 md:mt-20"
        />

        {/* Place Details */}
        <PlaceDetails
          name={attraction.name}
          rating={attraction.rating}
          reviewCount={attraction.reviewCount}
          description={attraction.description}
          openingHours={attraction.openingHours}
          location={attraction.location}
          phone={attraction.phone}
          website={attraction.website}
          activities={attraction.activities}
          highlights={attraction.highlights}
        />

        {/* Action Buttons */}
        <ActionButtons
          latitude={attraction.latitude}
          longitude={attraction.longitude}
          placeName={attraction.name}
          onAddToPlan={() => console.log('Added to plan:', attraction.name)}
        />
      </div>
    </div>
  );
}

export default AttractionDetailNew;