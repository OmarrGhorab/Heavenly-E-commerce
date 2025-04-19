import React, { useEffect, useState, useRef } from 'react';
import { z } from "zod";
import { Product } from "@/types/product";
import { useCartStore } from "@/stores/useCartStore";
import { CartItem } from "@/types/cart";
import toast from 'react-hot-toast';
import { useProductStore } from '@/stores/useProductStore';
import InteractiveStarRating from './InteractiveStarRating';
import { useUserStore } from '@/stores/useUserStore';

const ProductSchema = z.object({
  _id: z.string(),
  title: z.string(),
  category: z.string(),
  price: z.number(),
  stock: z.number(),
  description: z.string(),
  isFeatured: z.boolean(),
  images: z.array(z.string().url()),
  comments: z.array(z.string()),
  colors: z.array(z.string()),
  sizes: z.array(z.string()),
  ratings: z.array(
    z.object({
      user: z.string(), 
      rating: z.number().min(1).max(5),
      _id: z.string().optional(), 
    })
  ),
  averageRating: z.number().min(0).max(5),
  numberOfRatings: z.number().min(0),
  isSale: z.boolean(),
  discount: z.number().min(0).max(100).optional(),
  saleStart: z.date().optional(),
  saleEnd: z.date().optional(),
  discountedPrice: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
});

interface ProductInfoProps {
  product: Product;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const validatedProduct = ProductSchema.parse({
    ...product,
    saleStart: product.saleStart ? new Date(product.saleStart) : undefined,
    saleEnd: product.saleEnd ? new Date(product.saleEnd) : undefined,
  });

  // State variables
  const [selectedImage, setSelectedImage] = useState(validatedProduct.images[0]);
  const [selectedSize, setSelectedSize] = useState<string>();
  const [selectedColor, setSelectedColor] = useState<string>();
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const { user } = useUserStore();

  // Stores and refs
  const { addItem } = useCartStore();
  const { rateProduct } = useProductStore();
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Calculate discounted price if a sale is active
  const calculateDiscount = () => {
    const now = new Date();

    if (
      validatedProduct.isSale &&
      validatedProduct.discount &&
      validatedProduct.saleStart &&
      validatedProduct.saleEnd &&
      validatedProduct.saleStart <= now &&
      validatedProduct.saleEnd >= now
    ) {
      return validatedProduct.price * (1 - validatedProduct.discount / 100);
    }
    return validatedProduct.price;
  };

  // Final price is either the discountedPrice (if provided) or calculated discount
  const finalPrice = validatedProduct.discountedPrice ?? calculateDiscount();

  // Check if sale is currently active
  const isSaleActive =
    validatedProduct.isSale &&
    validatedProduct.discount &&
    validatedProduct.saleStart &&
    validatedProduct.saleEnd &&
    validatedProduct.saleStart <= new Date() &&
    validatedProduct.saleEnd >= new Date();

  // Detect touch devices
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Handlers for image zoom effect
  const handleImageHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || isTouchDevice) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;

    const touch = e.touches[0];
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width;
    const y = (touch.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  // Handle adding the product to the cart
  const handleAddToCart = async () => {
    // Validate size and color selections if required
    if (validatedProduct.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (validatedProduct.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }

    if (!user) {
      toast.error('you must login to use this feature!')
    }

    setIsAddingToCart(true);

    const discountValue = validatedProduct.discount ?? 0;
    const hasDiscount = validatedProduct.isSale && discountValue > 0;
    const computedFinalPrice = hasDiscount
      ? validatedProduct.price * (1 - discountValue / 100)
      : validatedProduct.price;

    // Build the cart item object
    const cartItem: CartItem = {
      _id: validatedProduct._id,
      cartItemId: `temp-${Date.now()}`, // Temporary ID for optimistic update
      title: validatedProduct.title,
      description: validatedProduct.description,
      color: selectedColor || null,
      size: selectedSize || null,
      quantity: 1,
      price: validatedProduct.price,
      images: validatedProduct.images,
      stock: validatedProduct.stock,
      isSale: validatedProduct.isSale,
      discount: discountValue,
      saleStart: validatedProduct.saleStart ? new Date(validatedProduct.saleStart) : null,
      saleEnd: validatedProduct.saleEnd ? new Date(validatedProduct.saleEnd) : null,
      finalPrice: computedFinalPrice,
      averageRating: validatedProduct.averageRating,
      numberOfRatings: validatedProduct.numberOfRatings,
    };

    try {
      await addItem(cartItem);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle product rating submission
  const handleAddRating = async (rating: number) => {
    try {
      await rateProduct(validatedProduct._id, rating);
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Image Gallery */}
        <div className="lg:w-[600px] space-y-6 flex flex-col">
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="flex flex-col gap-2 w-20">
              {validatedProduct.images.map((image, index) => (
                <button
                  key={index}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden transition-all duration-300 ${
                    selectedImage === image 
                      ? "ring-2 ring-yellow-500 ring-offset-2" 
                      : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image}
                    alt={`Product view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image Container with Zoom Effect */}
            <div 
              ref={imageContainerRef}
              className="relative flex-1 aspect-square bg-white rounded-xl overflow-hidden cursor-zoom-in"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onMouseMove={handleImageHover}
              onTouchStart={() => setIsHovering(true)}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => setIsHovering(false)}
            >
              <div 
                className="absolute inset-0 transition-transform duration-200 ease-out"
                style={{
                  transform: isHovering ? 'scale(2)' : 'scale(1)',
                  transformOrigin: `${mousePosition.x * 100}% ${mousePosition.y * 100}%`
                }}
              >
                <img
                  src={selectedImage}
                  alt={validatedProduct.title}
                  className="w-full h-full object-contain"
                  aria-label='product image'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Product Details */}
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900 uppercase">
              {validatedProduct.title}
            </h1>
            <p className="text-gray-700 leading-relaxed">
              {validatedProduct.description}
            </p>
            
            {/* Rating Section */}
            <div className="flex items-center gap-3">
              <InteractiveStarRating
                rating={validatedProduct.averageRating}
                onRate={handleAddRating}
              />
              <span className="text-sm text-gray-500">
                <span className="mr-2 text-primary font-bold">
                  {parseFloat(validatedProduct.averageRating.toFixed(2))}
                </span>
                ({validatedProduct.numberOfRatings} reviews)
              </span>
            </div>

            {/* Price Section */}
            <div className="flex items-baseline gap-4">
              <span
                className={`text-4xl font-bold ${
                  isSaleActive ? 'text-red-700' : 'text-gray-900'
                }`}
              >
                ${finalPrice.toFixed(2)}
              </span>
              {isSaleActive && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    ${validatedProduct.price.toFixed(2)}
                  </span>
                  <span className="px-2 py-1 text-sm font-semibold text-red-700 bg-red-50 rounded-md">
                    {validatedProduct.discount}% OFF
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Stock Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span
                className={`px-3 py-1 rounded-full ${
                  validatedProduct.stock > 0 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {validatedProduct.stock > 0
                  ? `${validatedProduct.stock} in stock`
                  : "Out of stock"}
              </span>
            </div>
          </div>

          {/* Size Selector */}
          {validatedProduct.sizes.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Size:</p>
              <div className="flex flex-wrap gap-2">
                {validatedProduct.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-all duration-300 ${
                      selectedSize === size
                        ? "bg-yellow-500 text-white border-yellow-600"
                        : "bg-white border-gray-200 hover:border-yellow-500"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {validatedProduct.colors.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Color:</p>
              <div className="flex flex-wrap gap-3">
                {validatedProduct.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`group relative w-12 h-12 rounded-full border border-gray-400 transition-transform duration-300 ${
                      selectedColor === color
                        ? "ring-2 ring-yellow-500 ring-offset-2 scale-110"
                        : "hover:scale-110"
                    }`}
                  >
                    <span 
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {selectedColor === color && (
                      <span className="absolute inset-0 rounded-full border-2 border-white animate-ping" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={validatedProduct.stock <= 0 || isAddingToCart}
            className={`relative w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              validatedProduct.stock > 0
                ? isAddingToCart
                  ? "bg-green-500 text-white transform scale-95"
                  : "bg-yellow-500 hover:bg-yellow-600 text-white hover:shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span className={`transition-opacity duration-300 ${isAddingToCart ? 'opacity-0' : 'opacity-100'}`}>
              {validatedProduct.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </span>
            {isAddingToCart && (
              <span className="absolute inset-0 flex items-center justify-center">
                Added to Cart ✓
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
