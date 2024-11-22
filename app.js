'use strict'

import express from 'express';
import mongoose from 'mongoose';
import staffRouter from './routes/staff.router.js';
import homeRouter from './routes/home.router.js';
import clientRouter from './routes/client.router.js';
import path from 'path';
import propertyRouter from './routes/property.router.js';

const app = express();
const PORT = 3005;


app.use(express.static(path.join(process.cwd(), 'view')));
app.use(express.static(path.join(process.cwd(), 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/staff', staffRouter);
app.use('/home', homeRouter);
app.use('/property', propertyRouter);
app.use('/client', clientRouter);

mongoose.connect("mongodb+srv://ashvielchand:Myie$ha2015@cluster0.tesoyhr.mongodb.net/RoyluxReality")
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('MongoDB connection error:', error));

app.listen(PORT, () => {
console.log(`Server running port ${PORT}`)
})