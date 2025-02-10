export interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  format?: string;
  quality?: string;
  material_type?: string;
  usage_mode?: string;
  size?: string;
  origin?: string;
  warranty?: string;
  base_price: number;
  profit_margin?: number;
  description?: string;
  status: string;
  materials: string[];
  images: string[];
  created_at: string;
  updated_at: string;
}