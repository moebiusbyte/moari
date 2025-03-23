export interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  format: string;
  material_type: string;
  usage_mode: string;
  size: string;
  origin: string;
  warranty: string;
  description: string;
  materials: string[];
  images: string[];
  updated_at: string;
  base_price: number;
  profit_margin: number;
  has_quality_issues: boolean;
  created_at: string;
  status: 'active' | 'inactive' | 'consigned';
}