// src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/api/productService';
import { SearchProductsParams, SearchProductsResponse } from '@/types/product';

interface UseProductsProps extends SearchProductsParams {
  page?: number; 
}

export const useProducts = ({ page = 1, ...filters }: UseProductsProps) => {
  return useQuery<SearchProductsResponse, Error>({
    queryKey: ['products', page, JSON.stringify(filters)],
    queryFn: () => productService.searchProducts({ page, ...filters }),
    staleTime: 1000 * 60 * 60, // Cache data for 1 hour
    placeholderData: (previousData) => previousData, // Equivalent to keepPreviousData
  });
};
