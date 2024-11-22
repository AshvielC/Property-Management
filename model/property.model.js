'user strict'
import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
    propertyOwner: {
        // Reference to the Client model
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clients', // Ensure this matches the name of the client model
        required: true
    },
    title: { type: String, required: true },
    address: {
        street: {
            type: String,
            required: true,
            trim: true
        },
        locality: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        }
    },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    clientOf: {
        staffName: { type: String, required: true },
        employmentId: { type: String, required: true }
    },
    propertyImage: { type: [String], required: true },
    soldBy: { type: String },
    soldDate: { type: Date },
    isAvailable: { type: Boolean, value: true },
    createdAt: {
        type: Date,
        default: Date.now
    }

}, { collection: "Property" });

const Property = mongoose.model('Property', propertySchema);

export default Property;