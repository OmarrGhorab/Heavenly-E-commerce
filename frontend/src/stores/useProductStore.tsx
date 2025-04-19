import { create } from 'zustand';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { Product, CreateProduct, ProductStore, EditProductRequest } from '@/types/product';

// Utility function for error handling
const handleError = (error: any) => {
  toast.error(error?.response?.data?.message || 'An error occurred', { id: 'rating' });
  return false;
};

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  topProducts: [],
  featuredProducts: [],
  recommendedProducts: [],
  ratings: null,
  selectedProduct: null,
  loading: false,
  isEditing: false,
  editProductData: null,
  averageRating: 0,
  message: '',
  numberOfRatings: 0,
  error: null,

  openEditForm: (product: Product) => {
    // Create a fresh copy to avoid mutating the original object
    const productCopy = JSON.parse(JSON.stringify(product));
    set({ isEditing: true, editProductData: productCopy });
  },

  closeEditForm: () => {
    set({ isEditing: false, editProductData: null });
  },

  setProducts: (products: Product[]) => set({ products }),

  createProduct: async (product: CreateProduct) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.post('/products', product);
      const createdProduct = response.data.product;

      set((state) => ({
        products: [...state.products, createdProduct],
        loading: false,
      }));

      toast.success(response.data.message || 'Product created successfully!');
    } catch (error: any) {
      set({ loading: false });
      handleError(error);
    }
  },

  // Fetch all products
  // fetchProducts: async () => {
  //   set({ loading: true });
  //   try {
  //     const response = await axiosInstance.get('/products');
  //     set({ products: response.data.products, loading: false });
  //   } catch (error: any) {
  //     set({ loading: false });
  //     handleError(error);
  //   }
  // },

  fetchProductById: async (id) => {
    set({ loading: true });

    try {
      const res = await axiosInstance.get(`/products/${id}`);
      set({ selectedProduct: res.data.product, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  deleteProduct: async (productId: string) => {
    set({ loading: true });
    try {
      await axiosInstance.delete(`/products/${productId}`);
      set((prevState) => ({
        products: prevState.products.filter((product) => product._id !== productId),
        loading: false,
      }));
      toast.success('Product deleted successfully!');
    } catch (error: any) {
      set({ loading: false });
      handleError(error);
    }
  },

  // Toggle the featured status of a product with explicit product type
  toggleFeatureProduct: async (productId: string) => {
      try {
        set({ loading: true }); // Set loading before API call
        const response = await axiosInstance.patch(`/products/${productId}/featured`);
    
        set((prevState) => ({
          products: prevState.products.map((product) =>
            product._id === productId
              ? { ...product, isFeatured: response.data.isFeatured } // Ensure proper update
              : product
          ),
          featuredProducts: prevState.featuredProducts.map((product) =>
            product._id === productId
              ? { ...product, isFeatured: response.data.isFeatured }
              : product
          ),
          loading: false, // Ensure loading is reset
        }));
    
        toast.success(`Product has been ${response.data.isFeatured ? 'featured' : 'unfeatured'} successfully!`);
      } catch (error: any) {
        set({ loading: false }); // Ensure loading is reset on error
        handleError(error);
        toast.error(error.message || "Something went wrong");
      }
  },


  editProduct: async (productId: string, updatedProductData: EditProductRequest) => {
    set({ loading: true });
    try {
      // Destructure to remove images if present, since we're not updating images
      const { images, ...payload } = updatedProductData;
  
      const response = await axiosInstance.patch<{ product: Product }>(
        `/products/${productId}`,
        payload
      );
  
      if (!response.data?.product) {
        throw new Error('Invalid response format from server');
      }
  
      set((prevState) => {
        const updatedProducts = prevState.products.map((product) => {
          if (product._id === productId) {
            // Merge existing product data with the updated fields
            return {
              ...product,
              ...response.data.product,
            };
          }
          return product;
        });
  
        return {
          products: updatedProducts,
          loading: false,
          isEditing: false,
          editProductData: null,
        };
      });
  
      toast.success('Product updated successfully!');
    } catch (error: any) {
      set({ loading: false });
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        toast.error('Product not found - it may have been deleted');
      } else {
        handleError(error);
      }
      set({ isEditing: true });
    }
  },

  // Fetch featured products, filter by isFeatured: true, and calculate discounted price
  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get('/products/featured-products');

      // Filter and apply discount calculation
      const featuredProducts = response.data.filter((product: Product) => product.isFeatured)
      set({ featuredProducts, loading: false });
    } catch (error: any) {
      set({ loading: false });
      handleError(error);
    }
  },

  topRatingProducts: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get('/products/top-rated');
      const updatedTopProducts = res.data.map((product: Product) => {
        if (product.isSale && product.discount) {
          const discountedPrice = product.price - (product.price * product.discount) / 100;
          return { ...product, discountedPrice };
        }
        return product;
      });
  
      set({ topProducts: updatedTopProducts, loading: false });
    } catch (error) {
      set({ loading: false });
      handleError(error);
    }
  },

  fetchRecommendedProducts: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get('/products/recommendations');  
      const updatedRecommendedProducts = res.data.map((product: Product) => {
        if (product.isSale && product.discount) {
          const discountedPrice = product.price - (product.price * product.discount) / 100;
          return { ...product, discountedPrice };
        }
        return product;
      });
  
      // Log the entire updated array instead of a single discountedPrice variable
      set({ recommendedProducts: updatedRecommendedProducts, loading: false });
    } catch (error) {
      set({ loading: false });
      handleError(error);
    }
  },

  rateProduct: async (id, rating) => {
    try {
      const response = await axiosInstance.put(`/products/rate/${id}`, { rating });
  
      set((state) => {
        if (state.selectedProduct?._id === id) {
          return {
            ...state, // Preserve all other state properties
            selectedProduct: {
              ...state.selectedProduct,
              averageRating: response.data.averageRating,
              numberOfRatings: response.data.numberOfRatings,
              ratings: state.selectedProduct.ratings.map((r) =>
                r.user === id ? { ...r, rating } : r
              ),
            },
          };
        }
        return state; // Return unchanged state if product ID doesn't match
      });
  
      toast.success("Rating updated successfully", { id: 'login'});
    } catch (error) {
      handleError(error)
    }
  },
 
}));
