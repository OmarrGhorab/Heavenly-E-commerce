// src/pages/SuccessPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useCartStore } from '@/stores/useCartStore';
import { CheckCircle, Clock, AlertCircle, Printer } from 'lucide-react';

interface OrderProduct {
  product: string;
  title: string;
  quantity: number;
  price: number;
  image: string;
  color: string;
  size: string;
}

interface OrderDetails {
  id: string;
  amount: number;
  products: OrderProduct[];
  shippingStatus: string;
  createdAt: string;
  shippingDetails?: {
    name: string;
    address: string;
    phone: string;
  };
  coupon?: string;
}

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { removeAllItems } = useCartStore();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyOrder = async () => {
      try {
        if (!sessionId) throw new Error('Invalid session ID');

        const response = await axiosInstance.get(`/payments/verify-order/${sessionId}`);
        if (response.data.valid) {
          removeAllItems();
          setOrder(response.data.order);
        } else {
          setError('Order verification failed');
        }
      } catch (err) {
        setError('Error verifying order. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    verifyOrder();
  }, [sessionId, removeAllItems]);


  if (loading) {
    return <div className="p-4 text-center">Verifying your order...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <h2 className="text-2xl font-bold mb-4">Order Failed</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          {error ? (
            <div className="inline-flex items-center gap-2 text-red-600 mb-4">
              <AlertCircle className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Order Failed</h1>
            </div>
          ) : order ? (
            <div className="inline-flex items-center gap-2 text-green-600 mb-4">
              <CheckCircle className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Order Confirmed!</h1>
            </div>
          ) : null}
          
          <div className="mt-4 space-y-1">
            <p className="text-gray-600">Order ID: {order?.id}</p>
            {order?.createdAt && (
              <p className="text-gray-600">
                Order Date: {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Order Timeline */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Payment Received</span>
              </div>
              <div className={`flex items-center gap-2 ${
                order?.shippingStatus === 'Delivered' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {order?.shippingStatus === 'Delivered' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Clock className="h-5 w-5" />
                )}
                <span>{order?.shippingStatus || 'Processing'}</span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="p-6">
            {/* Products List */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Items in your order</h2>
              <div className="space-y-4">
                {order?.products.map((product) => (
                  <div 
                    key={`${product.product} + ${product.title} + ${product.color} `}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <img
                        src={product.image}
                        alt={product.title}
                        className="h-16 w-16 object-cover rounded-md mr-3"
                      />
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <p className="font-medium">{product.title}</p>
                        <div className="text-sm text-gray-500 mt-1">
                          {product.color && (
                            <div className="flex items-center gap-2 mt-1">
                              <span>Color:</span>
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-200"
                                style={{ backgroundColor: product.color }}
                              />
                            </div>
                          )}
                          {product.size && <p>Size: {product.size}</p>}
                          <p>Qty: {product.quantity}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                     
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            {order?.shippingDetails && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="font-medium">{order.shippingDetails.name}</p>
                  <p className="text-gray-600">{order.shippingDetails.address}</p>
                  <p className="text-gray-600">Phone: {order.shippingDetails.phone}</p>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">


                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>

                <div className="flex justify-between font-semibold border-t pt-3">
                  <span>Total</span>
                  <span>${(order?.amount ?? 0) / 100}</span>
                </div>
              </div>
            </div>

            {/* Customer Support */}
            <div className="mt-8 text-center border-t pt-6">
              <h3 className="text-lg font-semibold mb-2">Need help?</h3>
              <p className="text-gray-600">
                Contact our support team at{' '}
                <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
                  heavenlyshop70@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Print/Download Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="h-5 w-5" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
