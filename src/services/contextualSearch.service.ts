// Updated contextualSearch.service.ts

import { supabase } from '../supabaseClient';

// Function to search posts using Supabase
export const searchPosts = async (query) => {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .contains('tags', [query]);

    if (error) throw new Error(error.message);
    return data;
};

// Function to search locations using Supabase
export const searchLocations = async (query) => {
    const { data, error } = await supabase
        .from('locations')
        .select('*')
        .ilike('name', `%${query}%`);

    if (error) throw new Error(error.message);
    return data;
};

// Function to convert search results to post format
export const convertToPostSearchResult = (post) => {
    return {
        id: post.id,
        title: post.title,
        description: post.description, // Ensure this matches the Supabase schema
        // Include other fields as necessary
    };
};
