import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/product";
import { EmptyWishlist } from "./EmptyWishlist";
import { useFavouriteStore } from "@/stores/useFavouriteStore";
import { useCartStore } from "@/stores/useCartStore";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { X, ShoppingCart, Loader2 } from "lucide-react";
import { CartItem } from "@/types/cart";
import { useUserStore } from "@/stores/useUserStore";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";

interface FavouriteItemsProps {
  Items: Product[];
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
};

const WishList: React.FC<FavouriteItemsProps> = ({ Items }) => {
  const { items, removeFromFavourite } = useFavouriteStore();
  const { user } = useUserStore();
  const { addItem } = useCartStore();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const isOnSale = (item: Product) => {
    return (
      item.isSale &&
      item.saleStart &&
      item.saleEnd &&
      new Date(item.saleStart) <= new Date() &&
      new Date(item.saleEnd) >= new Date()
    );
  };

  const handleAddToCart = async (item: Product) => {
    if (!user) {
      toast.error('Please login to add products to cart', { id: 'login' });
      return;
    }
    const cartItem: CartItem = {
      cartItemId: crypto.randomUUID(),
      _id: item._id,
      title: item.title,
      description: item.description,
      color: item.colors && item.colors.length > 0 ? item.colors[0] : null,
      size: item.sizes && item.sizes.length > 0 ? item.sizes[0] : null,
      quantity: 1, // default quantity
      price: item.price,
      images: item.images,
      stock: item.stock,
      isSale: item.isSale,
      discountedPrice: item.isSale && item.discount
        ? item.price - (item.price * item.discount) / 100
        : null,
      saleStart: item.saleStart ? new Date(item.saleStart) : null,
      saleEnd: item.saleEnd ? new Date(item.saleEnd) : null,
      numberOfRatings: item.numberOfRatings ?? 0,
      averageRating: item.averageRating ?? 0,
    };
    await addItem(cartItem);
  
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await removeFromFavourite(id);
        toast.error(() => (
          <div className="flex items-center gap-3">
            <X className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <p className="font-medium">Removed from Wishlist</p>
              <p className="text-sm text-gray-500">Item is no longer saved</p>
            </div>
            <button
              onClick={() => toast.dismiss()}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ), { duration: 5000 });
    } finally {
      setRemovingId(null);
    }
  };

  if (Items.length === 0) return <EmptyWishlist />;

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <Toaster />
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8 border-b pb-4 text-gray-800 pl-10"
      >
        Your Wishlist ({items.length} {items.length === 1 ? "item" : "items"})
      </motion.h1>

      <AnimatePresence mode="popLayout">
        <motion.div className="flex flex-col gap-4">
          {items.map((item) => (
            <motion.div
              key={item._id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              className="group flex flex-col md:flex-row gap-6 border p-4 rounded-xl hover:shadow-lg transition-all relative bg-white/90 backdrop-blur-sm"
            >
              {removingId === item._id && (
                <motion.div 
                  className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </motion.div>
              )}

              {/* Image Section */}
              <motion.div 
                className="flex-shrink-0 w-full md:w-52 h-52 relative overflow-hidden rounded-xl bg-gray-50"
                whileHover={{ scale: 0.98 }}
              >
                <img 
                  src={item.images[0]} 
                  alt={item.title}
                  className="object-contain w-full h-full p-4 transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                
                {isOnSale(item) && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg"
                    >
                      Sale!
                    </motion.div>
                  )}
              </motion.div>

              {/* Product Info */}
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <Link to={`/products/${item._id}`}>
                <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer">
                  {item.title}
                </h3>
                </Link>

                {item.averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                    <StarRating rating={item.averageRating} />
                    </div>
                    <span className="text-sm text-gray-500">
                      ({item.averageRating.toFixed(1)})
                    </span>
                  </div>
                )}

                <p className="text-gray-600 text-sm line-clamp-3">
                  {item.description}
                </p>

                <div className="mt-2 flex items-baseline gap-2">
                  {item.isSale ? (
                    <>
                      <span className="text-red-500 font-semibold">
                        ${item.discountedPrice?.toFixed(2)}
                      </span>
                      <span className="line-through text-gray-500">
                        ${item.price?.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-bold">
                      ${item.price?.toFixed(2)}
                    </span>
                  )}
                </div>

                {item.stock && (
                  <div className="mt-2 text-sm">
                    <span className={`font-medium ${
                      item.stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                )}

                <div className="mt-auto flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-lg text-sm font-medium flex items-center gap-2"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </motion.button>
                  
                  <button
                    className="text-gray-500 hover:text-red-600 transition-colors text-sm underline"
                    onClick={() => handleRemove(item._id)}
                    disabled={removingId === item._id}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full"
                  onClick={() => handleRemove(item._id)}
                  disabled={removingId === item._id}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WishList;
