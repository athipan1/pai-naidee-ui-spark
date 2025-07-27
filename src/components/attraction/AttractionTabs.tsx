import React, { useState } from 'react';
import { Info, Map, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
}

interface AttractionTabsProps {
  attraction: AttractionDetail;
  currentLanguage: "th" | "en";
}

const AttractionTabs = ({ attraction, currentLanguage }: AttractionTabsProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const content = {
    tabs: {
      overview: { th: "ภาพรวม", en: "Overview" },
      location: { th: "ตำแหน่งที่ตั้ง", en: "Location" },
      reviews: { th: "รีวิว", en: "Reviews" }
    },
    description: { th: "รายละเอียด", en: "Description" },
    noDescription: { th: "ไม่มีรายละเอียด", en: "No description available" }
  };

  return (
    <div className="mt-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">{content.tabs.overview[currentLanguage]}</span>
          </TabsTrigger>
          
          <TabsTrigger value="location" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">{content.tabs.location[currentLanguage]}</span>
          </TabsTrigger>
          
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">{content.tabs.reviews[currentLanguage]}</span>
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
              {attraction.reviewCount}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-semibold mb-4">
              {content.description[currentLanguage]}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {attraction.description || content.noDescription[currentLanguage]}
            </p>
            
            {/* Tags */}
            {attraction.tags && attraction.tags.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium mb-3">
                  {currentLanguage === 'th' ? 'หมวดหมู่' : 'Categories'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {attraction.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="location" className="mt-6">
          <div className="bg-muted/30 p-8 rounded-lg text-center">
            <Map className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {currentLanguage === 'th' ? 'แผนที่และการเดินทาง' : 'Map & Directions'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {currentLanguage === 'th' 
                ? 'ดูตำแหน่งที่ตั้งและเส้นทางการเดินทาง'
                : 'View location and get directions'
              }
            </p>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="bg-muted/30 p-8 rounded-lg text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {currentLanguage === 'th' ? 'รีวิวและความคิดเห็น' : 'Reviews & Comments'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {currentLanguage === 'th' 
                ? `รีวิวจากผู้เข้าชม ${attraction.reviewCount} รายการ`
                : `${attraction.reviewCount} reviews from visitors`
              }
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttractionTabs;