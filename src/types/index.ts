export interface Equipment {
  id: number;
  name: string;
  mainCategory: 'production' | 'home-ec-set';
  category: string;
  subcategory: string;
  description: string;
  image: string;
  specifications?: string[];
  pricePerUnit?: number;
  unitsPerItem: number;
}

export interface CartItem {
  equipment: Equipment;
  quantity: number;
}

export interface QuoteRequest {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
  items: CartItem[];
  rentalPeriod: {
  discount_amount?: number;
    startDate: string;
    endDate: string;
  };
  specialRequests?: string;
  isTaxExempt?: boolean;
}

export type EquipmentCategory = 'production' | 'home-ec-set';