import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true, // Each coupon code must be unique
        },
        discountPercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100, // Ensures the discount is between 0% and 100%
        },
        expirationDate: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the user
            required: true, 
        },
    },
    {
        timestamps: true, // Automatically manage createdAt and updatedAt fields
    }
);

// Add an index for `userId` to speed up queries if needed
couponSchema.index({ userId: 1 });

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
