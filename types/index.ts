export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  imageSource?: "google" | "custom" | "none";
  hasGoogleImage?: boolean;
  role: "student" | "admin";
  profileCompletion: number;
  provider: "credentials" | "firebase";
}

export interface Scholarship {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  providerName: string;
  providerImage: string;
  images: string[];
  country: string;
  location: string;
  degreeLevels: string[];
  fields: string[];
  fundingType: "Fully Funded" | "Partially Funded" | "Tuition Waiver" | "Research Grant";
  estimatedValue?: number;
  currency: string;
  benefits: string[];
  eligibility: string[];
  requiredDocuments: string[];
  minimumGpa?: number;
  deadline: string;
  deadlineLabel?: string;
  deadlineIsEstimated: boolean;
  officialUrl: string;
  sourceUrl: string;
  lastVerifiedAt: string;
  status: "pending" | "published" | "rejected";
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  image: string;
  author: string;
  publishedAt: string;
}

export interface StudentProfile {
  nationality?: string;
  currentCountry?: string;
  degreeLevel?: string;
  fieldOfStudy?: string;
  gpa?: number;
  gpaScale?: number;
  graduationYear?: number;
  englishTests?: Array<{ name: string; score: number; takenAt?: string }>;
  workExperienceYears?: number;
  preferredCountries?: string[];
  preferredFields?: string[];
  fundingPreference?: string;
  notes?: string;
}

export interface Recommendation {
  scholarshipId: string;
  matchScore: number;
  matchReasons: string[];
  strengths: string[];
  gaps: string[];
  riskLevel: "low" | "medium" | "high";
  nextAction: string;
  scholarship: Scholarship;
}
