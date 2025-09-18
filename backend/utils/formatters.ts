/**
 * Data formatting utilities
 * Shared between frontend and backend
 */

/**
 * Format a number with commas as thousands separators
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }
  return num.toLocaleString();
}

/**
 * Format a large number with abbreviated units (K, M, B)
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted number string with units
 */
export function formatCompactNumber(num: number, decimals: number = 1): string {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }

  if (num < 1000) {
    return num.toString();
  }

  const units = ['', 'K', 'M', 'B', 'T'];
  const unitIndex = Math.floor(Math.log10(Math.abs(num)) / 3);
  const unitValue = Math.pow(10, unitIndex * 3);
  const formattedNumber = (num / unitValue).toFixed(decimals);

  return `${formattedNumber}${units[unitIndex]}`;
}

/**
 * Format currency with Thai Baht
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'THB')
 * @param locale - Locale for formatting (default: 'th-TH')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number, 
  currency: string = 'THB', 
  locale: string = 'th-TH'
): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '฿0';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported locales/currencies
    return `฿${formatNumber(amount)}`;
  }
}

/**
 * Format distance with appropriate units
 * @param distanceKm - Distance in kilometers
 * @param language - Language for units ('en' | 'th')
 * @returns Formatted distance string
 */
export function formatDistance(distanceKm: number, language: 'en' | 'th' = 'en'): string {
  if (typeof distanceKm !== 'number' || isNaN(distanceKm) || distanceKm < 0) {
    return language === 'th' ? '0 กม.' : '0 km';
  }

  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return language === 'th' ? `${meters} ม.` : `${meters} m`;
  }

  const rounded = Math.round(distanceKm * 10) / 10;
  return language === 'th' ? `${rounded} กม.` : `${rounded} km`;
}

/**
 * Format duration from seconds to human readable format
 * @param seconds - Duration in seconds
 * @param language - Language for labels ('en' | 'th')
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number, language: 'en' | 'th' = 'en'): string {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return language === 'th' ? '0 วินาที' : '0 seconds';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (language === 'th') {
    if (hours > 0) {
      return `${hours} ชั่วโมง ${minutes} นาที`;
    } else if (minutes > 0) {
      return `${minutes} นาที`;
    } else {
      return `${remainingSeconds} วินาที`;
    }
  } else {
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${remainingSeconds}s`;
    }
  }
}

/**
 * Format video duration for display (MM:SS or HH:MM:SS)
 * @param seconds - Duration in seconds
 * @returns Formatted time string
 */
export function formatVideoDuration(seconds: number): string {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Format file size in human readable format
 * @param bytes - File size in bytes
 * @param language - Language for units ('en' | 'th')
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number, language: 'en' | 'th' = 'en'): string {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) {
    return language === 'th' ? '0 ไบต์' : '0 bytes';
  }

  const units = language === 'th' 
    ? ['ไบต์', 'KB', 'MB', 'GB', 'TB']
    : ['bytes', 'KB', 'MB', 'GB', 'TB'];

  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  const formatted = unitIndex === 0 ? size.toString() : size.toFixed(1);
  return `${formatted} ${units[unitIndex]}`;
}

/**
 * Format rating as stars and number
 * @param rating - Rating value (1-5)
 * @param showNumber - Whether to show the number alongside stars
 * @returns Formatted rating string
 */
export function formatRating(rating: number, showNumber: boolean = true): string {
  if (typeof rating !== 'number' || isNaN(rating) || rating < 0 || rating > 5) {
    return showNumber ? '★★★★★ (0.0)' : '★★★★★';
  }

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) {
    stars += '☆'; // Half star (or you could use a different character)
  }
  stars += '☆'.repeat(emptyStars);

  if (showNumber) {
    return `${stars} (${rating.toFixed(1)})`;
  }
  return stars;
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param date - Date to format
 * @param language - Language for labels ('en' | 'th')
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string, language: 'en' | 'th' = 'en'): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(targetDate.getTime())) {
    return language === 'th' ? 'วันที่ไม่ถูกต้อง' : 'Invalid date';
  }

  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 0) {
    return language === 'th' ? 'ในอนาคต' : 'In the future';
  }

  const timeUnits = language === 'th' ? {
    year: ['ปี', 'ปี'],
    month: ['เดือน', 'เดือน'],
    week: ['สัปดาห์', 'สัปดาห์'],
    day: ['วัน', 'วัน'],
    hour: ['ชั่วโมง', 'ชั่วโมง'],
    minute: ['นาที', 'นาที'],
    second: ['วินาที', 'วินาที']
  } : {
    year: ['year', 'years'],
    month: ['month', 'months'],
    week: ['week', 'weeks'],
    day: ['day', 'days'],
    hour: ['hour', 'hours'],
    minute: ['minute', 'minutes'],
    second: ['second', 'seconds']
  };

  const intervals = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      const unitKey = interval.unit as keyof typeof timeUnits;
      const unitLabel = count === 1 ? timeUnits[unitKey][0] : timeUnits[unitKey][1];
      return language === 'th' ? `${count} ${unitLabel}ที่แล้ว` : `${count} ${unitLabel} ago`;
    }
  }

  return language === 'th' ? 'เมื่อสักครู่' : 'Just now';
}

/**
 * Format date to localized string
 * @param date - Date to format
 * @param language - Language for formatting ('en' | 'th')
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  language: 'en' | 'th' = 'en',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(targetDate.getTime())) {
    return language === 'th' ? 'วันที่ไม่ถูกต้อง' : 'Invalid date';
  }

  const locale = language === 'th' ? 'th-TH' : 'en-US';
  
  try {
    return new Intl.DateTimeFormat(locale, options).format(targetDate);
  } catch (error) {
    // Fallback formatting
    return targetDate.toLocaleDateString();
  }
}

/**
 * Format phone number for display
 * @param phone - Phone number to format
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle Thai phone numbers
  if (cleaned.startsWith('66') && cleaned.length === 11) {
    // +66 format
    return `+66 ${cleaned.slice(2, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // 0x-xxxx-xxxx format
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return as-is if format is not recognized
  return phone;
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text string
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Format hashtags for display
 * @param hashtags - Array of hashtag strings
 * @param maxDisplay - Maximum number of hashtags to display
 * @returns Formatted hashtags string
 */
export function formatHashtags(hashtags: string[], maxDisplay: number = 3): string {
  if (!Array.isArray(hashtags) || hashtags.length === 0) {
    return '';
  }

  const displayed = hashtags.slice(0, maxDisplay).map(tag => `#${tag}`);
  const remaining = hashtags.length - maxDisplay;

  if (remaining > 0) {
    displayed.push(`+${remaining} more`);
  }

  return displayed.join(' ');
}