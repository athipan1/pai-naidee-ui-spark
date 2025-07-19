import { useState } from 'react';
import Header from '@/components/Header';
import SearchSection from '@/components/SearchSection';
import CategoryFilter from '@/components/CategoryFilter';
import AttractionCard from '@/components/AttractionCard';
import BottomNavigation from '@/components/BottomNavigation';
import templeImage from '@/assets/temple-culture.jpg';
import mountainImage from '@/assets/mountain-nature.jpg';
import floatingMarketImage from '@/assets/floating-market.jpg';
import heroBeachImage from '@/assets/hero-beach.jpg';

const Index = () => {
  const [currentLanguage, setCurrentLanguage] = useState<'th' | 'en'>('en');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('home');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Mock attraction data
  const attractions = [
    {
      id: '1',
      name: 'Phi Phi Islands',
      nameLocal: 'หมู่เกาะพีพี',
      province: 'Krabi',
      category: 'Beach',
      rating: 4.8,
      reviewCount: 2547,
      image: heroBeachImage,
      description: 'Crystal clear waters and stunning limestone cliffs make this a paradise for beach lovers and snorkeling enthusiasts.',
      tags: ['Beach', 'Snorkeling', 'Island', 'Photography']
    },
    {
      id: '2',
      name: 'Wat Phra Kaew',
      nameLocal: 'วัดพระแก้ว',
      province: 'Bangkok',
      category: 'Culture',
      rating: 4.9,
      reviewCount: 5243,
      image: templeImage,
      description: 'The most sacred Buddhist temple in Thailand, home to the revered Emerald Buddha statue.',
      tags: ['Temple', 'Culture', 'Buddhism', 'History']
    },
    {
      id: '3',
      name: 'Doi Inthanon',
      nameLocal: 'ดอยอินทนนท์',
      province: 'Chiang Mai',
      category: 'Nature',
      rating: 4.7,
      reviewCount: 1876,
      image: mountainImage,
      description: 'The highest peak in Thailand offering breathtaking mountain views, waterfalls, and cool weather.',
      tags: ['Mountain', 'Nature', 'Hiking', 'Waterfalls']
    },
    {
      id: '4',
      name: 'Floating Market',
      nameLocal: 'ตลาดน้ำ',
      province: 'Bangkok',
      category: 'Food',
      rating: 4.5,
      reviewCount: 3156,
      image: floatingMarketImage,
      description: 'Experience traditional Thai culture while shopping for fresh fruits and local delicacies from boats.',
      tags: ['Food', 'Culture', 'Traditional', 'Market']
    }
  ];

  const filteredAttractions = selectedCategory === 'all' 
    ? attractions 
    : attractions.filter(attraction => 
        attraction.category.toLowerCase() === selectedCategory.toLowerCase()
      );

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement search logic here
  };

  const handleFavoriteToggle = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const handleCardClick = (id: string) => {
    console.log('Viewing attraction:', id);
    // Navigate to attraction details page
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />
      
      <SearchSection 
        currentLanguage={currentLanguage}
        onSearch={handleSearch}
      />
      
      <CategoryFilter 
        currentLanguage={currentLanguage}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Attractions Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              {currentLanguage === 'th' ? 'สถานที่แนะนำ' : 'Recommended Places'}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredAttractions.length} {currentLanguage === 'th' ? 'สถานที่' : 'places'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAttractions.map((attraction) => (
              <AttractionCard
                key={attraction.id}
                {...attraction}
                currentLanguage={currentLanguage}
                isFavorite={favorites.includes(attraction.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onCardClick={handleCardClick}
              />
            ))}
          </div>

          {filteredAttractions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {currentLanguage === 'th' 
                  ? 'ไม่พบสถานที่ในหมวดหมู่นี้' 
                  : 'No places found in this category'
                }
              </p>
            </div>
          )}
        </div>
      </section>

      <BottomNavigation 
        currentLanguage={currentLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default Index;
