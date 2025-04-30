
import mongoose, { Schema, Document, models, Model, Types } from 'mongoose';

// Interface for individual items within an order
interface IOrderItem {
    menuItemId: Types.ObjectId | string; // Reference to MenuItem
    name: string; // Denormalized
    price: number; // Denormalized price at time of order
    quantity: number;
    imageUrl?: string; // Denormalized
}

// Interface for the Order document
export interface IOrder extends Document {
    userId: Types.ObjectId | string; // Reference to User
    items: IOrderItem[];
    totalPrice: number;
    status: 'pending_payment' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
    deliveryLocation: string;
    paymentDetails?: { // Optional: Store payment info if needed
        transactionId?: string;
        method?: string; // e.g., 'upi'
        paidAt?: Date;
    };
    estimatedDeliveryTime?: number; // In minutes
    cancellationDetails?: {
        cancelledAt: Date;
        reason?: string; // e.g., 'user_request', 'expired_window'
    };
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema: Schema<IOrderItem> = new Schema({
    menuItemId: {
        // type: Schema.Types.ObjectId, // Use ObjectId if relating to MenuItem collection
        // ref: 'MenuItem',
        type: String, // Keep as string to match current structure
        required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    imageUrl: { type: String }
}, { _id: false }); // Don't create separate _id for subdocuments

const OrderSchema: Schema<IOrder> = new Schema({
    userId: {
        // type: Schema.Types.ObjectId, // Use ObjectId if relating to User collection
        // ref: 'User',
        type: String, // Keep as string for now
        required: true,
        index: true, // Add index for faster lookups by user
    },
    items: [OrderItemSchema],
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ['pending_payment', 'processing', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending_payment',
        index: true, // Index for filtering by status
    },
    deliveryLocation: {
        type: String,
        required: true,
        trim: true,
    },
    paymentDetails: {
        transactionId: { type: String },
        method: { type: String },
        paidAt: { type: Date },
    },
    estimatedDeliveryTime: {
        type: Number,
    },
    cancellationDetails: {
        cancelledAt: { type: Date },
        reason: { type: String }
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

const Order: Model<IOrder> = models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
