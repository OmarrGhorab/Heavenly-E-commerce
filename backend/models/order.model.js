import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        title: { 
          type: String,
        },
        color: { 
          type: String,
        },
        size: { 
          type: String,
        },
        image: { 
          type: String,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        discountedPrice: {
          type: Number,
          required: false,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingDetails: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    couponCode: {
      type: String,
      default: "none",
    },
    stripeSessionId: {
      type: String,
      unique: true,
      required: true,
    },
    shippingStatus: {
      type: String,
      enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'Pending',
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    paymentIntentId: { type: String }, // If using Stripe or another payment provider
    refundDetails: {
      refunded: { type: Boolean, default: false },
      refundAmount: { type: Number, default: 0 },
      adminRefundApproval: { type: String, enum: ["Pending", "Approved", "Rejected"], default: null },
      cancellationFee: { type: Number, default: 0 },  
      refundFee: { type: Number, default: 0 }
    },
    receiptUrl: String,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
