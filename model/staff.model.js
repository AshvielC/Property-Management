'use strict'
import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: Number, required: true },
    staffPassword: { type: String, required: true },
    fnpf: { type: String, required: true },
    tin: { type: String, required: true },
    designation: { type: String, required: true },
    employmentId: { type: Number, required: true },
    startDate: { type: String, required: true },
    profilePicPath: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},

    { collection: "Staffs" });

let Staff = mongoose.model('Staffs', staffSchema);

export default Staff;