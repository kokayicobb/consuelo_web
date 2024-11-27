// src/types/moving-cards.ts
export interface CardItem {
  quote: string;    // Required field
  name: string;     // Required field
  title: string;    // Required field
  image?: string;   // Optional field
  slug?: string;    // Optional field
}

export interface InfiniteMovingCardsProps {
  items: CardItem[];
  direction?: 'left' | 'right';
  speed?: 'fast' | 'normal' | 'slow';
  pauseOnHover?: boolean;
  className?: string;
}