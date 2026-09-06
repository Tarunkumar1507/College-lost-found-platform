import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const CATEGORIES = [
  'Electronics',
  'Documents',
  'Wallet/Purse',
  'Keys',
  'Books',
  'Accessories',
  'Clothing',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export type ItemType = 'lost' | 'found';
export type ItemStatus = 'active' | 'returned';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface Item {
  id: string;
  user_id: string;
  type: ItemType;
  item_name: string;
  category: string;
  description: string;
  location: string;
  item_date: string;
  image_url: string | null;
  status: ItemStatus;
  created_at: string;
  profiles?: Profile;
}

export interface Claim {
  id: string;
  item_id: string;
  claimant_id: string;
  reason: string;
  status: ClaimStatus;
  created_at: string;
  items?: Item;
  profiles?: Profile;
}
