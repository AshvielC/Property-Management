'use strict'

import express from 'express';
import uploads from '../config/multer.config.js';
import { body } from 'express-validator';
import propertyController from '../controllers/property.controller.js';
import { validationResult } from 'express-validator';


let router = express.Router();

router.post('/add', uploads.fields([
    { name: "clientImage", maxCount: 1 },
    { name: "propertyImage", maxCount: 1 }
]), [body('firstName').isString().withMessage('First name is required'),
    body('lastName').isString().withMessage('Last name is required'),
    body('ownersAddress').isString().withMessage('Owners address is required'),
    body('email').isString().withMessage('Owner email is required'),
    body('ownerPhone').isNumeric().isLength({min: 7}).withMessage('Owner phone is required'),
    body('clientOf').isString().withMessage('Clienty of is required'),
    body('title').isString().withMessage('Property title is required'),
    body('street').isString().withMessage('Property street is required'),
    body('city').isString().withMessage('Property city is required'),
    body('locality').isString().withMessage('Property locality is requred'),
    body('price').isNumeric().withMessage('Property price is required'),
    body('description').isString().withMessage('Property description is required'),
    body('propertyImage').custom((_, { req }) => {
        
        if (!req.files.propertyImage) {
            throw new Error('Property image is required');
        }
        return true;
    }),
    body('clientImage').custom((_, { req }) => {

        if (!req.files.clientImage) {
            throw new Error('Client image is required');
        }
        return true;
    })

], propertyController.addProperty)
router.post('/listing', [body('employmentId').isString().withMessage('Invalid employment ID')], propertyController.staffListing);
router.get('/weblisting', propertyController.webListing);
router.post('/update', uploads.none(), [body('propertyId').isString().withMessage('propertyId is required'),
 body('editFirstName').isString().withMessage('First Name is required'),
body('editLastName').isString().withMessage('Last Name is required'),
body('editOwnersAddress').isString().withMessage("Owners' address is required"),
body('editEmail').isString().withMessage('Owners email  is required'),
body('editOwnerPhone').isNumeric().isLength({ min: 7 }).withMessage('Owner phone is required'),
body('editClientOf').isString().withMessage('Client of is required'),
 body('editPrice').isNumeric().withMessage('Property price is requred'),
body('editTitle').isString().withMessage('Property title is requred'),
 body('editStreet').isString().withMessage('Property street is requred'),
body('editCity').isString().withMessage('Property city is requred'),
body('editLocality').isString().withMessage('Property locality is requred'),
body('editDescription').isString().withMessage('Property description is requred'),
body('editOldStreet').isString().withMessage('Property old street is requred'),
body('editOldLocality').isString().withMessage('Property old locality is requred'),
body('editOldCity').isString().withMessage('Property old city is requred')


], propertyController.updateProperty);
router.post('/upload', uploads.fields([{ name: 'uploadPhotos', max: 10 }]), [body('uploadPhotos').custom((_, { req }) => {

    if (!req.files.uploadPhotos) {
        throw new Error('Property image is required');
    }
    return true;
})], propertyController.updatePropertyPhotos);
router.post('/search',uploads.none(),propertyController.searchProperty);
export default router;