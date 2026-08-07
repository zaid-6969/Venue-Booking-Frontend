/**
 * Application-wide constants
 * Single source of truth for all constant values
 */

export const APP_NAME = 'VenueHub';
export const APP_TAGLINE = 'Find Your Perfect Event Venue';
export const APP_VERSION = '1.0.0';

// API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
export const API_TIMEOUT = 15000; // 15 seconds

// Pagination
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 48];

// Auth
export const ACCESS_TOKEN_KEY = 'vm_access_token';
export const REFRESH_TOKEN_KEY = 'vm_refresh_token';
export const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry

// Roles
export const ROLES = {
  GUEST: 'guest',
  CUSTOMER: 'customer',
  OWNER: 'owner',
  ADMIN: 'admin',
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  REJECTED:  'rejected',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING:   'pending',
  SUCCESS:   'success',
  FAILED:    'failed',
  REFUNDED:  'refunded',
};

// Payment Methods (mock)
export const PAYMENT_METHODS = {
  CARD:   'card',
  UPI:    'upi',
  NETBANKING: 'netbanking',
  WALLET: 'wallet',
};

// Venue Categories
export const VENUE_CATEGORIES = [
  { id: 'banquet-hall',      label: 'Banquet Hall',       icon: 'Building2' },
  { id: 'marriage-hall',     label: 'Marriage Hall',       icon: 'Heart' },
  { id: 'convention-center', label: 'Convention Center',   icon: 'Landmark' },
  { id: 'resort',            label: 'Resort',              icon: 'TreePine' },
  { id: 'party-hall',        label: 'Party Hall',          icon: 'PartyPopper' },
  { id: 'lawn',              label: 'Lawn & Outdoor',      icon: 'Leaf' },
  { id: 'corporate',         label: 'Corporate Venue',     icon: 'Briefcase' },
  { id: 'rooftop',           label: 'Rooftop',             icon: 'Sun' },
  { id: 'farmhouse',         label: 'Farmhouse',           icon: 'Home' },
  { id: 'hotel-ballroom',    label: 'Hotel Ballroom',      icon: 'Crown' },
];

// Popular Cities
export const POPULAR_CITIES = [
  { id: 'mumbai',    name: 'Mumbai',    state: 'Maharashtra', image: null },
  { id: 'delhi',     name: 'Delhi',     state: 'Delhi',       image: null },
  { id: 'bangalore', name: 'Bangalore', state: 'Karnataka',   image: null },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana',   image: null },
  { id: 'chennai',   name: 'Chennai',   state: 'Tamil Nadu',  image: null },
  { id: 'kolkata',   name: 'Kolkata',   state: 'West Bengal', image: null },
  { id: 'pune',      name: 'Pune',      state: 'Maharashtra', image: null },
  { id: 'jaipur',    name: 'Jaipur',    state: 'Rajasthan',   image: null },
];

// Amenities
export const AMENITIES = [
  { id: 'parking',      label: 'Parking',         icon: 'ParkingCircle' },
  { id: 'ac',           label: 'Air Conditioning', icon: 'Wind' },
  { id: 'catering',     label: 'Catering',         icon: 'UtensilsCrossed' },
  { id: 'decoration',   label: 'Decoration',       icon: 'Sparkles' },
  { id: 'music',        label: 'Music System',     icon: 'Music' },
  { id: 'projector',    label: 'Projector',        icon: 'Monitor' },
  { id: 'wifi',         label: 'WiFi',             icon: 'Wifi' },
  { id: 'dj',           label: 'DJ Setup',         icon: 'Radio' },
  { id: 'valet',        label: 'Valet Service',    icon: 'Car' },
  { id: 'security',     label: 'Security',         icon: 'Shield' },
  { id: 'lift',         label: 'Elevator',         icon: 'ArrowUpDown' },
  { id: 'backup-power', label: 'Power Backup',     icon: 'Zap' },
  { id: 'cctv',         label: 'CCTV',             icon: 'Camera' },
  { id: 'bar',          label: 'Bar Service',      icon: 'Wine' },
  { id: 'stage',        label: 'Stage',            icon: 'Mic2' },
  { id: 'green-room',   label: 'Green Room',       icon: 'Sofa' },
];

// Sort Options
export const SORT_OPTIONS = [
  { value: 'relevance',     label: 'Relevance' },
  { value: 'price_asc',     label: 'Price: Low to High' },
  { value: 'price_desc',    label: 'Price: High to Low' },
  { value: 'rating_desc',   label: 'Highest Rated' },
  { value: 'capacity_asc',  label: 'Capacity: Low to High' },
  { value: 'capacity_desc', label: 'Capacity: High to Low' },
  { value: 'newest',        label: 'Newest First' },
];

// Compare
export const MAX_COMPARE_VENUES = 3;

// Wishlist
export const WISHLIST_STORAGE_KEY = 'vm_wishlist';

// Theme
export const THEME_STORAGE_KEY = 'vm_theme';
export const THEMES = { LIGHT: 'light', DARK: 'dark' };

// Date Formats
export const DATE_FORMAT = 'DD MMM YYYY';
export const DATE_TIME_FORMAT = 'DD MMM YYYY, hh:mm A';
export const API_DATE_FORMAT = 'YYYY-MM-DD';

// File Upload
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE_MB = 5;
export const MAX_GALLERY_IMAGES = 20;

// Review
export const MIN_REVIEW_LENGTH = 20;
export const MAX_REVIEW_LENGTH = 1000;
export const MAX_RATING = 5;

// Notification Types
export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED:  'booking_confirmed',
  BOOKING_CANCELLED:  'booking_cancelled',
  PAYMENT_SUCCESS:    'payment_success',
  PAYMENT_FAILED:     'payment_failed',
  REVIEW_RECEIVED:    'review_received',
  VENUE_APPROVED:     'venue_approved',
  NEW_BOOKING:        'new_booking',
};
