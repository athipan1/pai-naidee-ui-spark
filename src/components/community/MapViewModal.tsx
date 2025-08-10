import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  DollarSign, 
  Star,
  Route,
  X,
  ExternalLink 
} from 'lucide-react';
import { TravelRoute, LocationTag } from '@/shared/types/community';
import { cn } from '@/shared/lib/utils';

interface MapViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  route?: TravelRoute;
  location?: LocationTag;
  title: string;
  className?: string;
}

export const MapViewModal: React.FC<MapViewModalProps> = ({
  isOpen,
  onClose,
  route,
  location,
  title,
  className
}) => {
  const [selectedWaypoint, setSelectedWaypoint] = useState<LocationTag | null>(null);

  // For demo purposes, we'll show a mock map. In production, this would integrate with Google Maps or similar
  const mockMapUrl = route || location 
    ? `https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800&h=600&q=80` 
    : null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'ง่าย';
      case 'medium': return 'ปานกลาง';
      case 'hard': return 'ยาก';
      default: return 'ไม่ระบุ';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-4xl max-h-[90vh] overflow-hidden", className)}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Route className="h-5 w-5 text-primary" />
              <span>{title}</span>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Route Information */}
          {route && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">ระยะเวลา</div>
                  <div className="text-sm font-medium">{route.duration}</div>
                </div>
              </div>

              {route.budget && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">งบประมาณ</div>
                    <div className="text-sm font-medium">{route.budget}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">ระดับความยาก</div>
                  <Badge 
                    className={cn(
                      "text-white text-xs",
                      getDifficultyColor(route.difficulty)
                    )}
                  >
                    {getDifficultyLabel(route.difficulty)}
                  </Badge>
                </div>
              </div>
            </motion.div>
          )}

          {/* Map Container */}
          <div className="relative h-96 bg-muted rounded-lg overflow-hidden">
            {mockMapUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full relative"
              >
                <img 
                  src={mockMapUrl} 
                  alt="Travel Route Map"
                  className="w-full h-full object-cover"
                />
                
                {/* Map Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Mock Location Pins */}
                {route?.waypoints && route.waypoints.map((waypoint, index) => (
                  <motion.div
                    key={waypoint.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.2 }}
                    className="absolute"
                    style={{
                      left: `${20 + index * 15}%`,
                      top: `${30 + index * 10}%`
                    }}
                  >
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0 shadow-lg"
                      onClick={() => setSelectedWaypoint(waypoint)}
                    >
                      {index + 1}
                    </Button>
                  </motion.div>
                ))}

                {/* Single location pin */}
                {location && !route && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="bg-primary text-white p-2 rounded-full shadow-lg">
                      <MapPin className="h-6 w-6" />
                    </div>
                  </motion.div>
                )}

                {/* Open in Maps button */}
                <div className="absolute bottom-4 right-4">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="shadow-lg"
                    onClick={() => {
                      // In production, this would open Google Maps with the actual coordinates
                      console.log('Opening in maps...');
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    เปิดใน Maps
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">ไม่พบข้อมูลแผนที่</p>
                </div>
              </div>
            )}
          </div>

          {/* Route Details */}
          {route && (
            <div className="space-y-4">
              {/* Route Summary */}
              <div>
                <h3 className="font-medium mb-2">เส้นทางการเดินทาง</h3>
                <p className="text-sm text-muted-foreground">{route.summary}</p>
              </div>

              {/* Waypoints */}
              {route.waypoints && route.waypoints.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">จุดหมายปลายทาง</h3>
                  <div className="space-y-2">
                    {route.waypoints.map((waypoint, index) => (
                      <motion.div
                        key={waypoint.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                          selectedWaypoint?.id === waypoint.id 
                            ? "bg-primary/10 border-primary" 
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedWaypoint(
                          selectedWaypoint?.id === waypoint.id ? null : waypoint
                        )}
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{waypoint.name}</div>
                          <div className="text-xs text-muted-foreground">{waypoint.province}</div>
                        </div>
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights */}
              {route.highlights && route.highlights.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">ไhighlight ของทริป</h3>
                  <div className="flex flex-wrap gap-2">
                    {route.highlights.map((highlight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Badge variant="outline" className="text-xs">
                          {highlight}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Single Location Details */}
          {location && !route && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">{location.name}</div>
                  <div className="text-sm text-muted-foreground">{location.province}</div>
                  {location.coordinates && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapViewModal;