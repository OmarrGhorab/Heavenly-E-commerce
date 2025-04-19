import { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import useDebounce from '@/components/hooks/useDebounce';
import { useProducts } from '@/components/hooks/useProducts';
import { Slider } from '@/components/ui/Slider';
import { Icon, IconName } from '@/components/Icons';
import ProductCard2 from '@/components/ProductCard';
import ProductNotFound from '@/components/ProductNotFound';

// Animation variants
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    } 
  },
};

const filterVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

// Available categories (could be fetched from API)
const CATEGORIES = [
  { slug: 'women', name: 'Women', icon: 'user' },
  { slug: 'men', name: 'Men', icon: 'shopping-bag' },
  { slug: 'kids', name: 'Kids', icon: 'package' },
];

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { category: routeCategory } = useParams();
  const [keywordInput, setKeywordInput] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize state from URL parameters
  const page = Number(searchParams.get('page')) || 1;
  const initialKeyword = searchParams.get('keyword') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') as 'asc' | 'desc' || 'desc';
  const categories = searchParams.getAll('categories');
  
  // Sync route category with filters
  useEffect(() => {
    if (routeCategory && !location.search.includes('categories')) {
      const newParams = new URLSearchParams({
        categories: routeCategory,
        page: '1',
        fromCategory: 'true'
      });
      
      // Preserve other existing parameters
      searchParams.forEach((value, key) => {
        if (key !== 'categories' && key !== 'page') {
          newParams.append(key, value);
        }
      });
  
      // Use replace: true so this redirect doesn't add a new history entry
      navigate(`/products?${newParams.toString()}`, { 
        replace: true,
        state: { fromCategoryRoute: true }
      });
    }
  }, [routeCategory, navigate, searchParams, location]);

  // Initialize local state
  useEffect(() => {
    setKeywordInput(initialKeyword);
    setPriceRange([
      Number(searchParams.get('minPrice')) || 0,
      Number(searchParams.get('maxPrice')) || 1000
    ]);
  }, [initialKeyword, searchParams]);

  // Debounced search
  const debouncedKeyword = useDebounce(keywordInput, 600);
  
  // React Query data fetching
  const { data, isLoading, error, isFetching } = useProducts({
    page,
    limit: 9,
    keyword: debouncedKeyword,
    sortBy,
    order,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    categories: categories.length ? categories : undefined,
  });

  // Update URL parameters on filter change
  const handleFilterChange = (params: Record<string, string | number | string[]>) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', '1');
      
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          newParams.delete(key);
          value.forEach(v => newParams.append(key, v));
        } else {
          newParams.set(key, String(value));
        }
      });
      
      return newParams;
    }, { replace: true }); // Add replace option here
  };

  // Sync keyword with URL
  useEffect(() => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      debouncedKeyword ? 
        newParams.set('keyword', debouncedKeyword) : 
        newParams.delete('keyword');
      return newParams;
    }, { replace: true }); // Add replace option here
  }, [debouncedKeyword, setSearchParams]);

  return (
    <div className="container mx-auto lg:p-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className='flex justify-between'
      >
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold mb-8 text-gray-800"
        >
          {routeCategory ? 
            `${routeCategory.charAt(0).toUpperCase() + routeCategory.slice(1)} Collection` : 
            'Discover Our Products'}
        </motion.h1>
        <motion.button
          onClick={() => navigate('/')}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Back Home
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Search Input */}
          <motion.div variants={filterVariants} className="bg-white p-4 rounded-2xl shadow-sm">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full p-2 border-b-2 focus:outline-none focus:border-blue-500"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
            />
          </motion.div>

          {/* Category Filter */}
          <motion.div variants={filterVariants} className="bg-white p-4 rounded-2xl shadow-sm">
            <h3 className="font-medium mb-4 text-gray-700">Categories</h3>
            <div className="grid grid-cols-1 gap-2">
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.slug}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const newCategories = categories.includes(cat.slug)
                      ? categories.filter(c => c !== cat.slug)
                      : [...categories, cat.slug];
                    handleFilterChange({ categories: newCategories });
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${categories.includes(cat.slug)
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <Icon 
                    name={cat.icon as IconName}
                    size={18}
                    className={`flex-shrink-0 ${categories.includes(cat.slug) ? 'text-white' : 'text-gray-600'}`}
                  />
                  <span>{cat.name}</span>
                  {categories.includes(cat.slug) && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <Icon name="check" size={16} className="text-white" />
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Price Filter */}
          <motion.div variants={filterVariants} className="bg-white p-4 rounded-2xl shadow-sm">
            <h3 className="font-medium mb-4 text-gray-700">Price Range</h3>
            <Slider
              min={0}
              max={1000}
              step={10}
              value={priceRange}
              onValueChange={(values) => {
                const [min, max] = values as [number, number];
                setPriceRange([min, max]);
                handleFilterChange({ minPrice: min, maxPrice: max });
              }}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Controls Header */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm"
          >
            <div className="text-gray-500">
              Showing {data?.products.length || 0} of {data?.totalProducts || 0} products
            </div>
            <div className="flex gap-4">
              <select
                className="p-2 border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
              >
                <option value="createdAt">Newest</option>
                <option value="price">Price</option>
                <option value="averageRating">Rating</option>
              </select>
              <select
                className="p-2 border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={order}
                onChange={(e) => handleFilterChange({ order: e.target.value })}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="bg-gray-100 rounded-2xl h-80"
                />
              ))}
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12 text-red-500"
            >
              Error loading products: {error.message}
            </motion.div>
          )}

          {/* Products Grid */}
          {!data?.products.length  ? <ProductNotFound /> : 
          <LayoutGroup>
            <AnimatePresence mode='popLayout'>
              <motion.div
                key={`${page}-${debouncedKeyword}`}
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {data?.products.map((product) => (
                  <ProductCard2 
                    key={product._id} 
                    product={product}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </LayoutGroup>
        }
          {/* Pagination */}
          {data?.totalPages && data.totalPages > 1 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 flex justify-center items-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                onClick={() => handleFilterChange({ page: page - 1 })}
                disabled={page === 1 || isFetching}
              >
                Previous
              </motion.button>
              
              <div className="flex gap-2">
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((num) => (
                  <motion.button
                    key={num}
                    whileHover={{ scale: 1.1 }}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      page === num
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleFilterChange({ page: num })}
                  >
                    {num}
                  </motion.button>
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                onClick={() => handleFilterChange({ page: page + 1 })}
                disabled={page >= data.totalPages || isFetching}
              >
                Next
              </motion.button>
            </motion.div>
          )}

          {/* Loading Indicator */}
          {isFetching && !isLoading && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm"
            >
              Updating results...
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;