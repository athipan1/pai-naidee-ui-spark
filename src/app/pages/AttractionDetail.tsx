import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Star, MapPin, Clock, Wifi, Car, Bed, Calendar, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/shared/hooks/use-toast';
import { isAuthenticated } from '@/shared/utils/api';

interface AttractionDetail {
  id: string;
  name: string;
  nameLocal: string;
  province: string;
  category: string;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  tags: string[];
  rooms: {
    id: string;
    name: string;
    price: number;
    currency: string;
    amenities: string[];
    maxGuests: number;
    image: string;
  }[];
  cars: {
    id: string;
    brand: string;
    model: string;
    price_per_day: number;
    currency: string;
    features: string[];
    image: string;
  }[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface AttractionDetailProps {
  currentLanguage: 'th' | 'en';
  onBack: () => void;
}

const AttractionDetail = ({ currentLanguage, onBack }: AttractionDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [attraction, setAttraction] = useState<AttractionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const content = {
    th: {
      loading: 'กำลังโหลด...',
      backToSearch: 'กลับ',
      addToFavorites: 'เพิ่มรายการโปรด',
      removeFromFavorites: 'ลบออกจากรายการโปรด',
      accommodation: 'ที่พัก',
      carRental: 'เช่ารถ',
      bookRoom: 'จองห้องนี้',
      rentCar: 'เช่าคันนี้',
      perNight: 'ต่อคืน',
      perDay: 'ต่อวัน',
      maxGuests: 'ผู้เข้าพักสูงสุด',
      people: 'คน',
      amenities: 'สิ่งอำนวยความสะดวก',
      features: 'คุณสมบัติ',
      loginRequired: 'กรุณาเข้าสู่ระบบเพื่อจอง',
      bookingSuccess: 'จองเรียบร้อยแล้ว!',
      bookingError: 'เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่',
      notFound: 'ไม่พบสถานที่ท่องเที่ยวนี้'
    },
    en: {
      loading: 'Loading...',
      backToSearch: 'Back',
      addToFavorites: 'Add to Favorites',
      removeFromFavorites: 'Remove from Favorites',
      accommodation: 'Accommodation',
      carRental: 'Car Rental',
      bookRoom: 'Book This Room',
      rentCar: 'Rent This Car',
      perNight: 'per night',
      perDay: 'per day',
      maxGuests: 'Max Guests',
      people: 'people',
      amenities: 'Amenities',
      features: 'Features',
      loginRequired: 'Please login to book',
      bookingSuccess: 'Booking successful!',
      bookingError: 'Booking error. Please try again',
      notFound: 'Attraction not found'
    }
  };

  const t = content[currentLanguage];

  // Fetch attraction details
  useEffect(() => {
    const fetchAttractionDetail = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        const response = await fetch(`/api/attractions/${id}`, {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch attraction details');
        }

        const data = await response.json();
        setAttraction(data);
      } catch (error) {
        console.error('Error fetching attraction details:', error);
        // Mock data for demonstration
        setAttraction({
          id: id || '1',
          name: 'Phi Phi Islands',
          nameLocal: 'หมู่เกาะพีพี',
          province: currentLanguage === 'th' ? 'กระบี่' : 'Krabi',
          category: 'Beach',
          rating: 4.8,
          reviewCount: 2547,
          images: [
            '/src/shared/assets/hero-beach.jpg',
            '/src/shared/assets/floating-market.jpg',
            '/src/shared/assets/mountain-nature.jpg'
          ],
          description: currentLanguage === 'th' 
            ? 'น้ำทะเลใสและหน้าผาหินปูนที่สวยงาม ทำให้ที่นี่เป็นสวรรค์สำหรับผู้ที่ชื่นชอบชายหาดและการดำน้ำดูปะการั' 
            : 'Crystal clear waters and stunning limestone cliffs make this a paradise for beach lovers and snorkeling enthusiasts.',
          tags: ['Beach', 'Snorkeling', 'Island', 'Photography'],
          rooms: [
            {
              id: 'room1',
              name: currentLanguage === 'th' ? 'ห้องมาตรฐาน วิวทะเล' : 'Standard Sea View Room',
              price: 1200,
              currency: 'THB',
              amenities: ['Wifi', 'Air Conditioning', 'Sea View', 'Private Bathroom'],
              maxGuests: 2,
              image: '/src/shared/assets/hero-beach.jpg'
            },
            {
              id: 'room2',
              name: currentLanguage === 'th' ? 'ห้องดีลักซ์ วิวทะเล' : 'Deluxe Sea View Room',
              price: 2500,
              currency: 'THB',
              amenities: ['Wifi', 'Air Conditioning', 'Sea View', 'Balcony', 'Mini Bar'],
              maxGuests: 4,
              image: '/src/shared/assets/hero-beach.jpg'
            }
          ],
          cars: [
            {
              id: 'car1',
              brand: 'Toyota',
              model: 'Vios',
              price_per_day: 800,
              currency: 'THB',
              features: ['Manual Transmission', 'Air Conditioning', 'GPS Navigation'],
              image: '/src/shared/assets/mountain-nature.jpg'
            },
            {
              id: 'car2',
              brand: 'Honda',
              model: 'City',
              price_per_day: 900,
              currency: 'THB',
              features: ['Automatic Transmission', 'Air Conditioning', 'GPS Navigation', 'Bluetooth'],
              image: '/src/shared/assets/mountain-nature.jpg'
            }
          ],
          coordinates: {
            lat: 7.7367,
            lng: 98.7784
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAttractionDetail();
  }, [id, currentLanguage]);

  const handleBookRoom = async (roomId: string) => {
    if (!isAuthenticated()) {
      toast({
        title: t.loginRequired,
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/book-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          attractionId: id,
          roomId: roomId
        })
      });

      if (!response.ok) {
        throw new Error('Booking failed');
      }

      toast({
        title: t.bookingSuccess,
        variant: "default"
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: t.bookingError,
        variant: "destructive"
      });
    }
  };

  const handleRentCar = async (carId: string) => {
    if (!isAuthenticated()) {
      toast({
        title: t.loginRequired,
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/rent-car', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          attractionId: id,
          carId: carId
        })
      });

      if (!response.ok) {
        throw new Error('Car rental failed');
      }

      toast({
        title: t.bookingSuccess,
        variant: "default"
      });
    } catch (error) {
      console.error('Car rental error:', error);
      toast({
        title: t.bookingError,
        variant: "destructive"
      });
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Here you would typically call an API to update favorites
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">{t.notFound}</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            {t.backToSearch}
          </Button>
        </div>
      </div>
    );
  }

  const displayName = currentLanguage === 'th' && attraction.nameLocal ? attraction.nameLocal : attraction.name;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t.backToSearch}
            </Button>
            <Button
              variant={isFavorite ? "default" : "outline"}
              onClick={toggleFavorite}
              className="flex items-center gap-2"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? t.removeFromFavorites : t.addToFavorites}
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={attraction.images[currentImageIndex]}
          alt={displayName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Image Navigation */}
        {attraction.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {attraction.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Overlay Content */}
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{attraction.province}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current text-yellow-400" />
              <span>{attraction.rating}</span>
              <span className="opacity-75">({attraction.reviewCount} reviews)</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {attraction.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Description */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">{attraction.description}</p>
          </CardContent>
        </Card>

        {/* Accommodation Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="w-5 h-5" />
              {t.accommodation}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {attraction.rooms.map((room) => (
              <div key={room.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full md:w-48 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{room.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{t.maxGuests}: {room.maxGuests} {t.people}</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-2">{t.amenities}:</p>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <div className="text-right mb-4">
                    <p className="text-2xl font-bold text-primary">
                      ฿{room.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">{t.perNight}</p>
                  </div>
                  <Button 
                    onClick={() => handleBookRoom(room.id)}
                    className="w-full md:w-auto"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {t.bookRoom}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Car Rental Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              {t.carRental}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {attraction.cars.map((car) => (
              <div key={car.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
                <img
                  src={car.image}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full md:w-48 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{car.brand} {car.model}</h3>
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-2">{t.features}:</p>
                    <div className="flex flex-wrap gap-2">
                      {car.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <div className="text-right mb-4">
                    <p className="text-2xl font-bold text-primary">
                      ฿{car.price_per_day.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">{t.perDay}</p>
                  </div>
                  <Button 
                    onClick={() => handleRentCar(car.id)}
                    className="w-full md:w-auto"
                  >
                    <Car className="w-4 h-4 mr-2" />
                    {t.rentCar}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttractionDetail;