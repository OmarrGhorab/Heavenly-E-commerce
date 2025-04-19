import { Product } from "@/types/product";
import ProductCard2 from "./ProductCard";

interface RecommendedProducts {
  recommended: Product[];
}

const PeopleAlsoBought: React.FC<RecommendedProducts> = ({ recommended }) => {

  return (
    <div className="pt-6">
      <h3 className="text-4xl font-bold  text-foreground mb-8 relative pb-4 pl-6 after:content-[''] after:absolute after:bottom-0 after:left-6 after:w-16 after:h-1 after:bg-primary">
        People Also Bought
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-auto-fit gap-4">
        {recommended.map((product) => (
          <ProductCard2 key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default PeopleAlsoBought;
