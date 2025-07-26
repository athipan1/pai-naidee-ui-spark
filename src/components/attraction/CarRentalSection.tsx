import React from 'react';
import { Car, Settings, Zap, Navigation as NavIcon, Bluetooth } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CarRental {
  id: string;
  brand: string;
  model: string;
  price_per_day: number;
  currency: string;
  features: string[];
  image: string;
}

interface CarRentalSectionProps {
  cars: CarRental[];
  currentLanguage: "th" | "en";
  onRentCar: (carId: string) => void;
}

const CarRentalSection = ({ cars, currentLanguage, onRentCar }: CarRentalSectionProps) => {
  const getFeatureIcon = (feature: string) => {
    const featureLower = feature.toLowerCase();
    if (featureLower.includes('transmission')) return <Settings className="w-4 h-4" />;
    if (featureLower.includes('air') || featureLower.includes('conditioning')) return <Zap className="w-4 h-4" />;
    if (featureLower.includes('gps') || featureLower.includes('navigation')) return <NavIcon className="w-4 h-4" />;
    if (featureLower.includes('bluetooth')) return <Bluetooth className="w-4 h-4" />;
    return <Settings className="w-4 h-4" />;
  };

  const content = {
    title: { th: "รถเช่า", en: "Car Rental" },
    rent: { th: "เช่ารถคันนี้", en: "Rent This Car" },
    features: { th: "คุณสมบัติ", en: "Features" },
    perDay: { th: "ต่อวัน", en: "per day" },
    noCars: { th: "ไม่มีรถเช่าในขณะนี้", en: "No rental cars available at this time" }
  };

  if (!cars || cars.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            {content.title[currentLanguage]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {content.noCars[currentLanguage]}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="w-5 h-5" />
          {content.title[currentLanguage]}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {cars.map((car) => (
          <div
            key={car.id}
            className="flex flex-col md:flex-row gap-4 p-4 border border-border rounded-lg hover:shadow-md transition-shadow"
          >
            {/* Car Image */}
            <div className="w-full md:w-48 h-32 flex-shrink-0">
              <img
                src={car.image}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-full object-cover rounded-md"
              />
            </div>

            {/* Car Details */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-semibold">
                  {car.brand} {car.model}
                </h3>
              </div>

              {/* Features */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {content.features[currentLanguage]}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {getFeatureIcon(feature)}
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Price and Rental */}
            <div className="flex flex-col justify-between items-end text-right md:min-w-[140px]">
              <div className="mb-4">
                <div className="text-2xl font-bold text-primary">
                  {car.currency}{car.price_per_day.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {content.perDay[currentLanguage]}
                </div>
              </div>
              
              <Button 
                onClick={() => onRentCar(car.id)}
                className="w-full md:w-auto min-w-[120px]"
              >
                <Car className="w-4 h-4 mr-2" />
                {content.rent[currentLanguage]}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CarRentalSection;