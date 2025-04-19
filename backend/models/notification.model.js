import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed, // Allows both ObjectId and string
      required: true,
    },
    orderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Order', 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    newStatus: { 
      type: String 
    },
    read: { 
      type: Boolean, 
      default: false 
    },
  },
  { 
    timestamps: true
  }
);

// Add a virtual 'id' field to map _id to id
notificationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

notificationSchema.set('toJSON', {
  virtuals: true,
});

// Create an index if needed
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
