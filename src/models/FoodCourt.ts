
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IFoodCourt extends Document {
    name: string;
    description?: string;
    blockId: string; // Reference to the block (e.g., "Block A") - could be a relation later
    // Add other fields like opening hours, image URL, etc.
}

const FoodCourtSchema: Schema<IFoodCourt> = new Schema({
    name: {
        type: String,
        required: [true, 'Food court name is required.'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    blockId: { // Simple string for now, can be linked to a Block model later
        type: String,
        required: [true, 'Block ID is required.'],
    },
    // Add other fields here
}, {
    timestamps: true
});

const FoodCourt: Model<IFoodCourt> = models.FoodCourt || mongoose.model<IFoodCourt>('FoodCourt', FoodCourtSchema);

export default FoodCourt;
