import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Navigation,
  MapPin,
  Filter,
  UtensilsCrossed,
  Fuel,
  Target,
  Grid3X3,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Attraction {
  id: string;
  name: string;
  nameLocal: string;
  category: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  description: string;
}

interface POI {
  id: string;
  name: string;
  type: "gas_station" | "restaurant" | "attraction";
  coordinates: { lat: number; lng: number };
  distance?: number;
}

interface MapViewProps {
  currentLanguage: "th" | "en";
  selectedAttractionId?: string;
}

const MapView = ({ currentLanguage, selectedAttractionId }: MapViewProps) => {
  const _navigate = useNavigate(); // Keeping for future use
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showTraffic, setShowTraffic] = useState(false);
  const [searchRadius, setSearchRadius] = useState([10]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyPOIs, setNearbyPOIs] = useState<POI[]>([]);
  const [showNearbyPOIs, setShowNearbyPOIs] = useState(false);
  const [selectedPOIType, setSelectedPOIType] = useState<string>("all");

  const content = {
    th: {
      title: "แผนที่",
      navigateExternal: "นำทางด้วยแอปแผนที่ภายนอก",
      exploreNearby: "📍ใกล้ฉัน",
      showAllCategories: "🏞️ แสดงทุกหมวด",
      filters: "ตัวกรอง",
      trafficLayer: "แสดงการจราจร",
      searchRadius: "รัศมีการค้นหา",
      kilometers: "กิโลเมตร",
      gasStations: "⛽ ปั๊มน้ำมัน",
      restaurants: "🍽️ ร้านอาหาร",
      attractions: "🏞️ สถานที่ท่องเที่ยว",
      nearbyPOIs: "สถานที่ใกล้เคียง",
      navigate: "นำทาง",
      categories: {
        all: "ทั้งหมด",
        beach: "ชายหาด",
        culture: "วัฒนธรรม",
        nature: "ธรรมชาติ",
        food: "อาหาร"
      }
    },
    en: {
      title: "Map",
      navigateExternal: "Navigate with External Map App",
      exploreNearby: "📍Near Me",
      showAllCategories: "🏞️ Show All Categories",
      filters: "Filters",
      trafficLayer: "Show Traffic",
      searchRadius: "Search Radius",
      kilometers: "kilometers",
      gasStations: "⛽ Gas Stations",
      restaurants: "🍽️ Restaurants",
      attractions: "🏞️ Attractions",
      nearbyPOIs: "Nearby POIs",
      navigate: "Navigate",
      categories: {
        all: "All",
        beach: "Beach",
        culture: "Culture",
        nature: "Nature",
        food: "Food"
      }
    },
  };

  const t = content[currentLanguage];

  // Mock attraction data with coordinates
  const attractions: Attraction[] = [
    {
      id: "1",
      name: "Phi Phi Islands",
      nameLocal: "หมู่เกาะพีพี",
      category: "beach",
      coordinates: { lat: 7.7367, lng: 98.7784 },
      rating: 4.8,
      description: "Beautiful beach destination"
    },
    {
      id: "2",
      name: "Wat Phra Kaew",
      nameLocal: "วัดพระแก้ว",
      category: "culture",
      coordinates: { lat: 13.7563, lng: 100.4925 },
      rating: 4.9,
      description: "Sacred Buddhist temple"
    },
    {
      id: "3",
      name: "Doi Inthanon",
      nameLocal: "ดอยอินทนนท์",
      category: "nature",
      coordinates: { lat: 18.5833, lng: 98.4833 },
      rating: 4.7,
      description: "Highest peak in Thailand"
    },
    {
      id: "4",
      name: "Floating Market",
      nameLocal: "ตลาดน้ำ",
      category: "food",
      coordinates: { lat: 13.5282, lng: 100.1145 },
      rating: 4.5,
      description: "Traditional floating market"
    }
  ];

  // Find current attraction or default to first one
  const currentAttraction = attractions.find(a => a.id === selectedAttractionId) || attractions[0];
  
  // Filter attractions based on selected category
  const filteredAttractions = selectedCategory === "all" 
    ? attractions 
    : attractions.filter(a => a.category === selectedCategory);

  // Get display name for current attraction
  const displayName = currentLanguage === "th" && currentAttraction.nameLocal
    ? currentAttraction.nameLocal
    : currentAttraction.name;

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Default to Bangkok if geolocation fails
          setUserLocation({ lat: 13.7563, lng: 100.5018 });
        }
      );
    }
  }, []);

  // Generate nearby POIs based on radius with realistic data
  const generateNearbyPOIs = (center: { lat: number; lng: number }, radiusKm: number) => {
    const pois: POI[] = [];
    
    // More POIs for larger radius, with realistic distribution
    const gasStationCount = Math.max(1, Math.floor(radiusKm / 5));
    const restaurantCount = Math.max(2, Math.floor(radiusKm / 3));
    const attractionCount = Math.max(1, Math.floor(radiusKm / 8));
    
    const gasStationNames = [
      "Shell Station", "PTT Station", "Bangchak Station", "Esso Station", "Caltex Station"
    ];
    const restaurantNames = [
      "Local Thai Restaurant", "Street Food Corner", "Seafood Paradise", "Coffee House", "Night Market Food"
    ];
    const attractionNames = [
      "Local Temple", "Scenic Viewpoint", "Cultural Center", "Art Gallery", "Local Park"
    ];
    
    // Generate gas stations
    for (let i = 0; i < gasStationCount; i++) {
      const angle = (Math.PI * 2 * i) / gasStationCount + Math.random() * 0.5;
      const distance = Math.random() * radiusKm * 0.8 + radiusKm * 0.2;
      const lat = center.lat + (distance / 111) * Math.cos(angle);
      const lng = center.lng + (distance / (111 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(angle);
      
      pois.push({
        id: `gas-${i}`,
        name: gasStationNames[i % gasStationNames.length],
        type: "gas_station",
        coordinates: { lat, lng },
        distance: Math.round(distance * 10) / 10
      });
    }
    
    // Generate restaurants
    for (let i = 0; i < restaurantCount; i++) {
      const angle = (Math.PI * 2 * i) / restaurantCount + Math.random() * 0.8;
      const distance = Math.random() * radiusKm * 0.7 + radiusKm * 0.1;
      const lat = center.lat + (distance / 111) * Math.cos(angle);
      const lng = center.lng + (distance / (111 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(angle);
      
      pois.push({
        id: `restaurant-${i}`,
        name: restaurantNames[i % restaurantNames.length],
        type: "restaurant",
        coordinates: { lat, lng },
        distance: Math.round(distance * 10) / 10
      });
    }
    
    // Generate attractions
    for (let i = 0; i < attractionCount; i++) {
      const angle = (Math.PI * 2 * i) / attractionCount + Math.random() * 1.2;
      const distance = Math.random() * radiusKm * 0.9 + radiusKm * 0.3;
      const lat = center.lat + (distance / 111) * Math.cos(angle);
      const lng = center.lng + (distance / (111 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(angle);
      
      pois.push({
        id: `attraction-${i}`,
        name: attractionNames[i % attractionNames.length],
        type: "attraction",
        coordinates: { lat, lng },
        distance: Math.round(distance * 10) / 10
      });
    }
    
    return pois;
  };

  // Handle explore nearby
  const handleExploreNearby = () => {
    if (userLocation) {
      const pois = generateNearbyPOIs(userLocation, searchRadius[0]);
      setNearbyPOIs(pois);
      setShowNearbyPOIs(true);
    }
  };

  // Handle show all categories
  const handleShowAllCategories = () => {
    setSelectedCategory("all");
    setShowNearbyPOIs(false);
  };

  // Handle external navigation
  const handleExternalNavigation = (lat: number, lng: number) => {
    // Generic navigation without specific Google Maps reference
    alert(`นำทางไปยังตำแหน่ง: ${lat}, ${lng}`);
  };

  // Custom marker icons for different POI types
  const getMarkerIcon = (type: string) => {
    switch (type) {
      case "gas_station":
        return "⛽";
      case "restaurant":
        return "🍽️";
      case "attraction":
        return "🏞️";
      default:
        return "📍";
    }
  };

  const openLocation = (lat: number, lng: number, placeName?: string) => {
    // Display location information instead of opening Google Maps
    const locationText = placeName 
      ? `ตำแหน่ง: ${placeName}\nพิกัด: ${lat}, ${lng}`
      : `พิกัด: ${lat}, ${lng}`;
    alert(locationText);
  };

  const mapCenter = userLocation && showNearbyPOIs ? userLocation : currentAttraction.coordinates;

  return (
    <div className="h-full bg-background">
      {/* Filters Controls */}
      <div className="border-b border-border/30 bg-card/50 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t.title}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {t.filters}
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-4 border-t border-border/30 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t.categories.all}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.categories.all}</SelectItem>
                      <SelectItem value="beach">{t.categories.beach}</SelectItem>
                      <SelectItem value="culture">{t.categories.culture}</SelectItem>
                      <SelectItem value="nature">{t.categories.nature}</SelectItem>
                      <SelectItem value="food">{t.categories.food}</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t.nearbyPOIs}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t.searchRadius}</label>
                    <Slider
                      value={searchRadius}
                      onValueChange={setSearchRadius}
                      max={50}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      {searchRadius[0]} {t.kilometers}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExploreNearby}
                      className="justify-start"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      {t.exploreNearby}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShowAllCategories}
                      className="justify-start"
                    >
                      <Grid3X3 className="w-4 h-4 mr-2" />
                      {t.showAllCategories}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t.trafficLayer}</span>
                      <Switch checked={showTraffic} onCheckedChange={setShowTraffic} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">POI Shortcuts</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedPOIType("gas_station")}>
                    <Fuel className="w-4 h-4 mr-2" />
                    {t.gasStations}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedPOIType("restaurant")}>
                    <UtensilsCrossed className="w-4 h-4 mr-2" />
                    {t.restaurants}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedPOIType("attraction")}>
                    <MapPin className="w-4 h-4 mr-2" />
                    {t.attractions}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative p-4">
        {/* Map Placeholder with Interactive Elements */}
        <div className="h-96 w-full bg-gradient-to-br from-blue-50 to-green-50 border rounded-lg overflow-hidden relative">
          
          {/* Map Header with Controls */}
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <h3 className="font-semibold text-sm mb-2">
                {showNearbyPOIs ? `${t.nearbyPOIs} (${searchRadius[0]}km)` : displayName}
              </h3>
              <div className="text-xs text-gray-600">
                📍 {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
              </div>
            </div>
            
            {showTraffic && (
              <div className="bg-red-500/90 text-white text-xs px-2 py-1 rounded">
                🚦 Traffic Layer Active
              </div>
            )}
          </div>

          {/* Central Map View */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-xl max-w-md text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="w-10 h-10 text-primary" />
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{displayName}</h3>
              <p className="text-sm text-gray-600 mb-4">
                📍 {currentAttraction.coordinates.lat.toFixed(6)}, {currentAttraction.coordinates.lng.toFixed(6)}
              </p>
              
              <div className="grid gap-2">
                <Button
                  size="sm"
                  onClick={() => openLocation(currentAttraction.coordinates.lat, currentAttraction.coordinates.lng, displayName)}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Location
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExternalNavigation(currentAttraction.coordinates.lat, currentAttraction.coordinates.lng)}
                  className="flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </Button>
              </div>
            </div>
          </div>

          {/* Attraction Markers Display */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="text-xs font-medium mb-2">
                {showNearbyPOIs ? (
                  <>
                    <span>Found {nearbyPOIs.length} POIs nearby </span>
                    {selectedPOIType !== "all" && <span>({selectedPOIType.replace('_', ' ')} only)</span>}
                    <span className="text-gray-500"> • {userLocation ? 'Your location' : 'Default location'}</span>
                  </>
                ) : (
                  <>
                    <span>{filteredAttractions.length} Attractions</span>
                    <span className="text-gray-500"> • Category: {selectedCategory}</span>
                  </>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                {showNearbyPOIs ? (
                  nearbyPOIs
                    .filter(poi => selectedPOIType === "all" || poi.type === selectedPOIType)
                    .slice(0, 8)
                    .map((poi) => (
                      <button
                        key={poi.id}
                        onClick={() => handleExternalNavigation(poi.coordinates.lat, poi.coordinates.lng)}
                        className="bg-white rounded-full px-3 py-1 text-xs border hover:bg-gray-50 transition-colors flex items-center gap-1 min-w-0"
                      >
                        <span>{getMarkerIcon(poi.type)}</span>
                        <span className="truncate">{poi.name}</span>
                        {poi.distance && <span className="text-gray-500 flex-shrink-0">({poi.distance}km)</span>}
                      </button>
                    ))
                ) : (
                  filteredAttractions.map((attraction) => (
                    <button
                      key={attraction.id}
                      onClick={() => handleExternalNavigation(attraction.coordinates.lat, attraction.coordinates.lng)}
                      className="bg-white rounded-full px-3 py-1 text-xs border hover:bg-gray-50 transition-colors flex items-center gap-1 min-w-0"
                    >
                      <span>🏞️</span>
                      <span className="truncate">{currentLanguage === "th" ? attraction.nameLocal : attraction.name}</span>
                      <span className="text-yellow-500 flex-shrink-0">★{attraction.rating}</span>
                    </button>
                  ))
                )}
                
                {/* Show preview of hidden items */}
                {showNearbyPOIs && nearbyPOIs.filter(poi => selectedPOIType === "all" || poi.type === selectedPOIType).length > 8 && (
                  <div className="bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-600 flex items-center">
                    +{nearbyPOIs.filter(poi => selectedPOIType === "all" || poi.type === selectedPOIType).length - 8} more
                  </div>
                )}
              </div>
              
              {/* Quick action hint */}
              <div className="text-xs text-gray-500 mt-2 text-center">
                Click any location to navigate • Use filters to refine results
              </div>
            </div>
          </div>

          {/* User Location Indicator */}
          {userLocation && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;