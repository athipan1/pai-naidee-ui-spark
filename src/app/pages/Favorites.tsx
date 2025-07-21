import { useState, useEffect } from 'react';
import { ArrowLeft, Grid, List, Heart, Bookmark, Tag, MapPin, Star, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AttractionCard from '@/components/common/AttractionCard';
import { useNavigate } from 'react-router-dom';

interface FavoriteItem {
  id: string;
  name: string;
  nameLocal?: string;
  province: string;
  category: string;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  tags: string[];
  dateAdded: string;
  type: 'attraction' | 'video';
}

interface FavoritesProps {
  currentLanguage: 'th' | 'en';
}

const Favorites = ({ currentLanguage }: FavoritesProps) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [savedItems, setSavedItems] = useState<FavoriteItem[]>([]);
  const [recommendations, setRecommendations] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('favorites');

  const content = {
    th: {
      title: 'รายการโปรดของฉัน',
      favorites: 'รายการโปรด',
      saved: 'บันทึกไว้',
      categories: 'หมวดหมู่',
      noFavorites: 'ยังไม่มีรายการโปรด',
      noSaved: 'ยังไม่มีรายการที่บันทึกไว้',
      noFavoritesDesc: 'เริ่มสำรวจและเพิ่มสถานที่ที่คุณชื่นชอบ',
      noSavedDesc: 'บันทึกสถานที่ที่น่าสนใจเพื่อดูภายหลัง',
      startExploring: 'เริ่มสำรวจ',
      recommendations: 'แนะนำให้คุณ',
      recommendationsDesc: 'สถานที่ที่คุณอาจจะชอบ',
      removeFromFavorites: 'ลบจากรายการโปรด',
      viewDetails: 'ดูรายละเอียด',
      addedOn: 'เพิ่มเมื่อ',
      items: 'รายการ',
      gridView: 'มุมมองตาราง',
      listView: 'มุมมองรายการ'
    },
    en: {
      title: 'My Favorites',
      favorites: 'Favorites',
      saved: 'Saved',
      categories: 'Categories',
      noFavorites: 'No favorites yet',
      noSaved: 'No saved items yet',
      noFavoritesDesc: 'Start exploring and add places you love',
      noSavedDesc: 'Save interesting places to view later',
      startExploring: 'Start Exploring',
      recommendations: 'Recommended for You',
      recommendationsDesc: 'Places you might like',
      removeFromFavorites: 'Remove from favorites',
      viewDetails: 'View Details',
      addedOn: 'Added on',
      items: 'items',
      gridView: 'Grid View',
      listView: 'List View'
    }
  };

  const t = content[currentLanguage];

  // Mock data - ในการใช้งานจริงจะดึงจาก API
  useEffect(() => {
    const mockFavorites: FavoriteItem[] = [
      {
        id: '1',
        name: 'Phi Phi Islands',
        nameLocal: 'หมู่เกาะพีพี',
        province: currentLanguage === 'th' ? 'กระบี่' : 'Krabi',
        category: 'Beach',
        rating: 4.8,
        reviewCount: 2547,
        image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800',
        description: currentLanguage === 'th' 
          ? 'น้ำทะเลใสและหน้าผาหินปูนที่สวยงาม'
          : 'Crystal clear waters and stunning limestone cliffs',
        tags: ['Beach', 'Snorkeling', 'Island'],
        dateAdded: '2024-01-15',
        type: 'attraction'
      },
      {
        id: '2',
        name: 'Wat Phra Kaew',
        nameLocal: 'วัดพระแก้ว',
        province: currentLanguage === 'th' ? 'กรุงเทพฯ' : 'Bangkok',
        category: 'Culture',
        rating: 4.9,
        reviewCount: 5243,
        image: 'https://images.pexels.com/photos/2614818/pexels-photo-2614818.jpeg?auto=compress&cs=tinysrgb&w=800',
        description: currentLanguage === 'th'
          ? 'วัดที่ศักดิ์สิทธิ์ที่สุดในประเทศไทย'
          : 'The most sacred Buddhist temple in Thailand',
        tags: ['Temple', 'Culture', 'Buddhism'],
        dateAdded: '2024-01-10',
        type: 'attraction'
      }
    ];

    const mockSaved: FavoriteItem[] = [
      {
        id: '3',
        name: 'Doi Inthanon',
        nameLocal: 'ดอยอินทนนท์',
        province: currentLanguage === 'th' ? 'เชียงใหม่' : 'Chiang Mai',
        category: 'Nature',
        rating: 4.7,
        reviewCount: 1876,
        image: 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg?auto=compress&cs=tinysrgb&w=800',
        description: currentLanguage === 'th'
          ? 'ยอดเขาที่สูงที่สุดในประเทศไทย'
          : 'The highest peak in Thailand',
        tags: ['Mountain', 'Nature', 'Hiking'],
        dateAdded: '2024-01-12',
        type: 'attraction'
      }
    ];

    const mockRecommendations: FavoriteItem[] = [
      {
        id: '4',
        name: 'Railay Beach',
        nameLocal: 'หาดไร่เลย์',
        province: currentLanguage === 'th' ? 'กระบี่' : 'Krabi',
        category: 'Beach',
        rating: 4.6,
        reviewCount: 1234,
        image: 'https://images.pexels.com/photos/1450361/pexels-photo-1450361.jpeg?auto=compress&cs=tinysrgb&w=800',
        description: currentLanguage === 'th'
          ? 'หาดที่สวยงามและเงียบสงบ'
          : 'Beautiful and peaceful beach',
        tags: ['Beach', 'Rock Climbing', 'Sunset'],
        dateAdded: '2024-01-01',
        type: 'attraction'
      },
      {
        id: '5',
        name: 'Grand Palace',
        nameLocal: 'พระบรมมหาราชวัง',
        province: currentLanguage === 'th' ? 'กรุงเทพฯ' : 'Bangkok',
        category: 'Culture',
        rating: 4.8,
        reviewCount: 3456,
        image: 'https://images.pexels.com/photos/2614819/pexels-photo-2614819.jpeg?auto=compress&cs=tinysrgb&w=800',
        description: currentLanguage === 'th'
          ? 'พระราชวังที่งดงามและมีประวัติศาสตร์'
          : 'Magnificent palace with rich history',
        tags: ['Palace', 'Culture', 'History'],
        dateAdded: '2024-01-01',
        type: 'attraction'
      }
    ];

    setTimeout(() => {
      setFavorites(mockFavorites);
      setSavedItems(mockSaved);
      setRecommendations(mockRecommendations);
      setLoading(false);
    }, 1000);
  }, [currentLanguage]);

  const handleRemoveFromFavorites = (id: string) => {
    if (activeTab === 'favorites') {
      setFavorites(prev => prev.filter(item => item.id !== id));
    } else {
      setSavedItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleViewDetails = (id: string) => {
    // Navigate to attraction detail page
    navigate(`/attraction/${id}`);
  };

  const handleStartExploring = () => {
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return currentLanguage === 'th' 
      ? date.toLocaleDateString('th-TH')
      : date.toLocaleDateString('en-US');
  };

  const renderEmptyState = (type: 'favorites' | 'saved') => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mb-6">
        {type === 'favorites' ? (
          <Heart className="w-12 h-12 text-muted-foreground" />
        ) : (
          <Bookmark className="w-12 h-12 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {type === 'favorites' ? t.noFavorites : t.noSaved}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {type === 'favorites' ? t.noFavoritesDesc : t.noSavedDesc}
      </p>
      <Button onClick={handleStartExploring} className="btn-primary">
        {t.startExploring}
      </Button>
    </div>
  );

  const renderItemCard = (item: FavoriteItem) => {
    if (viewMode === 'grid') {
      return (
        <div key={item.id} className="attraction-card group">
          <div className="relative overflow-hidden rounded-t-2xl">
            <img 
              src={item.image} 
              alt={item.name}
              className="hero-image transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute top-3 right-3 flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="heart-btn bg-white/90 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleRemoveFromFavorites(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg line-clamp-1">
                {currentLanguage === 'th' && item.nameLocal ? item.nameLocal : item.name}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{item.province}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-accent-yellow text-accent-yellow" />
                  <span className="text-sm font-medium">{item.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({item.reviewCount})
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t.addedOn} {formatDate(item.dateAdded)}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewDetails(item.id)}
                className="text-primary hover:text-primary/80"
              >
                <Eye className="w-4 h-4 mr-1" />
                {t.viewDetails}
              </Button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div key={item.id} className="flex items-center space-x-4 p-4 bg-card rounded-xl border border-border hover:shadow-md transition-all duration-300">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg line-clamp-1">
              {currentLanguage === 'th' && item.nameLocal ? item.nameLocal : item.name}
            </h3>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{item.province}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 fill-accent-yellow text-accent-yellow" />
                <span>{item.rating}</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
              {item.description}
            </p>
            
            <div className="text-xs text-muted-foreground mt-2">
              {t.addedOn} {formatDate(item.dateAdded)}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleViewDetails(item.id)}
              className="text-primary hover:text-primary/80"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveFromFavorites(item.id)}
              className="text-destructive hover:text-destructive/80"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">
              ❤️ {t.title}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              title={t.gridView}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              title={t.listView}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="favorites" className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>{t.favorites}</span>
              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">
                {favorites.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center space-x-2">
              <Bookmark className="w-4 h-4" />
              <span>{t.saved}</span>
              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">
                {savedItems.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="space-y-6">
            {favorites.length === 0 ? (
              renderEmptyState('favorites')
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
              }>
                {favorites.map(renderItemCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            {savedItems.length === 0 ? (
              renderEmptyState('saved')
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
              }>
                {savedItems.map(renderItemCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Recommendations Section */}
        {(favorites.length > 0 || savedItems.length > 0) && recommendations.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold flex items-center space-x-2">
                  <span>🧠</span>
                  <span>{t.recommendations}</span>
                </h2>
                <p className="text-muted-foreground mt-1">{t.recommendationsDesc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendations.map((item) => (
                <AttractionCard
                  key={item.id}
                  {...item}
                  currentLanguage={currentLanguage}
                  isFavorite={false}
                  onFavoriteToggle={() => {}}
                  onCardClick={handleViewDetails}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Favorites;