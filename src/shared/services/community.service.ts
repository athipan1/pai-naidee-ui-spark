import { supabase } from '@/services/supabase.service';
import { Post, Comment, CreatePostData } from '../types/community';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

const getFeed = async (): Promise<Post[]> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles (
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    return data as Post[];
  } catch (error) {
    throw new Error(`Failed to fetch feed: ${getErrorMessage(error)}`);
  }
};

const createPost = async (postData: CreatePostData): Promise<Post> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data as Post;
  } catch (error) {
    throw new Error(`Failed to create post: ${getErrorMessage(error)}`);
  }
};

const likePost = async (postId: string, userId: string): Promise<{ success: boolean }> => {
    try {
        const { error } = await supabase
            .from('likes')
            .insert({ post_id: postId, user_id: userId });

        if (error) {
            // Handle unique constraint violation (already liked)
            if (error.code === '23505') {
                await supabase
                    .from('likes')
                    .delete()
                    .match({ post_id: postId, user_id: userId });
                return { success: true };
            }
            throw new Error(error.message);
        }
        return { success: true };
    } catch (error) {
        throw new Error(`Failed to like post: ${getErrorMessage(error)}`);
    }
};


const getComments = async (postId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles (
          username,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return data as Comment[];
  } catch (error) {
    throw new Error(`Failed to fetch comments: ${getErrorMessage(error)}`);
  }
};

const addComment = async (postId: string, content: string, userId: string): Promise<Comment> => {
    try {
        const { data, error } = await supabase
            .from('comments')
            .insert({ post_id: postId, content, user_id: userId })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }
        return data as Comment;
    } catch (error) {
        throw new Error(`Failed to add comment: ${getErrorMessage(error)}`);
    }
};

export const communityService = {
  getFeed,
  createPost,
  likePost,
  getComments,
  addComment,
};