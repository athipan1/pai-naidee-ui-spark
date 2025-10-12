import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { searchPlaces } from "@/services/supabase.service";
import { supabase } from "@/services/supabase.service";
import { useAuth } from "@/shared/contexts/AuthContext";
import PlaceCard from "@/components/discover/PlaceCard";
import SectionHeader from "@/components/discover/SectionHeader";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { Fragment, useEffect, useState } from "react";

interface FeedViewProps {
  currentLanguage: "th" | "en";
}

const FeedView = ({ currentLanguage }: FeedViewProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [favorites, setFavorites] = useState<string[]>([]);

  const fetchPlaces = async ({ pageParam = 1 }) => {
    const { results, totalCount } = await searchPlaces("", [], [], 10, pageParam);
    return { results, nextPage: pageParam + 1, totalCount };
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["places"],
    queryFn: fetchPlaces,
    getNextPageParam: (lastPage) => {
      const morePagesExist = lastPage.results.length === 10;
      return morePagesExist ? lastPage.nextPage : undefined;
    },
    initialPageParam: 1,
  });

  // Fetch user's favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('favorites')
        .select('place_id')
        .eq('user_id', user.id);
      if (data) {
        setFavorites(data.map(fav => fav.place_id));
      }
    };
    fetchFavorites();
  }, [user]);

  const addFavoriteMutation = useMutation({
    mutationFn: async (placeId: string) => {
      if (!user) throw new Error("User not logged in");
      return supabase.from('favorites').insert({ user_id: user.id, place_id: placeId });
    },
    onSuccess: (_, placeId) => {
      setFavorites(prev => [...prev, placeId]);
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast({ title: "Added to favorites!" });
    },
    onError: (err: any) => {
      toast({ title: "Error adding favorite", description: err.message, variant: "destructive" });
    }
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (placeId: string) => {
      if (!user) throw new Error("User not logged in");
      return supabase.from('favorites').delete().match({ user_id: user.id, place_id: placeId });
    },
    onSuccess: (_, placeId) => {
      setFavorites(prev => prev.filter(id => id !== placeId));
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast({ title: "Removed from favorites" });
    },
    onError: (err: any) => {
      toast({ title: "Error removing favorite", description: err.message, variant: "destructive" });
    }
  });

  const handleFavoriteToggle = (placeId: string) => {
    if (!user) {
      toast({ title: "Please log in to add favorites", variant: "destructive" });
      return;
    }
    if (favorites.includes(placeId)) {
      removeFavoriteMutation.mutate(placeId);
    } else {
      addFavoriteMutation.mutate(placeId);
    }
  };


  const content = {
    th: {
      allDestinations: "สถานที่ทั้งหมด",
      noPlaces: "ไม่พบสถานที่ท่องเที่ยว",
      loading: "กำลังโหลด...",
      loadMore: "โหลดเพิ่มเติม",
      noMorePlaces: "ไม่มีสถานที่เพิ่มเติมแล้ว",
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูล"
    },
    en: {
      allDestinations: "All Destinations",
      noPlaces: "No places found",
      loading: "Loading...",
      loadMore: "Load More",
      noMorePlaces: "No more places to load",
      error: "An error occurred while fetching data"
    },
  };
  const t = content[currentLanguage];

  if (isLoading) {
    return <LoadingSpinner text={t.loading} />;
  }

  if (isError) {
    return <div className="text-center p-8 text-destructive">{t.error}: {error.message}</div>;
  }

  const allPlaces = data?.pages.flatMap(page => page.results) ?? [];

  return (
    <div className="h-full bg-background overflow-y-auto">
      <div className="p-6 space-y-8">
        <section>
          <SectionHeader
            title={t.allDestinations}
            icon={MapPin}
            currentLanguage={currentLanguage}
          />
          
          {allPlaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.pages.map((page, i) => (
                <Fragment key={i}>
                  {page.results.map((place) => (
                    <PlaceCard
                      key={place.id}
                      id={place.id}
                      name={place.name}
                      nameLocal={place.nameLocal}
                      province={place.province}
                      category={place.category}
                      rating={place.rating}
                      reviewCount={place.reviewCount}
                      image={place.image}
                      description={place.description}
                      tags={place.tags || []}
                      currentLanguage={currentLanguage}
                      isFavorite={favorites.includes(place.id)}
                      onFavoriteToggle={() => handleFavoriteToggle(place.id)}
                      onCardClick={(id) => navigate(`/attraction/${id}`)}
                    />
                  ))}
                </Fragment>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {t.noPlaces}
              </h3>
            </div>
          )}

          <div className="flex justify-center mt-8">
            <Button
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage
                ? t.loading
                : hasNextPage
                ? t.loadMore
                : t.noMorePlaces}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FeedView;