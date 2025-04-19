import { memo } from 'react';
import { Product } from '../types/product';
import { Sparkles } from 'lucide-react';
import ProductCard2 from './ProductCard';

interface FeaturedProductsItemProps {
  featuredProducts: Product[];
}

const FeaturedProducts: React.FC<FeaturedProductsItemProps> = memo(({ featuredProducts }) => {
  return (
    <section aria-labelledby="featured-products-heading" className="py-10 sm:py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-background via-background/50 to-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-16 relative">
          <div className="absolute -top-4 sm:-top-8 left-1/2 -translate-x-1/2">
            <span aria-hidden="true">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse" />
            </span>
          </div>
          <h2 id="featured-products-heading" className="text-3xl sm:text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 mb-4 sm:mb-6 tracking-tight">
            Featured Products
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
            <div className="w-8 sm:w-12 h-1 rounded-full bg-primary/20" />
            <div className="w-16 sm:w-24 h-1 rounded-full bg-primary" />
            <div className="w-8 sm:w-12 h-1 rounded-full bg-primary/20" />
          </div>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-light">
            Discover our carefully curated selection of premium products,
            handpicked for their exceptional quality and timeless style.
          </p>
        </div>
        <div role="list" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-auto-fit gap-4">
          {featuredProducts.map((product) => (
            <div role="listitem" key={product._id}>
              <ProductCard2 product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default FeaturedProducts;
