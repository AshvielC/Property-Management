'use strict'
import express from 'express';
import clientController from '../controllers/client.controller.js';
import uploads from '../config/multer.config.js'


let router = express.Router();
router.use('/listing', clientController.clientListing)
router.post('/search', uploads.none(), clientController.clientSearch)
router.post('/update',uploads.none(),clientController.clientUpdate)

export default router