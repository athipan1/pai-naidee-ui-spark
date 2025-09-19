/**
 * Data validation utilities
 * Shared between frontend and backend
 */

/**
 * Email validation regex pattern
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Thai phone number regex pattern
 * Supports: +66xxxxxxxxx, 06xxxxxxxx, 08xxxxxxxx, 09xxxxxxxx
 */
const THAI_PHONE_REGEX = /^(\+66|0)[6-9][0-9]{8}$/;

/**
 * Username regex pattern
 * Alphanumeric, underscore, dot, dash, 3-30 characters
 */
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;

/**
 * Strong password regex pattern
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * URL validation regex pattern
 */
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

/**
 * Validate email address
 * @param email - Email to validate
 * @returns True if email is valid
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validate Thai phone number
 * @param phone - Phone number to validate
 * @returns True if phone number is valid
 */
export function validateThaiPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  const cleanPhone = phone.replace(/[\s-]/g, '');
  return THAI_PHONE_REGEX.test(cleanPhone);
}

/**
 * Validate username
 * @param username - Username to validate
 * @returns True if username is valid
 */
export function validateUsername(username: string): boolean {
  if (!username || typeof username !== 'string') {
    return false;
  }
  return USERNAME_REGEX.test(username.trim());
}

/**
 * Validate strong password
 * @param password - Password to validate
 * @returns True if password meets strength requirements
 */
export function validateStrongPassword(password: string): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }
  return STRONG_PASSWORD_REGEX.test(password);
}

/**
 * Validate URL
 * @param url - URL to validate
 * @returns True if URL is valid
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  return URL_REGEX.test(url.trim());
}

/**
 * Validate coordinates
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns True if coordinates are valid
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    !isNaN(lat) && !isNaN(lng)
  );
}

/**
 * Validate Thai text (contains Thai characters)
 * @param text - Text to validate
 * @returns True if text contains Thai characters
 */
export function validateThaiText(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  const thaiRegex = /[\u0E00-\u0E7F]/;
  return thaiRegex.test(text);
}

/**
 * Validate image file type
 * @param mimeType - MIME type to validate
 * @returns True if it's a valid image type
 */
export function validateImageType(mimeType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];
  return validTypes.includes(mimeType.toLowerCase());
}

/**
 * Validate video file type
 * @param mimeType - MIME type to validate
 * @returns True if it's a valid video type
 */
export function validateVideoType(mimeType: string): boolean {
  const validTypes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm'
  ];
  return validTypes.includes(mimeType.toLowerCase());
}

/**
 * Validate file size
 * @param size - File size in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @returns True if file size is within limit
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return typeof size === 'number' && size > 0 && size <= maxSize;
}

/**
 * Validate rating value
 * @param rating - Rating to validate (1-5)
 * @returns True if rating is valid
 */
export function validateRating(rating: number): boolean {
  return typeof rating === 'number' && rating >= 1 && rating <= 5;
}

/**
 * Validate pagination parameters
 * @param page - Page number
 * @param limit - Items per page
 * @returns True if pagination params are valid
 */
export function validatePagination(page: number, limit: number): boolean {
  return (
    typeof page === 'number' && page >= 1 &&
    typeof limit === 'number' && limit >= 1 && limit <= 100
  );
}

/**
 * Sanitize text input (remove HTML tags and trim)
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim(); // Remove leading/trailing whitespace
}

/**
 * Sanitize username (lowercase, remove special chars except allowed ones)
 * @param username - Username to sanitize
 * @returns Sanitized username
 */
export function sanitizeUsername(username: string): string {
  if (!username || typeof username !== 'string') {
    return '';
  }
  
  return username
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .trim();
}

/**
 * Validate and sanitize hashtag
 * @param hashtag - Hashtag to validate and sanitize
 * @returns Sanitized hashtag or null if invalid
 */
export function validateAndSanitizeHashtag(hashtag: string): string | null {
  if (!hashtag || typeof hashtag !== 'string') {
    return null;
  }
  
  let cleaned = hashtag.trim();
  
  // Remove # if it exists at the beginning
  if (cleaned.startsWith('#')) {
    cleaned = cleaned.substring(1);
  }
  
  // Remove special characters except underscore
  cleaned = cleaned.replace(/[^a-zA-Z0-9_\u0E00-\u0E7F]/g, '');
  
  // Check if it's not empty and not too long
  if (cleaned.length === 0 || cleaned.length > 50) {
    return null;
  }
  
  return cleaned;
}

/**
 * Check if text contains inappropriate content (basic check)
 * @param text - Text to check
 * @returns True if text contains inappropriate content
 */
export function containsInappropriateContent(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  // Basic inappropriate words list (extend as needed)
  const inappropriateWords = [
    'spam', 'scam', 'fake', 'phishing'
    // Add more words as needed
  ];
  
  const lowerText = text.toLowerCase();
  return inappropriateWords.some(word => lowerText.includes(word));
}