import { useCartStore } from "@/stores/useCartStore";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import EmptyCart from "@/components/EmptyCart";
import StarRating from "@/components/StarRating";

export default function CartSummary() {
  const { 
    items, 
    totalPrice, 
    discountedPrice,
    itemCount, 
    updateQuantity, 
    removeAllItems,
    coupon,
    applyCoupon,
    getCoupon,
    availableCoupon,
    getCartItems
  } = useCartStore();

  const navigate = useNavigate();

  useEffect(() => {
    getCartItems();
    getCoupon();
  }, [ getCoupon, getCartItems]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        {items.length > 0 && <h2 className="text-3xl font-bold text-gray-900">Shopping Cart</h2>}
        {items.length > 0 && (
          <button
            onClick={async () => {
              await removeAllItems();
              toast.success('Cart cleared');
            }}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
          >
            <TrashIcon className="h-5 w-5" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 justify-center items-center">
        {/* Cart Items Section */}
        <div className="lg:w-2/3 space-y-6">
          <AnimatePresence>
            {items.length === 0 ? (
              <EmptyCart />
            ) : (
              items.map((item) => (
                <motion.div
                  key={item.cartItemId + item._id + item.color}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow max-md:flex-col"
                >
                  <div className="flex items-center gap-6 max-md:flex-col">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="space-y-2">
                      <Link to={`/products/${item._id}`}>
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-gray-700">{item.title}</h3>
                      </Link>
                      
                      {(item.averageRating || item.numberOfRatings > 0) && (
                        <div className="flex items-center gap-3">
                          <StarRating rating={item.averageRating} />
                          {item.numberOfRatings && (
                            <span className="text-sm text-gray-500">
                              ({item.numberOfRatings} reviews)
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-gray-600 line-clamp-2">{item.description}</p>
                      
                      <div className="flex gap-2 items-center">
                        {item.color && (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                              style={{ backgroundColor: item.color }}
                            />
                            {item.size && (
                              <span className="px-2 py-1 bg-gray-100 rounded-md text-sm">
                                {item.size}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-lg font-medium">
                        {item.isSale ? (
                          <div className="flex gap-2">
                            <span className="line-through text-gray-400">
                              ${item.price?.toFixed(2)}
                            </span>
                            <span className="text-red-600">
                              ${item.finalPrice?.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span>${item.price?.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={async () => {
                          const newQuantity = item.quantity - 1;
                          await updateQuantity(item.cartItemId, newQuantity);
                          newQuantity === 0 && toast.success('Item removed');
                        }}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        −
                      </button>
                      <motion.span
                        key={item.quantity}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="font-medium w-6 text-center"
                      >
                        {item.quantity}
                      </motion.span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        disabled={item.quantity >= (item.stock || 0)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={async () => {
                        await updateQuantity(item.cartItemId, 0);
                        toast.success('Item removed');
                      }}
                      className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary Section */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:w-1/3 h-fit sticky top-8"
          >
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>
              
              {/* Coupon Input Section */}
              <div className="mb-6">
                {/* Coupon Input Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const code = formData.get('code') as string;
                    applyCoupon(code);
                  }}
                  className="flex gap-2"
                >
                  <input
                    name="code"
                    type="text"
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Apply
                  </button>
                </form>

                {/* Coupon Details Display (only shows after a coupon is applied) */}
                {availableCoupon && !coupon && (
                  <div className="bg-green-50 p-3 rounded-lg mt-2">
                    <div className="space-y-1">
                      <span className="text-green-600 font-medium">
                        {availableCoupon.code} - {availableCoupon.discountPercentage}% off
                      </span>
                    </div>
                  </div>
                )}

                {coupon && (
                  <div className="bg-green-50 p-3 rounded-lg mt-2">
                    <div className="space-y-1">
                      <span className="text-green-600 font-medium">
                       Congrats, you got {coupon.discountPercentage}% off
                      </span>
                      <p className="text-xs text-green-500">
                        Valid until: {new Date(coupon.expirationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>


              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal ({itemCount} items)
                  </span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>

                {coupon && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coupon Discount:</span>
                    <span className="text-red-600">
                      -${(totalPrice - discountedPrice).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-gray-900">
                      ${discountedPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')} // Update with your actual checkout route
                className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
