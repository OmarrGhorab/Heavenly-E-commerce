import { Heart, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useCartStore } from '@/stores/useCartStore';
import { useFavouriteStore } from '@/stores/useFavouriteStore';
import { useUserStore } from '@/stores/useUserStore';
import toast from 'react-hot-toast';
import StarRating from './StarRating';
import { ProductSaleStatus } from './HandleBadge';
import { Link } from 'react-router-dom';
import { Product } from '../types/product';
import { CartItem } from '@/types/cart';
import { useMemo } from 'react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();
  const { user } = useUserStore();
  const { addToFavourite, removeFromFavourite, items: favouriteItems } = useFavouriteStore();

  const isFavourite = favouriteItems.some((item) => item._id === product._id);
  const isOnSale = useMemo(() => {
    return product.isSale && product.saleStart && product.saleEnd &&
           new Date(product.saleStart) <= new Date() &&
           new Date(product.saleEnd) >= new Date();
  }, [product]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add products to cart', { id: 'login' });
      return;
    }
  
    const cartItem: CartItem = {
      cartItemId: crypto.randomUUID(),
      _id: product._id,
      title: product.title,
      description: product.description,
      color: product.colors?.[0] || null,
      size: product.sizes?.[0] || null,
      quantity: 1,
      price: product.price,
      images: product.images,
      stock: product.stock,
      isSale: product.isSale,
      discountedPrice: product.isSale && product.discount
        ? product.price - (product.price * product.discount) / 100
        : null,
      saleStart: product.saleStart ? new Date(product.saleStart) : null,
      saleEnd: product.saleEnd ? new Date(product.saleEnd) : null,
      numberOfRatings: product.numberOfRatings ?? 0,
      averageRating: product.averageRating ?? 0,
    };
    await addItem(cartItem);
  };

  return (
    <div className="group relative bg-card rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
        <Link to={`/products/${product._id}`} aria-label={`View details for ${product.title}`}> 
          <img 
            src={product.images[0]} 
            alt={`Image of ${product.title}`} 
            className="w-full h-full z-40 object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        </Link>
        <div className="absolute top-4 right-4 flex flex-col gap-3">
          <Button 
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg hover:scale-110 transition-transform duration-300 bg-white/90 hover:bg-white"
            onClick={async () => {
              if (!user) {
                toast.error('Please login to manage wishlist', { id: 'login' });
                return;
              }
              isFavourite ? await removeFromFavourite(product._id) : await addToFavourite(product);
              toast.success(isFavourite ? 'Removed from wishlist!' : 'Added to wishlist!');
            }}
            aria-label={isFavourite ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={18} className={cn("text-primary transition-colors", isFavourite && "fill-red-500")} />
          </Button>
        </div>
        <ProductSaleStatus saleStart={product.saleStart} saleEnd={product.saleEnd} discount={product.discount} />
      </div>

      {/* Info Section */}
      <div className="p-6">
        <Link to={`/products/${product._id}`} aria-label={`View product: ${product.title}`}>
          <h3 className="text-xl font-semibold text-card-foreground line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {product.title}
          </h3>
        </Link>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>

        {product.colors?.length > 0 && (
          <div className='flex items-center justify-between my-4'>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <span
                  key={color}
                  className="w-6 h-6 rounded-full border border-gray-400 shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className={cn("text-sm", product.stock > 0 ? "text-green-900" : "text-red-900")}>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isOnSale ? (
              <>
                <span className="line-through text-gray-900">${product.price}</span>
                <span className="text-red-700 font-semibold">${(product.price * (100 - (product.discount || 0)) / 100).toFixed(2)}</span>
              </>
            ) : (
              <span className="font-semibold">${product.price}</span>
            )}
          </div>
          <StarRating rating={product.averageRating} />
        </div>

        <Button
          className="w-full py-6 rounded-xl font-medium transition-all duration-300 shadow-lg"
          onClick={handleAddToCart}
          disabled={!product.stock}
          aria-label={product.stock ? "Add to cart" : "Out of stock"}
        >
          <ShoppingCart size={18} className="mr-2" />
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
