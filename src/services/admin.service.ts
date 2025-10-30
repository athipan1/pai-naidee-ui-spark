import { supabase } from './supabase.service';

// Service to fetch data for the admin dashboard

/**
 * Fetches system-wide metrics for the admin dashboard.
 * In a real application, this would be a single RPC call to a database function
 * for performance. For now, we'll make separate calls.
 */
export const getSystemMetrics = async () => {
  // 1. Get total attractions count
  const { count: totalAttractions, error: attractionsError } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true });

  if (attractionsError) {
    console.error('Error fetching attractions count:', attractionsError);
    // Continue fetching other metrics even if one fails
  }

  // In a real app, you would fetch active users, views, etc.
  // These are placeholders as the schema doesn't support them yet.
  const metrics = {
    totalAttractions: totalAttractions ?? 0,
    activeUsers: 1337, // Placeholder
    todayViews: 9876, // Placeholder
    serverLoad: 42, // Placeholder - this would come from infrastructure monitoring
    databaseStatus: 'connected', // Assume connected if this query succeeds
  };

  return metrics;
};

/**
 * Fetches all attractions for the admin management view.
 */
export const getAttractionsForAdmin = async () => {
  const { data, error } = await supabase
    .from('places')
    .select('id, name, status, created_at, cover_image_url')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching attractions for admin:', error);
    throw new Error(error.message);
  }

  return data;
};

/**
 * Updates the status of an attraction.
 * @param attractionId - The ID of the attraction to update.
 * @param status - The new status ('approved' or 'rejected').
 */
export const updateAttractionStatus = async (
  attractionId: number,
  status: 'approved' | 'rejected'
) => {
  const { data, error } = await supabase
    .from('places')
    .update({ status })
    .eq('id', attractionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating attraction status:', error);
    throw new Error(error.message);
  }

  return data;
};
