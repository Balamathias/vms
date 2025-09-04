import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export enum status {
  HTTP_200_SUCCESSFUL = 200,
  HTTP_201_CREATED = 201,
  HTTP_204_NO_CONTENT = 204,

  HTTP_400_BAD_REQUEST = 400,
  HTTP_401_UNAUTHORIZED = 401,
  HTTP_403_FORBIDDEN = 403,
  HTTP_404_NOT_FOUND = 404,
  HTTP_405_METHOD_NOT_ALLOWED = 405,
  HTTP_409_CONFLICT = 409,
  HTTP_422_UNPROCESSABLE_ENTITY = 422,

  HTTP_500_INTERNAL_SERVER_ERROR = 500,

  HTTP_205_RESET_CONTENT = 205,

  HTTP_429_TOO_MANY_REQUESTS = 429,

  HTTP_502_BAD_GATEWAY = 502,

  HTTP_503_SERVICE_UNAVAILABLE = 503,

  HTTP_504_GATEWAY_TIMEOUT = 504,

  HTTP_507_INSUFFICIENT_STORAGE = 507,

  HTTP_511_NETWORK_AUTHENTICATION_REQUIRED = 511,

  HTTP_520_UNKNOWN_ERROR = 520,
  HTTP_521_WEB_SERVER_IS_DOWN = 521,
  HTTP_522_CONNECTION_TIMED_OUT = 522,
  HTTP_523_ORIGIN_IS_UNREACHABLE = 523,
  HTTP_524_A_TIMEOUT_OCCURRED = 524,
  HTTP_525_SSL_HANDSHAKE_FAILED = 525,
  HTTP_526_INVALID_SSL_CERTIFICATE = 526,
  HTTP_527_RAILGUN_ERROR = 527,
  HTTP_530_ORIGIN_DNS_ERROR = 530,
  HTTP_598_NETWORK_READ_TIMEOUT_ERROR = 598,
  HTTP_599_NETWORK_CONNECT_TIMEOUT_ERROR = 599,

  HTTP_100_CONTINUE = 100,
  HTTP_101_SWITCHING_PROTOCOLS = 101,
  HTTP_102_PROCESSING = 102,
  HTTP_103_EARLY_HINTS = 103,
  HTTP_104_CHECKPOINT = 104,
}

/**
 * Adds a query parameter to an existing query string
 * @param qs Existing query string
 * @param params Parameters to add
 * @returns Updated query string URL
 */
export function addQueryParams(qs: string | undefined | null, params: Record<string, any>): string {
  const urlSearchParams = new URLSearchParams(qs || '');
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      urlSearchParams.delete(key);
    } else {
      urlSearchParams.set(key, String(value));
    }
  });
  
  return `?${urlSearchParams.toString()}`;
}

/**
 * Truncates a string to a specified length and adds ellipsis
 */
export function truncateString(str: string, length: number): string {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export const clipString = (text: string, by=50) => {
  if (text.length <= by) return text
  else return text.slice(0, by) + '...'
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')

  const ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12 || 12

  const formattedHours = String(hours).padStart(2, '0')

  return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const pastDate = new Date(dateString);

  const diffInSeconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

  const seconds = diffInSeconds;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return `${seconds}s.`;
  } else if (minutes < 60) {
    return `${minutes}m.`;
  } else if (hours < 24) {
    return `${hours}h.`;
  } else {
    return `${days}d.`;
  }
}

export function isImageOrVideo(url: string): 'image' | 'video' | 'unknown' {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];

  const lowercasedUrl = url.toLowerCase();

  if (imageExtensions.some(ext => lowercasedUrl.endsWith(ext))) {
    return 'image';
  } else if (videoExtensions.some(ext => lowercasedUrl.endsWith(ext))) {
    return 'video';
  }

  return 'unknown';
}

export const setToken = (token?: string | null, refreshToken?: string | null) => {
  if (token && refreshToken) {
    localStorage.setItem('token', token)
    localStorage.setItem('refreshToken', refreshToken)
  }
}

export const setCookies = (cookies: any, token?: string | null, refreshToken?: string | null) => {
  if (token && refreshToken) {
    cookies.set('token', token)
    cookies.set('refreshToken', refreshToken)
  }
}

export const getSemester = (semester: number | string) => {
  return semester == 1 ? 'First Semester' : 'Second Semester'
}

/**
 * Converts markdown formatted text to plain text
 */
export const convertMarkdownToPlainText = (markdown: string): string => {
  if (!markdown) return '';
  
  let plainText = markdown
    .replace(/#+\s+(.*)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/^\s*[\-\*]\s+(.*)/gm, '- $1')
    .replace(/^\s*\d+\.\s+(.*)/gm, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*>\s+(.*)/gm, '$1')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/!\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/^\s*[\-=_]{3,}\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
    
  return plainText;
};

const AIModelMap = {
  default: 'gemini-1.5-pro',
  advanced: 'gemini-2.0-flash',
  expert: 'gemini-2.5-flash-preview-04-17',
} as const;

type AIModelKey = keyof typeof AIModelMap;

export const AIModels = {
  ...AIModelMap,
  getModel: (model: AIModelKey) => AIModelMap[model] || AIModelMap.default,
  allModels: () => Object.keys(AIModelMap) as AIModelKey[],
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0, // Optional: remove decimals if not needed
        maximumFractionDigits: 0, // Optional: remove decimals if not needed
    }).format(amount);
};

export const PAGE_SIZE = 30; // Default page size for pagination
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100]; // Options for page size selection
