import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AttractionCard from "@/components/common/AttractionCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getThailandPlaceImage } from "@/shared/data/thailandPlaceImages";

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

interface CategoryPageProps {
  currentLanguage: "th" | "en";
}

const CategoryPage = ({ currentLanguage }: CategoryPageProps) => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Mock attraction data - in real app this would come from API
  const allAttractions = [
    {
      id: "1",
      name: "Phi Phi Islands",
      nameLocal: "หมู่เกาะพีพี",
      province: currentLanguage === "th" ? "กระบี่" : "Krabi",
      category: "Beach",
      rating: 4.8,
      reviewCount: 2547,
      image: getThailandPlaceImage("Phi Phi Islands"),
      description:
        currentLanguage === "th"
          ? "น้ำทะเลใสและหน้าผาหินปูนที่สวยงาม ทำให้ที่นี่เป็นสวรรค์สำหรับผู้ที่ชื่นชอบชายหาดและการดำน้ำดูปะการัง"
          : "Crystal clear waters and stunning limestone cliffs make this a paradise for beach lovers and snorkeling enthusiasts.",
      tags: ["Beach", "Snorkeling", "Island", "Photography"],
    },
    {
      id: "5",
      name: "Phuket Beach",
      nameLocal: "หาดภูเก็ต",
      province: currentLanguage === "th" ? "ภูเก็ต" : "Phuket",
      category: "Beach",
      rating: 4.6,
      reviewCount: 3421,
      image: getThailandPlaceImage("Phuket Beach"),
      description:
        currentLanguage === "th"
          ? "หาดทรายขาวและน้ำทะเลสีฟ้าใส พร้อมกิจกรรมทางน้ำมากมาย"
          : "White sandy beaches and crystal blue waters with plenty of water activities.",
      tags: ["Beach", "Water Sports", "Sunset", "Resort"],
    },
    {
      id: "2",
      name: "Wat Phra Kaew",
      nameLocal: "วัดพระแก้ว",
      province: currentLanguage === "th" ? "กรุงเทพฯ" : "Bangkok",
      category: "Culture",
      rating: 4.9,
      reviewCount: 5243,
      image: getThailandPlaceImage("Wat Phra Kaew"),
      description:
        currentLanguage === "th"
          ? "วัดที่ศักดิ์สิทธิ์ที่สุดในประเทศไทย เป็นที่ประดิษฐานของพระแก้วมรกต"
          : "The most sacred Buddhist temple in Thailand, home to the revered Emerald Buddha statue.",
      tags: ["Temple", "Culture", "Buddhism", "History"],
    },
    {
      id: "6",
      name: "Wat Arun",
      nameLocal: "วัดอรุณ",
      province: currentLanguage === "th" ? "กรุงเทพฯ" : "Bangkok",
      category: "Culture",
      rating: 4.7,
      reviewCount: 2876,
      image: getThailandPlaceImage("Wat Arun"),
      description:
        currentLanguage === "th"
          ? "วัดที่มีเจดีย์ประธานสูงตระหง่าน เป็นสัญลักษณ์ของกรุงเทพมหานคร"
          : "Temple with a towering central spire, an iconic symbol of Bangkok.",
      tags: ["Temple", "Architecture", "River View", "Sunset"],
    },
    {
      id: "3",
      name: "Doi Inthanon",
      nameLocal: "ดอยอินทนนท์",
      province: currentLanguage === "th" ? "เชียงใหม่" : "Chiang Mai",
      category: "Nature",
      rating: 4.7,
      reviewCount: 1876,
      image: getThailandPlaceImage("Doi Inthanon"),
      description:
        currentLanguage === "th"
          ? "ยอดเขาที่สูงที่สุดในประเทศไทย ชมวิวภูเขาที่งดงาม น้ำตก และอากาศเย็นสบาย"
          : "The highest peak in Thailand offering breathtaking mountain views, waterfalls, and cool weather.",
      tags: ["Mountain", "Nature", "Hiking", "Waterfalls"],
    },
    {
      id: "7",
      name: "Khao Yai National Park",
      nameLocal: "อุทยานแห่งชาติเขาใหญ่",
      province: currentLanguage === "th" ? "นครราชสีมา" : "Nakhon Ratchasima",
      category: "Nature",
      rating: 4.5,
      reviewCount: 2156,
      image: getThailandPlaceImage("Khao Yai National Park"),
      description:
        currentLanguage === "th"
          ? "อุทยานแห่งชาติที่มีสัตว์ป่าและธรรมชาติที่หลากหลาย พร้อมน้ำตกที่สวยงาม"
          : "National park with diverse wildlife and nature, featuring beautiful waterfalls.",
      tags: ["Wildlife", "Hiking", "Waterfalls", "Camping"],
    },
    {
      id: "4",
      name: "Floating Market",
      nameLocal: "ตลาดน้ำ",
      province: currentLanguage === "th" ? "กรุงเทพฯ" : "Bangkok",
      category: "Food",
      rating: 4.5,
      reviewCount: 3156,
      image: getThailandPlaceImage("Floating Market"),
      description:
        currentLanguage === "th"
          ? "สัมผัสวัฒนธรรมไทยแบบดั้งเดิม ขณะช้อปปิ้งผลไม้สดและอาหารพื้นเมืองจากเรือ"
          : "Experience traditional Thai culture while shopping for fresh fruits and local delicacies from boats.",
      tags: ["Food", "Culture", "Traditional", "Market"],
    },
    {
      id: "8",
      name: "Street Food Market",
      nameLocal: "ตลาดอาหารข้างถนน",
      province: currentLanguage === "th" ? "กรุงเทพฯ" : "Bangkok",
      category: "Food",
      rating: 4.3,
      reviewCount: 4287,
      image: getThailandPlaceImage("Street Food Market"),
      description:
        currentLanguage === "th"
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
      if (categoryName) {
        // Decode URL parameters (handle Thai characters)
        const decodedCategory = decodeURIComponent(categoryName);

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
  }, [categoryName, currentLanguage]);

  const handleFavoriteToggle = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const handleCardClick = (id: string) => {
    navigate(`/attraction/${id}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Get category display info
  const firstAttraction = attractions[0];
  const categoryInfo = firstAttraction
    ? getCategoryInfo(firstAttraction.category)
    : { emoji: "📍", th: categoryName || "", en: categoryName || "" };

  const displayName =
    currentLanguage === "th" ? categoryInfo.th : categoryInfo.en;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{categoryInfo.emoji}</span>
              <div>
                <h1 className="text-xl font-semibold">{displayName}</h1>
                <p className="text-sm text-muted-foreground">
                  {attractions.length}{" "}
                  {currentLanguage === "th" ? "สถานที่" : "places"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {attractions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {attractions.map((attraction) => (
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
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold mb-2">
              {currentLanguage === "th"
                ? "ไม่พบสถานที่ในหมวดนี้"
                : "No places found in this category"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {currentLanguage === "th"
                ? "ลองเลือกหมวดหมู่อื่นหรือกลับไปที่หน้าหลัก"
                : "Try selecting another category or go back to the home page"}
            </p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentLanguage === "th" ? "กลับ" : "Go Back"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
