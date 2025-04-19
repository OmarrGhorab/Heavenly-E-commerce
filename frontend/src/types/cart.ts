export type CartItem = {
  cartItemId: string;
  _id: string;
  title: string;
  description: string;
  color?: string | null;
  size?: string | null;
  quantity: number;
  price: number;
  images: string[];
  stock: number;
  isSale: boolean;
  discountedPrice?: number | null;
  saleStart?: Date | null;
  saleEnd?: Date | null;
  discount?: number; 
  finalPrice?: number; 
  averageRating: number;
  numberOfRatings: number; 
};

export interface Coupon {
  code: string;
  discountPercentage: number;
  expirationDate: Date;
  isActive: boolean;
  userId: string;
}

export interface CartStore {
  items: CartItem[];
  totalPrice: number;
  discountedPrice: number;
  itemCount: number;
  error: string | null;
  coupon: Coupon | null;
  availableCoupon: Coupon | null;

  // Cart Operations
  getCartItems: () => Promise<void>;
  addItem: (product: CartItem) => Promise<void>;
  removeAllItems: () => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;

  // Coupon Operations
  applyCoupon: (code: string) => Promise<void>;
  getCoupon: () => Promise<void>

  // Calculations
  calculateTotal: () => void;
}
