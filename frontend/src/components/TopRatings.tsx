import { Product } from "../types/product";
import ProductCard2 from "./ProductCard";
import { Sparkles } from "lucide-react";

interface TopRatingProducts {
  topProducts: Product[];
}

const TopRatings: React.FC<TopRatingProducts> = ({ topProducts }) => {
  return (
    <div className="relative">
       <div className="text-center mb-16 relative">
        <Sparkles 
          className="w-8 h-8 text-primary animate-pulse absolute -top-8 left-1/2 -translate-x-1/2" 
          aria-hidden="true"
        />
        <h2 
          className="text-4xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 mb-6 tracking-tight"
          aria-label="Top rated products"
        >
          Top Rating
        </h2>
        <div className="flex items-center justify-center gap-2 mb-6 mt-5" aria-hidden="true">
          <div className="w-12 h-1 rounded-full bg-primary/20" />
          <div className="w-24 h-1 rounded-full bg-primary" />
          <div className="w-12 h-1 rounded-full bg-primary/20" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
          <span aria-live="polite">
            Discover our carefully curated selection of premium products
          </span>
        </p>
      </div>
      <div role="list" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-auto-fit gap-4">
        {topProducts.map((product) => (
          <div role="listitem" key={product._id}>
            <ProductCard2 product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopRatings;
