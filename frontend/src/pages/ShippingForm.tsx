// ShippingForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosInstance from '@/lib/axios';
import { useCartStore } from '@/stores/useCartStore';
import { LockClosedIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';

const shippingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  address: z.string().min(1, 'Address is required'),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

export default function ShippingForm() {
  const { items, coupon, discountedPrice, totalPrice } = useCartStore();
  const { register, handleSubmit, formState } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema)
  });
  
  const onSubmit = async (data: ShippingFormData) => {
    const stripe = await loadStripe('pk_test_51QAurrIzABPfGlTuO20jxSW9rotPuQQimKnEawyt9BIX5uulHNh9bhlECsHofAUWlS8Fy36cD5L3jfX2Y1xRxsKS005TEG95hn');
    
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }
    try {
      const payload = {
        products: items.map(item => ({
          id: item._id,
          title: item.title,
          price: item.price,
          discountedPrice: item.finalPrice ?? 0,
          isSale: item.isSale,
          quantity: item.quantity,
          color: item.color,  
          size: item.size,    
          image: item.images[0]
        })),
        shippingDetails: {
          name: data.name,
          phone: data.phone,
          address: data.address,
        },
        coupon: coupon?.code
      };
      
      console.log(payload)

      const response = await axiosInstance.post('/payments/create-checkout-session', payload);
      // Fix the redirect - use response.data.id instead of data.id
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId
      });
  
      if (error) {
        console.error('Stripe redirect error:', error);
      }
    } catch (error) {
      console.error('Checkout failed:', error); 
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Shipping Details</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                {...register('name')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formState.errors.name ? 'border-red-500' : 'border-gray-200'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                placeholder="John Doe"
              />
              {formState.errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {formState.errors.name.message}
                </motion.p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                {...register('phone')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formState.errors.phone ? 'border-red-500' : 'border-gray-200'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                placeholder="+1 234 567 890"
              />
              {formState.errors.phone && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {formState.errors.phone.message}
                </motion.p>
              )}
            </div>

            {/* Address Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Address
              </label>
              <input
                {...register('address')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formState.errors.address ? 'border-red-500' : 'border-gray-200'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                placeholder="123 Main Street, New York, NY"
              />
              {formState.errors.address && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {formState.errors.address.message}
                </motion.p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              
              {coupon && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount ({coupon.discountPercentage}%):</span>
                  <span className="text-red-600">-${(totalPrice - discountedPrice).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-900 font-semibold">Total:</span>
                <span className="text-gray-900 font-semibold">${discountedPrice.toFixed(2)}</span>
              </div>
            </div>

            {coupon && (
              <div className="bg-green-50 p-3 rounded-lg flex items-center gap-2">
                <span className="text-green-700 text-sm">
                  Coupon Applied: <strong>{coupon.code}</strong> (Expires {new Date(coupon.expirationDate).toLocaleDateString()})
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={formState.isSubmitting}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {formState.isSubmitting ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <LockClosedIcon className="w-5 h-5" />
                Proceed to Secure Checkout
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            <LockClosedIcon className="w-4 h-4 inline-block mr-1" />
            Your information is securely encrypted
          </p>
        </form>
      </div>
    </motion.div>
  );
}
