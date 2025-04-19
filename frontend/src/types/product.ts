export interface Rating {
  user: string;
  rating: number;
  _id?: string;
}

export interface RateProductResponse {
  message: string;
  averageRating: number;
  numberOfRatings: number;
  ratings?: Rating[];
}

// Core Product interface
export interface Product {
  _id: string; // Normalized identifier
  title: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  isFeatured: boolean;
  images: string[];
  comments: string[];
  colors: string[];
  sizes: string[];
  ratings: Rating[];
  averageRating: number;
  numberOfRatings: number;
  isSale: boolean;
  discount: number;
  saleStart?: Date;
  saleEnd?: Date;
  discountedPrice?: number; // Optional, can be derived
}


export interface SearchProductsParams {
  keyword?: string;
  title?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  categories?: string | string[];
}

export interface SearchProductsResponse {
  message: string;
  products: Product[];
  page: number;
  totalPages: number;
  totalProducts: number;
}


// Interface for creating a new product
export interface CreateProduct {
  _id?: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  isFeatured?: boolean;
  images: { name: string; size: number; type: string; base64: string }[];
  colors?: string[];
  sizes?: string[];
  isSale?: boolean;
  discount?: number;
  saleStart?: Date | null;
  saleEnd?: Date | null;
}


export interface EditProductRequest extends Partial<CreateProduct> {}

// Interface for the product store
export interface ProductStore {
  products: Product[]; 
  topProducts: Product[];
  selectedProduct: Product | null;
  featuredProducts: Product[];
  recommendedProducts: Product[];
  ratings: Rating[] | null;
  numberOfRatings: number;
  averageRating: number;
  message: string;
  loading: boolean; 
  setProducts: (products: Product[]) => void;
  error: string | null;

  createProduct: (product: CreateProduct) => Promise<void>; 
  // fetchProducts: () => Promise<void>; 
  fetchProductById: (id: string) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>; 
  toggleFeatureProduct: (productId: string) => Promise<void>; 
  fetchRecommendedProducts: () => Promise<void>;
  rateProduct: (productId: string, rating: number) => Promise<void>;
  editProduct: (productId: string, updatedProductData: EditProductRequest) => Promise<void>; 
  openEditForm: (product: Product) => void; 
  closeEditForm: () => void;

  isEditing: boolean;
  editProductData: Product | null;
  fetchFeaturedProducts: () => Promise<void>;  
  topRatingProducts: () => Promise<void>;
}
