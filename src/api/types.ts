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
  country: string | null;
  created_at: string;
}

// Mirrors backend's src/utils/Custom Types/countries-type.ts (Countries enum).
export enum Country {
  Afghanistan = 'Afghanistan',
  Albania = 'Albania',
  Algeria = 'Algeria',
  Andorra = 'Andorra',
  Angola = 'Angola',
  AntiguaAndBarbuda = 'Antigua and Barbuda',
  Argentina = 'Argentina',
  Armenia = 'Armenia',
  Australia = 'Australia',
  Austria = 'Austria',
  Azerbaijan = 'Azerbaijan',
  Bahamas = 'Bahamas',
  Bahrain = 'Bahrain',
  Bangladesh = 'Bangladesh',
  Barbados = 'Barbados',
  Belarus = 'Belarus',
  Belgium = 'Belgium',
  Belize = 'Belize',
  Benin = 'Benin',
  Bhutan = 'Bhutan',
  Bolivia = 'Bolivia',
  BosniaAndHerzegovina = 'Bosnia and Herzegovina',
  Botswana = 'Botswana',
  Brazil = 'Brazil',
  Brunei = 'Brunei',
  Bulgaria = 'Bulgaria',
  BurkinaFaso = 'Burkina Faso',
  Burundi = 'Burundi',
  CaboVerde = 'Cabo Verde',
  Cambodia = 'Cambodia',
  Cameroon = 'Cameroon',
  Canada = 'Canada',
  CentralAfricanRepublic = 'Central African Republic',
  Chad = 'Chad',
  Chile = 'Chile',
  China = 'China',
  Colombia = 'Colombia',
  Comoros = 'Comoros',
  Congo = 'Congo',
  CostaRica = 'Costa Rica',
  Croatia = 'Croatia',
  Cuba = 'Cuba',
  Cyprus = 'Cyprus',
  Czechia = 'Czechia',
  Denmark = 'Denmark',
  Djibouti = 'Djibouti',
  Dominica = 'Dominica',
  DominicanRepublic = 'Dominican Republic',
  Ecuador = 'Ecuador',
  Egypt = 'Egypt',
  ElSalvador = 'El Salvador',
  EquatorialGuinea = 'Equatorial Guinea',
  Eritrea = 'Eritrea',
  Estonia = 'Estonia',
  Eswatini = 'Eswatini',
  Ethiopia = 'Ethiopia',
  Fiji = 'Fiji',
  Finland = 'Finland',
  France = 'France',
  Gabon = 'Gabon',
  Gambia = 'Gambia',
  Georgia = 'Georgia',
  Germany = 'Germany',
  Ghana = 'Ghana',
  Greece = 'Greece',
  Grenada = 'Grenada',
  Guatemala = 'Guatemala',
  Guinea = 'Guinea',
  GuineaBissau = 'Guinea-Bissau',
  Guyana = 'Guyana',
  Haiti = 'Haiti',
  Honduras = 'Honduras',
  Hungary = 'Hungary',
  Iceland = 'Iceland',
  India = 'India',
  Indonesia = 'Indonesia',
  Iran = 'Iran',
  Iraq = 'Iraq',
  Ireland = 'Ireland',
  Israel = 'Israel',
  Italy = 'Italy',
  Jamaica = 'Jamaica',
  Japan = 'Japan',
  Jordan = 'Jordan',
  Kazakhstan = 'Kazakhstan',
  Kenya = 'Kenya',
  Kiribati = 'Kiribati',
  Kuwait = 'Kuwait',
  Kyrgyzstan = 'Kyrgyzstan',
  Laos = 'Laos',
  Latvia = 'Latvia',
  Lebanon = 'Lebanon',
  Lesotho = 'Lesotho',
  Liberia = 'Liberia',
  Libya = 'Libya',
  Liechtenstein = 'Liechtenstein',
  Lithuania = 'Lithuania',
  Luxembourg = 'Luxembourg',
  Madagascar = 'Madagascar',
  Malawi = 'Malawi',
  Malaysia = 'Malaysia',
  Maldives = 'Maldives',
  Mali = 'Mali',
  Malta = 'Malta',
  MarshallIslands = 'Marshall Islands',
  Mauritania = 'Mauritania',
  Mauritius = 'Mauritius',
  Mexico = 'Mexico',
  Micronesia = 'Micronesia',
  Moldova = 'Moldova',
  Monaco = 'Monaco',
  Mongolia = 'Mongolia',
  Montenegro = 'Montenegro',
  Morocco = 'Morocco',
  Mozambique = 'Mozambique',
  Myanmar = 'Myanmar',
  Namibia = 'Namibia',
  Nauru = 'Nauru',
  Nepal = 'Nepal',
  Netherlands = 'Netherlands',
  NewZealand = 'New Zealand',
  Nicaragua = 'Nicaragua',
  Niger = 'Niger',
  Nigeria = 'Nigeria',
  NorthKorea = 'North Korea',
  NorthMacedonia = 'North Macedonia',
  Norway = 'Norway',
  Oman = 'Oman',
  Pakistan = 'Pakistan',
  Palau = 'Palau',
  Palestine = 'Palestine',
  Panama = 'Panama',
  PapuaNewGuinea = 'Papua New Guinea',
  Paraguay = 'Paraguay',
  Peru = 'Peru',
  Philippines = 'Philippines',
  Poland = 'Poland',
  Portugal = 'Portugal',
  Qatar = 'Qatar',
  Romania = 'Romania',
  Russia = 'Russia',
  Rwanda = 'Rwanda',
  SaintKittsAndNevis = 'Saint Kitts and Nevis',
  SaintLucia = 'Saint Lucia',
  SaintVincentAndTheGrenadines = 'Saint Vincent and the Grenadines',
  Samoa = 'Samoa',
  SanMarino = 'San Marino',
  SaoTomeAndPrincipe = 'Sao Tome and Principe',
  SaudiArabia = 'Saudi Arabia',
  Senegal = 'Senegal',
  Serbia = 'Serbia',
  Seychelles = 'Seychelles',
  SierraLeone = 'Sierra Leone',
  Singapore = 'Singapore',
  Slovakia = 'Slovakia',
  Slovenia = 'Slovenia',
  SolomonIslands = 'Solomon Islands',
  Somalia = 'Somalia',
  SouthAfrica = 'South Africa',
  SouthKorea = 'South Korea',
  SouthSudan = 'South Sudan',
  Spain = 'Spain',
  SriLanka = 'Sri Lanka',
  Sudan = 'Sudan',
  Suriname = 'Suriname',
  Sweden = 'Sweden',
  Switzerland = 'Switzerland',
  Syria = 'Syria',
  Tajikistan = 'Tajikistan',
  Tanzania = 'Tanzania',
  Thailand = 'Thailand',
  TimorLeste = 'Timor-Leste',
  Togo = 'Togo',
  Tonga = 'Tonga',
  TrinidadAndTobago = 'Trinidad and Tobago',
  Tunisia = 'Tunisia',
  Turkey = 'Turkey',
  Turkmenistan = 'Turkmenistan',
  Tuvalu = 'Tuvalu',
  Uganda = 'Uganda',
  Ukraine = 'Ukraine',
  UnitedArabEmirates = 'United Arab Emirates',
  UnitedKingdom = 'United Kingdom',
  UnitedStates = 'United States',
  Uruguay = 'Uruguay',
  Uzbekistan = 'Uzbekistan',
  Vanuatu = 'Vanuatu',
  VaticanCity = 'Vatican City',
  Venezuela = 'Venezuela',
  Vietnam = 'Vietnam',
  Yemen = 'Yemen',
  Zambia = 'Zambia',
  Zimbabwe = 'Zimbabwe',
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


