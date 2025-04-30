
import mongoose, { Schema, Document, models, Model, Types } from 'mongoose';
import type { IFoodCourt } from './FoodCourt'; // Import IFoodCourt type if using ObjectId relation

export interface IMenuItem extends Document {
    name: string;
    price: number;
    description?: string;
    category: string;
    foodCourtId: Types.ObjectId | string; // Reference to FoodCourt (use ObjectId for relation)
    foodCourtName: string; // Denormalized for convenience, can be derived
    imageUrl?: string;
    // Add other fields like availability, ingredients, etc.
}

const MenuItemSchema: Schema<IMenuItem> = new Schema({
    name: {
        type: String,
        required: [true, 'Menu item name is required.'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Price is required.'],
        min: [0, 'Price cannot be negative.'],
    },
    description: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        required: [true, 'Category is required.'],
        trim: true,
    },
    foodCourtId: {
        // type: Schema.Types.ObjectId, // Use this if relating to FoodCourt collection
        // ref: 'FoodCourt',
        type: String, // Keep as string to match current mock data structure
        required: [true, 'Food court ID is required.'],
    },
    foodCourtName: { // Store denormalized name
       type: String,
       required: [true, 'Food court name is required.']
    },
    imageUrl: {
        type: String,
        trim: true,
    },
    // Add other fields here
}, {
    timestamps: true
});

// Optional: Pre-save hook to ensure foodCourtName is consistent if using ObjectId relation
// MenuItemSchema.pre('save', async function(next) {
//   if (this.isModified('foodCourtId') || this.isNew) {
//     const FoodCourt = mongoose.model<IFoodCourt>('FoodCourt');
//     const foodCourt = await FoodCourt.findById(this.foodCourtId);
//     if (foodCourt) {
//       this.foodCourtName = foodCourt.name;
//     } else {
//       // Handle case where food court is not found
//       return next(new Error(`Food court with ID ${this.foodCourtId} not found.`));
//     }
//   }
//   next();
// });

const MenuItem: Model<IMenuItem> = models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

export default MenuItem;
