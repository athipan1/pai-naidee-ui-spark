import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Navigation, Plus, Share2, Heart } from 'lucide-react';

// Simple Button component
const Button = ({ children, onClick, className = "", variant = "default", size = "default" }: any) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    ghost: "hover:bg-gray-100"
  };
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    lg: "h-11 px-8 py-2 text-base",
    icon: "h-10 w-10"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Simple Card component
const Card = ({ children, className = "" }: any) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }: any) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

// Simple Badge component
const Badge = ({ children, className = "" }: any) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800 ${className}`}>
    {children}
  </span>
);

// Attraction Detail Page
function AttractionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  
  const attraction = {
    name: 'หมู่เกาะพีพี',
    rating: 4.8,
    reviewCount: 2450,
    description: 'หมู่เกาะพีพีเป็นหมู่เกาะที่มีความงามตามธรรมชาติ ตั้งอยู่ในจังหวัดกระบี่ มีน้ำทะเลใสสีเขียวมรกต หาดทรายขาวสะอาด และภูเขาหินปูนที่สวยงาม เหมาะสำหรับการพักผ่อนและทำกิจกรรมทางน้ำต่างๆ',
    openingHours: 'เปิดตลอด 24 ชั่วโมง',
    location: 'อำเภอเมือง จังหวัดกระบี่ 81000',
    activities: ['ดำน้ำดูปะการัง', 'สนอร์คเกลิ้ง', 'นั่งเรือชมวิว', 'อาบแดดชายหาด'],
    highlights: ['มรดกโลก', 'ธรรมชาติ', 'ทะเล', 'ดำน้ำ'],
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=500&fit=crop'
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    const emptyStars = 5 - fullStars;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={() => navigate('/')}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-white text-gray-700 hover:bg-gray-100"
          variant="outline"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8 max-w-4xl">
        {/* Hero Image */}
        <div className="mt-16">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
            <img
              src={attraction.image}
              alt={attraction.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Place Details */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-900">{attraction.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(attraction.rating)}
              </div>
              <span className="text-lg font-semibold">{attraction.rating}</span>
              <span className="text-gray-600">({attraction.reviewCount.toLocaleString()} รีวิว)</span>
            </div>
          </div>

          {/* Highlights */}
          <div className="flex flex-wrap gap-2">
            {attraction.highlights.map((highlight) => (
              <Badge key={highlight}>
                {highlight}
              </Badge>
            ))}
          </div>

          {/* Description */}
          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold mb-3">📝 รายละเอียด</h3>
              <p className="text-gray-600 leading-relaxed">{attraction.description}</p>
            </CardContent>
          </Card>

          {/* Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-blue-600">🕒</div>
                  <div>
                    <p className="font-medium">เวลาเปิด-ปิด</p>
                    <p className="text-sm text-gray-600">{attraction.openingHours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-blue-600">📍</div>
                  <div>
                    <p className="font-medium">ที่อยู่</p>
                    <p className="text-sm text-gray-600">{attraction.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activities */}
          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold mb-4">🎯 กิจกรรมที่ทำได้</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {attraction.activities.map((activity) => (
                  <div key={activity} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    {activity}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button size="lg" className="gap-2">
              <Navigation className="h-5 w-5" />
              นำทางไปที่นี่
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              เพิ่มลงแผน
            </Button>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => setIsFavorited(!isFavorited)} 
              variant="outline" 
              size="icon"
              className={isFavorited ? "text-red-500 border-red-200" : ""}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Home Page
function Home() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🏝️ สถานที่ท่องเที่ยวในไทย</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/attraction/1')}>
            <img
              src="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400&h=250&fit=crop"
              alt="หมู่เกาะพีพี"
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <CardContent>
              <h3 className="font-semibold text-lg mb-2">หมู่เกาะพีพี</h3>
              <div className="flex items-center gap-1 mb-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">4.8 (2,450 รีวิว)</span>
              </div>
              <p className="text-gray-600 text-sm">เกาะสวยงามในจังหวัดกระบี่</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Main App
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/attraction/:id" element={<AttractionDetail />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
