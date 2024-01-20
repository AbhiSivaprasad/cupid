export interface Message {
  role: 'other' | 'self';
  content: string;
}

export interface Profile {
  texts: string[];
  images: string[];
}
