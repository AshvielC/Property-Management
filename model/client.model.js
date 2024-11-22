'use strict'
import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: Number, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    clientImage: { type: String, required: true },
    clientOf: {
        staffName: { type: String, required: true },
        employmentId: { type: String, required: true }
    },
    propertyAddress: [{
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
    }],
    clientImage: { type: String, required: true },
    createAt: { type: Date, default: Date.now }


}, { collection: "Clients" })


const Client = mongoose.model('Clients', clientSchema);

export default Client;