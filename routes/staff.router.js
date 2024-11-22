import express from 'express';
import { body } from 'express-validator'
import upload from '../config/multer.config.js'; 
import staffController from '../controllers/staff.controller.js';

const router = express.Router();


router.post(
    '/register',
    upload.single('profilePic'),
    [
        body('firstName').isString().withMessage('First Name is required'),
        body('lastName').isString().withMessage('Last Name is required'),
        body('employmentId').isNumeric().withMessage('Invalid Employment ID'),
        body('address').isString().withMessage('Address is required'),
        body('phone').isNumeric().isLength({ min: 7 }).withMessage('Phone is required and must be at least 7 digits'),
        body('designation').isString().withMessage('Designation is required'),
        body('startDate').isDate().withMessage('Start Date is required'),
        body('fnpf').isString().withMessage('FNPF is required'),
        body('tin').isString().withMessage('TIN is required'),
        body('staffPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    ],
    staffController.regStaff // Calls the controller function
);
router.post('/login',upload.none(),
    [body('employmentId').isString().withMessage('Invalid Employment ID'),
        body('password').isLength({ min: 8 })
            .withMessage('Password must be aleast 8 characters long')],
    staffController.staffLogin)

router.get('/dashboard', upload.none(), staffController.staffDash);



export default router;
