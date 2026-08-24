// Mirrors src/*/entities/*.ts and the enums declared alongside them in the
// NestJS backend, so the frontend's shapes never drift from the API.

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

export enum SubscriptionType {
  FREE = 'free',
  PREMIUM = 'premium',
}

export enum VideoQuality {
  P240 = '240p',
  P360 = '360p',
  P480 = '480p',
  P720 = '720p',
  P1080 = '1080p',
  P4K = '4K',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
  PENDING_PAYMENT = 'pending_payment',
}

export enum PaymentMethod {
  CARD = 'card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  CRYPTO = 'crypto',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  profile?: Profile;
}

// Decoded JWT payload — login only returns raw tokens, so the id/role the
// AuthGuard trusts come from decoding the access token client-side.
export interface AccessTokenPayload {
  id: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface MovieFile {
  id: string;
  file_url: string;
  quality: VideoQuality;
  language: string;
}

export interface MovieListItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  release_year: number;
  duration_minutes: number;
  poster_url: string | null;
  // Postgres numeric/decimal columns come back from TypeORM as strings, not
  // numbers — coerce with Number(...) at render time (see StarRating).
  rating: number | string;
  subscription_type: SubscriptionType;
  view_count: number;
  created_at: string;
}

export interface MovieDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  release_year: number;
  duration_minutes: number;
  poster_url: string | null;
  rating: number | string;
  subscription_type: SubscriptionType;
  view_count: number;
  categories: string[];
  // Locked when the movie is premium and the viewer has no active plan.
  files: MovieFile[] | { message: string };
  reviews: {
    average_rating: number;
    count: number;
    // Suggested addition to GET /movies/:slug — the full list, so the
    // detail page can show everyone's reviews, not just the viewer's own.
    // Optional here so the frontend degrades gracefully until the backend
    // ships it.
    items?: Review[];
  };
}

export interface AdminMovieListItem {
  id: string;
  title: string;
  slug: string;
  release_year: number;
  subscription_type: SubscriptionType;
  view_count: number;
  review_count: number;
  created_at: string;
  created_by: string | null;
}

export interface Review {
  id: string;
  user: { id: string; username: string };
  movie_id?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface FavouriteMovie {
  id: string;
  title: string;
  slug: string;
  poster_url: string | null;
  release_year: number;
  rating: number | string;
  subscription_type: SubscriptionType;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  // Postgres decimal column — comes back from TypeORM as a string. Use
  // formatPrice() from @/lib/format to render it.
  price: number | string;
  duration_days: number;
  features: string[] | null;
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user?: User;
  plan: SubscriptionPlan;
  start_date: string | null;
  end_date: string | null;
  status: SubscriptionStatus;
  auto_renew: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  user_subscription: UserSubscription | string;
  // Postgres decimal column — comes back from TypeORM as a string.
  amount: number | string;
  payment_method: PaymentMethod;
  payment_details: Record<string, unknown> | null;
  status: PaymentStatus;
  external_transaction_id: string | null;
  created_at: string;
}

export interface Paginated<T> {
  movies: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}
