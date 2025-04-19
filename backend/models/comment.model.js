import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
}, { timestamps: true })

commentSchema.index({ product: 1 });
commentSchema.index({ user: 1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;