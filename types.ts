export interface Beat {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  date: string; // ISO Date string
  coverImage: string;
  downloadLink: string;
  price?: number;
  // Specific ad links for this beat (Adsterra Smart Links)
  adLink1: string;
  adLink2: string;
  // YouTube Integration
  youtubeId?: string;
}

export type SortOption = 'newest' | 'oldest' | 'bpm_low' | 'bpm_high';
export type FilterGenre = 'All' | 'Trap' | 'Boombap' | 'Lo-Fi' | 'Drill' | 'R&B';

export const GENRES: FilterGenre[] = ['All', 'Trap', 'Boombap', 'Lo-Fi', 'Drill', 'R&B'];
