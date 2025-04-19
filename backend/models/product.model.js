import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true, // Useful for searches by title
  },
  category: {
    type: String,
    required: true,
    index: true, // Improves query performance for category filtering
  },
  price: {
    type: Number,
    required: true,
    index: true, // Useful if you sort or filter by price
  },
  stock: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true,
  },
  images: {
    type: [String],
    required: true,
  },
  comments: [
    { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment' 
    }
  ],
  colors: { 
    type: [String],
    default: [],
  },
  sizes: {
    type: [String],
    default: [],
  },
  // Keeping your original ratings structure
  ratings: [
    { 
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
      rating: { type: Number, min: 0, max: 5 },
    }
  ],
  averageRating: { 
    type: Number,
    default: 0,
    min: 0,
    max: 5 
  },
  numberOfRatings: {
    type: Number, 
    default: 0 
  },
  isSale: {
    type: Boolean,
    default: false,
  },
  discount: {
    type: Number,
    default: 0, // Using 0 as default when not on sale
    validate: {
      validator: function (value) {
        // If sale is active, discount must be between 1 and 100.
        if (this.isSale) {
          return value > 0 && value <= 100;
        }
        // If sale is not active, discount should be 0.
        return value === 0;
      },
      message: 'When sale is active, discount must be between 1 and 100; otherwise it must be 0.',
    },
  },
  saleStart: {
    type: Date,
    validate: {
      validator: function (value) {
        // Only validate if sale is active and saleEnd is set
        return this.isSale ? value && this.saleEnd && value < this.saleEnd : true;
      },
      message: 'Sale start date must be before sale end date.',
    },
  },
  saleEnd: {
    type: Date,
    validate: {
      validator: function (value) {
        // Only validate if sale is active and saleStart is set
        return this.isSale ? value && this.saleStart && value > this.saleStart : true;
      },
      message: 'Sale end date must be after sale start date.',
    },
  },
}, { timestamps: true });

// Virtual to calculate the discounted price if sale is active
productSchema.virtual('discountedPrice').get(function () {
  if (this.isSale && this.discount) {
    return this.price - (this.price * this.discount) / 100;
  }
  return this.price;
});

// Pre-save hook: if not on sale, reset sale-related fields
productSchema.pre('save', function (next) {
  if (!this.isSale) {
    this.discount = 0;
    this.saleStart = undefined;
    this.saleEnd = undefined;
  }
  next();
});

// Instance method to check if the sale is currently active
productSchema.methods.isSaleActive = function() {
  const now = new Date();
  return this.isSale && this.saleStart && this.saleEnd && now >= this.saleStart && now <= this.saleEnd;
};

productSchema.index({ category: 1, price: -1 }); // Sort by price descending in a category
productSchema.index({ isFeatured: 1, price: -1 }); // Featured products sorted by price
productSchema.index({ title: "text", description: "text" }); // Full-text search index
productSchema.index({ isSale: 1, saleStart: 1, saleEnd: 1 }); // Faster sale-based queries
productSchema.index({ createdAt: -1 }); // Faster sorting for newest products

const Product = mongoose.model('Product', productSchema);

export default Product;
