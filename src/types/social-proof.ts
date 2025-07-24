// Types for social proof components

export interface ITestimonial {
  id: string;
  content: string;
  author: string;
  rating: number;
  date: string;
  transactionType: 'buy' | 'sell';
  cryptoType: string;
  verified: boolean;
}

export interface ITrustBadge {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  link?: string;
}

export interface IMetric {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export interface IGoogleReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  time: string;
  photoUrl?: string;
}