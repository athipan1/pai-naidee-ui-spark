/**
 * Community, posts, and social features types
 * Shared between frontend and backend
 */

/**
 * Media item in posts
 */
export interface PostMedia {
  /** Media ID */
  id: string;
  /** Media type */
  type: 'image' | 'video';
  /** Media URL */
  url: string;
  /** Thumbnail URL (for videos) */
  thumbnailUrl?: string;
  /** Alt text */
  alt?: string;
  /** Media dimensions */
  dimensions?: {
    width: number;
    height: number;
  };
  /** Video duration in seconds */
  duration?: number;
  /** File size in bytes */
  size?: number;
  /** Upload timestamp */
  uploadedAt: string;
}

/**
 * Location information in posts
 */
export interface PostLocation {
  /** Location ID (if it's a known attraction) */
  id?: string;
  /** Location name */
  name: string;
  /** Name in local language */
  nameLocal?: string;
  /** Province */
  province: string;
  /** Coordinates */
  coordinates?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
}

/**
 * Post engagement metrics
 */
export interface PostEngagement {
  /** Number of likes */
  likes: number;
  /** Number of comments */
  comments: number;
  /** Number of shares */
  shares: number;
  /** Number of saves */
  saves: number;
  /** Number of views */
  views: number;
}

/**
 * Community post
 */
export interface Post {
  /** Unique post identifier */
  id: string;
  /** Author information */
  author: {
    id: string;
    username: string;
    displayName?: string;
    avatar?: string;
    isVerified?: boolean;
  };
  /** Post content */
  content: {
    /** Caption text */
    caption: string;
    /** Hashtags */
    hashtags: string[];
    /** Mentioned users */
    mentions: string[];
    /** Post language */
    language?: 'en' | 'th' | 'auto';
  };
  /** Media attachments */
  media: PostMedia[];
  /** Location information */
  location?: PostLocation;
  /** Engagement metrics */
  engagement: PostEngagement;
  /** Post visibility */
  visibility: 'public' | 'private' | 'friends' | 'unlisted';
  /** Whether comments are allowed */
  commentsEnabled: boolean;
  /** Post status */
  status: 'draft' | 'published' | 'archived' | 'deleted';
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Publishing timestamp (may differ from createdAt) */
  publishedAt?: string;
  /** Whether the current user has liked this post */
  isLikedByUser?: boolean;
  /** Whether the current user has saved this post */
  isSavedByUser?: boolean;
  /** Embedding vector for semantic search */
  embeddingVector?: number[];
}

/**
 * Post creation data
 */
export interface CreatePostData {
  /** Caption text */
  caption: string;
  /** Media IDs (from previous uploads) */
  mediaIds: string[];
  /** Location ID or custom location */
  location?: string | {
    name: string;
    nameLocal?: string;
    province: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  /** Post visibility */
  visibility?: 'public' | 'private' | 'friends' | 'unlisted';
  /** Whether comments are enabled */
  commentsEnabled?: boolean;
  /** Whether to publish immediately */
  publishNow?: boolean;
  /** Scheduled publishing time */
  scheduledAt?: string;
}

/**
 * Post update data
 */
export interface UpdatePostData {
  /** Updated caption */
  caption?: string;
  /** Updated location */
  location?: string | {
    name: string;
    nameLocal?: string;
    province: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  /** Updated visibility */
  visibility?: 'public' | 'private' | 'friends' | 'unlisted';
  /** Updated comments setting */
  commentsEnabled?: boolean;
}

/**
 * Comment on a post
 */
export interface Comment {
  /** Comment ID */
  id: string;
  /** Post ID this comment belongs to */
  postId: string;
  /** Parent comment ID (for replies) */
  parentId?: string;
  /** Comment author */
  author: {
    id: string;
    username: string;
    displayName?: string;
    avatar?: string;
    isVerified?: boolean;
  };
  /** Comment content */
  content: string;
  /** Comment language */
  language?: 'en' | 'th' | 'auto';
  /** Number of likes on this comment */
  likes: number;
  /** Number of replies to this comment */
  replies: number;
  /** Whether the current user has liked this comment */
  isLikedByUser?: boolean;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Comment status */
  status: 'published' | 'hidden' | 'deleted';
}

/**
 * Create comment data
 */
export interface CreateCommentData {
  /** Comment content */
  content: string;
  /** Parent comment ID (for replies) */
  parentId?: string;
}

/**
 * Video content (for explore feed)
 */
export interface Video {
  /** Video ID */
  id: string;
  /** Video creator */
  creator: {
    id: string;
    username: string;
    displayName?: string;
    avatar?: string;
    isVerified?: boolean;
  };
  /** Video content */
  content: {
    /** Video title */
    title?: string;
    /** Video description */
    description: string;
    /** Hashtags */
    hashtags: string[];
    /** Video language */
    language?: 'en' | 'th' | 'auto';
  };
  /** Video file information */
  video: {
    /** Video URL */
    url: string;
    /** Thumbnail URL */
    thumbnailUrl: string;
    /** Duration in seconds */
    duration: number;
    /** Video dimensions */
    dimensions: {
      width: number;
      height: number;
    };
    /** File size in bytes */
    size: number;
  };
  /** Location information */
  location?: PostLocation;
  /** Engagement metrics */
  engagement: PostEngagement;
  /** Video status */
  status: 'processing' | 'published' | 'archived' | 'deleted';
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Publishing timestamp */
  publishedAt?: string;
  /** Whether the current user has liked this video */
  isLikedByUser?: boolean;
  /** Whether the current user has saved this video */
  isSavedByUser?: boolean;
}

/**
 * User interaction with content
 */
export interface UserInteraction {
  /** Interaction ID */
  id: string;
  /** User ID */
  userId: string;
  /** Target content ID */
  contentId: string;
  /** Content type */
  contentType: 'post' | 'video' | 'comment';
  /** Interaction type */
  type: 'like' | 'save' | 'share' | 'view' | 'comment';
  /** Interaction timestamp */
  createdAt: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Content feed item
 */
export interface FeedItem {
  /** Item ID */
  id: string;
  /** Content type */
  type: 'post' | 'video';
  /** Content data */
  content: Post | Video;
  /** Reason this item is in the feed */
  reason: 'following' | 'trending' | 'recommended' | 'location' | 'hashtag';
  /** Feed ranking score */
  score: number;
  /** Timestamp when added to feed */
  addedToFeedAt: string;
}

/**
 * Search result for posts/videos
 */
export interface ContentSearchResult {
  /** Result content */
  content: Post | Video;
  /** Search relevance score */
  relevanceScore: number;
  /** Matched terms */
  matchedTerms: string[];
  /** Highlighted text */
  highlights: {
    caption?: string;
    description?: string;
    hashtags?: string[];
  };
}