export interface Sale {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  payment_method: string;
  total_amount: number;
  discount_amount: number;
  notes?: string;
  status: 'completed' | 'pending' | 'cancelled';
  sale_date: string;
  created_at: string;
  updated_at?: string;
  items: SaleItem[];
}

export interface SaleItem {
  product_id: string;
  product_name: string;
  product_code?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}