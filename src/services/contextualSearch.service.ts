import { supabase } from "@/supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";
import { Location, PostSearchResult } from "@/shared/types/posts";

interface SearchOptions {
  language: "th" | "en";
  limit?: number;
}

interface SearchResponse {
  results: PostSearchResult[];
  expandedTerms: string[];
  processingTime: number;
}

// Helper to convert DB place to Location type
const convertToLocation = (place: any): Location => ({
  id: place.id,
  name: place.name,
  nameLocal: place.name_local,
  province: place.province,
  category: place.category,
  description: place.description,
  descriptionLocal: place.description, // Fallback using English description
  tags: place.tags || [],
  amenities: place.amenities || [],
  imageUrl: place.image_url,
});

// Helper to convert DB post to PostSearchResult type
const convertToPostSearchResult = (post: any): PostSearchResult => {
  const location = post.places ? convertToLocation(post.places) : undefined;

  return {
    id: post.id,
    type: post.type,
    title: post.title,
    content: post.content,
    imageUrl: post.image_url,
    createdAt: post.created_at,
    likeCount: post.like_count,
    commentCount: post.comment_count,
    user: {
      id: post.profiles.id,
      username: post.profiles.username,
      avatarUrl: post.profiles.avatar_url,
    },
    location,
  };
};

export const searchPosts = async (
  query: string,
  options: SearchOptions
): Promise<SearchResponse> => {
  const startTime = Date.now();
  const { language, limit = 10 } = options;
  const queryLower = query.toLowerCase();

  // Expanded search terms (mock for now)
  const expandedTerms = [queryLower];

  let queryBuilder = supabase
    .from("posts")
    .select(
      `
      id, type, title, content, image_url, created_at, like_count, comment_count,
      profiles ( id, username, avatar_url ),
      places ( id, name, name_local, province, category, description, tags, amenities, image_url )
    `
    )
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,places.name.ilike.%${query}%,places.tags.cs.["${queryLower}"]`)
    .limit(limit);

  const { data, error } = await queryBuilder;

  if (error) {
    console.error("Supabase searchPosts error:", error);
    throw new Error((error as PostgrestError).message);
  }

  const results = data.map(convertToPostSearchResult);
  const endTime = Date.now();

  return {
    results,
    expandedTerms,
    processingTime: endTime - startTime,
  };
};

export const searchLocations = async (
  query: string,
  limit: number = 10
): Promise<Location[]> => {
  const { data, error } = await supabase
    .from("places")
    .select('id, name, name_local, province, category, description, tags')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.["${query.toLowerCase()}"]`)
    .limit(limit);

  if (error) {
    console.error("Supabase searchLocations error:", error);
    throw new Error((error as PostgrestError).message);
  }

  return data.map(place => ({
    id: place.id,
    name: place.name,
    nameLocal: place.name_local,
    province: place.province,
    category: place.category,
    description: place.description,
    descriptionLocal: place.name_local, // Using name_local as a fallback
    tags: place.tags || [],
    amenities: [], // Not fetched in this query
    imageUrl: '', // Not fetched in this query
  }));
};