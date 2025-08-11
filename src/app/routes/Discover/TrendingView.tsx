import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Fire, Star, MapPin } from "lucide-react";
import AttractionCard from "@/components/common/AttractionCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import templeImage from "@/shared/assets/temple-culture.jpg";
import mountainImage from "@/shared/assets/mountain-nature.jpg";
import floatingMarketImage from "@/shared/assets/floating-market.jpg";
import heroBeachImage from "@/shared/assets/hero-beach.jpg";

interface TrendingAttraction {
  id: string;
  name: string;
  nameLocal: string;
  province: string;
  category: string;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  tags: string[];
  trendingScore: number;
  recentViews: number;
  weeklyGrowth: number;
}

interface TrendingViewProps {
  currentLanguage: "th" | "en";
}

const TrendingView = ({ currentLanguage }: TrendingViewProps) => {
  const navigate = useNavigate();
  const [attractions, setAttractions] = useState<TrendingAttraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  const content = {
    th: {
      title: "ยอดนิยม",
      subtitle: "สถานที่ท่องเที่ยวที่กำลังมาแรง",
      trendingNow: "กำลังมาแรงตอนนี้",
      viewsThisWeek: "ผู้ชมสัปดาห์นี้",
      growth: "เติบโต",
      noTrending: "ยังไม่มีข้อมูลยอดนิยม",
      loadingTrending: "กำลังโหลดข้อมูลยอดนิยม...",
      categories: {
        Beach: "ชายหาด",
        Culture: "วัฒนธรรม", 
        Nature: "ธรรมชาติ",
        Food: "อาหาร"
      }
    },
    en: {
      title: "Trending",
      subtitle: "Popular destinations that are trending now",
      trendingNow: "Trending Now",
      viewsThisWeek: "Views this week",
      growth: "growth",
      noTrending: "No trending data available",
      loadingTrending: "Loading trending data...",
      categories: {
        Beach: "Beach",
        Culture: "Culture",
        Nature: "Nature", 
        Food: "Food"
      }
    },
  };

  const t = content[currentLanguage];

  // Mock trending attractions data
  useEffect(() => {
    setLoading(true);

    const mockTrendingAttractions: TrendingAttraction[] = [
      {
        id: "1",
        name: "Phi Phi Islands",
        nameLocal: "หมู่เกาะพีพี",
        province: currentLanguage === "th" ? "กระบี่" : "Krabi",
        category: "Beach",
        rating: 4.8,
        reviewCount: 2547,
        image: heroBeachImage,
        description:
          currentLanguage === "th"
            ? "น้ำทะเลใสและหน้าผาหินปูนที่สวยงาม ทำให้ที่นี่เป็นสวรรค์สำหรับผู้ที่ชื่นชอบชายหาดและการดำน้ำดูปะการัง"
            : "Crystal clear waters and stunning limestone cliffs make this a paradise for beach lovers and snorkeling enthusiasts.",
        tags: ["Beach", "Snorkeling", "Island", "Photography"],
        trendingScore: 95,
        recentViews: 45230,
        weeklyGrowth: 23
      },
      {
        id: "2",
        name: "Wat Phra Kaew",
        nameLocal: "วัดพระแก้ว",
        province: currentLanguage === "th" ? "กรุงเทพฯ" : "Bangkok",
        category: "Culture",
        rating: 4.9,
        reviewCount: 5243,
        image: templeImage,
        description:
          currentLanguage === "th"
            ? "วัดที่ศักดิ์สิทธิ์ที่สุดในประเทศไทย เป็นที่ประดิษฐานของพระแก้วมรกต"
            : "The most sacred Buddhist temple in Thailand, home to the revered Emerald Buddha statue.",
        tags: ["Temple", "Culture", "Buddhism", "History"],
        trendingScore: 89,
        recentViews: 38750,
        weeklyGrowth: 18
      },
      {
        id: "3",
        name: "Doi Inthanon",
        nameLocal: "ดอยอินทนนท์",
        province: currentLanguage === "th" ? "เชียงใหม่" : "Chiang Mai",
        category: "Nature",
        rating: 4.7,
        reviewCount: 1876,
        image: mountainImage,
        description:
          currentLanguage === "th"
            ? "ยอดเขาที่สูงที่สุดในประเทศไทย ชมวิวภูเขาที่งดงาม น้ำตก และอากาศเย็นสบาย"
            : "The highest peak in Thailand offering breathtaking mountain views, waterfalls, and cool weather.",
        tags: ["Mountain", "Nature", "Hiking", "Waterfalls"],
        trendingScore: 82,
        recentViews: 29100,
        weeklyGrowth: 31
      },
      {
        id: "4",
        name: "Floating Market",
        nameLocal: "ตลาดน้ำ",
        province: currentLanguage === "th" ? "กรุงเทพฯ" : "Bangkok",
        category: "Food",
        rating: 4.5,
        reviewCount: 3156,
        image: floatingMarketImage,
        description:
          currentLanguage === "th"
            ? "สัมผัสวัฒนธรรมไทยแบบดั้งเดิม ขณะช้อปปิ้งผลไม้สดและอาหารพื้นเมืองจากเรือ"
            : "Experience traditional Thai culture while shopping for fresh fruits and local delicacies from boats.",
        tags: ["Food", "Culture", "Traditional", "Market"],
        trendingScore: 76,
        recentViews: 22890,
        weeklyGrowth: 15
      },
    ];

    setTimeout(() => {
      // Sort by trending score
      const sortedAttractions = mockTrendingAttractions.sort((a, b) => b.trendingScore - a.trendingScore);
      setAttractions(sortedAttractions);
      setLoading(false);
    }, 1000);
  }, [currentLanguage]);

  const handleFavoriteToggle = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const handleCardClick = (id: string) => {
    navigate(`/attraction/${id}`);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (loading) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">{t.loadingTrending}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-card/50 backdrop-blur-sm mb-6">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <Fire className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                {t.title}
                <TrendingUp className="w-5 h-5 text-red-500" />
              </h2>
              <p className="text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {attractions.length > 0 ? (
          <div className="space-y-6">
            {/* Top Trending */}
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Fire className="w-5 h-5 text-red-500" />
                {t.trendingNow}
              </h3>
              
              <div className="space-y-4">
                {attractions.slice(0, 3).map((attraction, index) => (
                  <div
                    key={attraction.id}
                    className="bg-card rounded-xl border border-border/50 p-4 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      {/* Ranking */}
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">#{index + 1}</span>
                      </div>

                      {/* Image */}
                      <img
                        src={attraction.image}
                        alt={attraction.name}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg line-clamp-1">
                          {currentLanguage === "th" && attraction.nameLocal
                            ? attraction.nameLocal
                            : attraction.name}
                        </h4>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{attraction.province}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-accent-yellow text-accent-yellow" />
                            <span>{attraction.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                            <span className="text-green-600">+{attraction.weeklyGrowth}% {t.growth}</span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                          {attraction.description}
                        </p>

                        {/* Trending Stats */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-xs text-muted-foreground">
                            {formatNumber(attraction.recentViews)} {t.viewsThisWeek}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-accent/20 rounded-full">
                              {t.categories[attraction.category as keyof typeof t.categories] || attraction.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleCardClick(attraction.id)}
                          className="w-8 h-8 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors"
                        >
                          <TrendingUp className="w-4 h-4 text-primary" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* All Trending */}
            {attractions.length > 3 && (
              <section>
                <h3 className="text-lg font-semibold mb-4">
                  {currentLanguage === "th" ? "ยอดนิยมทั้งหมด" : "All Trending"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {attractions.slice(3).map((attraction) => (
                    <div key={attraction.id} className="relative">
                      <AttractionCard
                        {...attraction}
                        currentLanguage={currentLanguage}
                        isFavorite={favorites.includes(attraction.id)}
                        onFavoriteToggle={handleFavoriteToggle}
                        onCardClick={handleCardClick}
                      />
                      {/* Trending Badge */}
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Fire className="w-3 h-3" />
                        <span>+{attraction.weeklyGrowth}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {t.noTrending}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingView;