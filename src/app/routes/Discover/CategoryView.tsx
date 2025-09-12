import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AttractionCard from "@/components/common/AttractionCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import templeImage from "@/shared/assets/temple-culture.jpg";
import mountainImage from "@/shared/assets/mountain-nature.jpg";
import floatingMarketImage from "@/shared/assets/floating-market.jpg";
import heroBeachImage from "@/shared/assets/hero-beach.jpg";
import { useLanguage } from "@/shared/contexts/LanguageProvider";

interface Attraction {
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
}

interface CategoryViewProps {
  category: string;
}

const CategoryView = ({ category }: CategoryViewProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Mock attraction data - in real app this would come from API
  const allAttractions = [
    {
      id: "1",
      name: "Phi Phi Islands",
      nameLocal: "หมู่เกาะพีพี",
      province: language === "th" ? "กระบี่" : "Krabi",
      category: "Beach",
      rating: 4.8,
      reviewCount: 2547,
      image: heroBeachImage,
      description:
        language === "th"
          ? "น้ำทะเลใสและหน้าผาหินปูนที่สวยงาม ทำให้ที่นี่เป็นสวรรค์สำหรับผู้ที่ชื่นชอบชายหาดและการดำน้ำดูปะการัง"
          : "Crystal clear waters and stunning limestone cliffs make this a paradise for beach lovers and snorkeling enthusiasts.",
      tags: ["Beach", "Snorkeling", "Island", "Photography"],
    },
    {
      id: "5",
      name: "Phuket Beach",
      nameLocal: "หาดภูเก็ต",
      province: language === "th" ? "ภูเก็ต" : "Phuket",
      category: "Beach",
      rating: 4.6,
      reviewCount: 3421,
      image: heroBeachImage,
      description:
        language === "th"
          ? "หาดทรายขาวและน้ำทะเลสีฟ้าใส พร้อมกิจกรรมทางน้ำมากมาย"
          : "White sandy beaches and crystal blue waters with plenty of water activities.",
      tags: ["Beach", "Water Sports", "Sunset", "Resort"],
    },
    {
      id: "2",
      name: "Wat Phra Kaew",
      nameLocal: "วัดพระแก้ว",
      province: language === "th" ? "กรุงเทพฯ" : "Bangkok",
      category: "Culture",
      rating: 4.9,
      reviewCount: 5243,
      image: templeImage,
      description:
        language === "th"
          ? "วัดที่ศักดิ์สิทธิ์ที่สุดในประเทศไทย เป็นที่ประดิษฐานของพระแก้วมรกต"
          : "The most sacred Buddhist temple in Thailand, home to the revered Emerald Buddha statue.",
      tags: ["Temple", "Culture", "Buddhism", "History"],
    },
    {
      id: "6",
      name: "Wat Arun",
      nameLocal: "วัดอรุณ",
      province: language === "th" ? "กรุงเทพฯ" : "Bangkok",
      category: "Culture",
      rating: 4.7,
      reviewCount: 2876,
      image: templeImage,
      description:
        language === "th"
          ? "วัดที่มีเจดีย์ประธานสูงตระหง่าน เป็นสัญลักษณ์ของกรุงเทพมหานคร"
          : "Temple with a towering central spire, an iconic symbol of Bangkok.",
      tags: ["Temple", "Architecture", "River View", "Sunset"],
    },
    {
      id: "3",
      name: "Doi Inthanon",
      nameLocal: "ดอยอินทนนท์",
      province: language === "th" ? "เชียงใหม่" : "Chiang Mai",
      category: "Nature",
      rating: 4.7,
      reviewCount: 1876,
      image: mountainImage,
      description:
        language === "th"
          ? "ยอดเขาที่สูงที่สุดในประเทศไทย ชมวิวภูเขาที่งดงาม น้ำตก และอากาศเย็นสบาย"
          : "The highest peak in Thailand offering breathtaking mountain views, waterfalls, and cool weather.",
      tags: ["Mountain", "Nature", "Hiking", "Waterfalls"],
    },
    {
      id: "7",
      name: "Khao Yai National Park",
      nameLocal: "อุทยานแห่งชาติเขาใหญ่",
      province: language === "th" ? "นครราชสีมา" : "Nakhon Ratchasima",
      category: "Nature",
      rating: 4.5,
      reviewCount: 2156,
      image: mountainImage,
      description:
        language === "th"
          ? "อุทยานแห่งชาติที่มีสัตว์ป่าและธรรมชาติที่หลากหลาย พร้อมน้ำตกที่สวยงาม"
          : "National park with diverse wildlife and nature, featuring beautiful waterfalls.",
      tags: ["Wildlife", "Hiking", "Waterfalls", "Camping"],
    },
    {
      id: "4",
      name: "Floating Market",
      nameLocal: "ตลาดน้ำ",
      province: language === "th" ? "กรุงเทพฯ" : "Bangkok",
      category: "Food",
      rating: 4.5,
      reviewCount: 3156,
      image: floatingMarketImage,
      description:
        language === "th"
          ? "สัมผัสวัฒนธรรมไทยแบบดั้งเดิม ขณะช้อปปิ้งผลไม้สดและอาหารพื้นเมืองจากเรือ"
          : "Experience traditional Thai culture while shopping for fresh fruits and local delicacies from boats.",
      tags: ["Food", "Culture", "Traditional", "Market"],
    },
    {
      id: "8",
      name: "Street Food Market",
      nameLocal: "ตลาดอาหารข้างถนน",
      province: language === "th" ? "กรุงเทพฯ" : "Bangkok",
      category: "Food",
      rating: 4.3,
      reviewCount: 4287,
      image: floatingMarketImage,
      description:
        language === "th"
          ? "ลิ้มรสอาหารไทยแท้ๆ จากร้านอาหารข้างถนน ราคาประหยัดและรสชาติเข้มข้น"
          : "Taste authentic Thai food from street vendors with affordable prices and intense flavors.",
      tags: ["Street Food", "Local Cuisine", "Night Market", "Budget"],
    },
  ];

  // Get category emoji and Thai/English names
  const getCategoryInfo = (category: string) => {
    const categoryMap: Record<
      string,
      { emoji: string; th: string; en: string }
    > = {
      Beach: { emoji: "🏖️", th: "ชายหาด", en: "Beach" },
      Culture: { emoji: "🛕", th: "วัฒนธรรม", en: "Culture" },
      Nature: { emoji: "⛰️", th: "ธรรมชาติ", en: "Nature" },
      Food: { emoji: "🍜", th: "อาหาร", en: "Food" },
    };
    return categoryMap[category] || { emoji: "📍", th: category, en: category };
  };

  useEffect(() => {
    // Simulate API call
    setLoading(true);

    setTimeout(() => {
      if (category) {
        // Decode URL parameters (handle Thai characters)
        const decodedCategory = decodeURIComponent(category);

        // Filter attractions by category (support both Thai and English names)
        const filtered = allAttractions.filter((attraction) => {
          const categoryInfo = getCategoryInfo(attraction.category);
          return (
            attraction.category.toLowerCase() ===
              decodedCategory.toLowerCase() ||
            categoryInfo.th === decodedCategory ||
            categoryInfo.en.toLowerCase() === decodedCategory.toLowerCase()
          );
        });

        setAttractions(filtered);
      }
      setLoading(false);
    }, 500);
  }, [category, language]);

  const handleFavoriteToggle = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const handleCardClick = (id: string) => {
    navigate(`/attraction/${id}`);
  };

  if (loading) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Get category display info
  const firstAttraction = attractions[0];
  const categoryInfo = firstAttraction
    ? getCategoryInfo(firstAttraction.category)
    : { emoji: "📍", th: category || "", en: category || "" };

  const displayName =
    language === "th" ? categoryInfo.th : categoryInfo.en;

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-card/50 backdrop-blur-sm mb-6">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{categoryInfo.emoji}</span>
            <div>
              <h2 className="text-xl font-semibold">{displayName}</h2>
              <p className="text-sm text-muted-foreground">
                {attractions.length}{" "}
                {language === "th" ? "สถานที่" : "places"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {attractions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {attractions.map((attraction) => (
              <AttractionCard
                key={attraction.id}
                {...attraction}
                isFavorite={favorites.includes(attraction.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">
              {language === "th"
                ? "ไม่พบสถานที่ในหมวดนี้"
                : "No places found in this category"}
            </h3>
            <p className="text-muted-foreground">
              {language === "th"
                ? "ลองเลือกหมวดหมู่อื่นหรือกลับไปที่หน้าหลัก"
                : "Try selecting another category or go back to the home page"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryView;