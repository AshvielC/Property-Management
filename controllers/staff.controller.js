import Staff from '../model/staff.model.js';
import Property from '../model/property.model.js';
import Client from '../model/client.model.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import path from 'path'

const staffController = {

    regStaff: async (req,res)=>{
        // Validate request and handle errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Extract data from request body
        const { firstName, lastName, staffPassword, phone, email, address, designation, tin, fnpf, employmentId, startDate } = req.body;
        const profilePic = req.file;

        // Ensure profile picture is provided
        if (!profilePic) {
            return res.status(400).json({ error: 'Profile picture is required' });
        }

        // Convert the profile picture path for consistent use
      
        let convertedPath = profilePic.path.replace(/\\/g, '')
            .replace(/^uploads/g, '');

        convertedPath =   'https://property-management-production-63a4.up.railway.app/' +  convertedPath;
        //console.log(convertedPath)
        try {
            // Check if a staff member with the same phone number already exists
            const existingStaff = await Staff.findOne({ phone });
            if (existingStaff) {
                return res.status(400).json({ message: `Staff already registered with Phone ${phone}` });
            }

            // Hash the password for security
            const hashedPassword = await bcrypt.hash(staffPassword, 10);

            // Create a new staff entry in the database
            const newStaff = new Staff({
                firstName,
                lastName,
                staffPassword: hashedPassword,
                phone,
                email,
                address,
                designation,
                tin,
                fnpf,
                employmentId,
                startDate,
                profilePicPath: convertedPath
            });

            await newStaff.save();

            // Respond with success message
            res.status(201).json({
                message: `Staff ${firstName} ${lastName} successfully registered with employment ID ${employmentId}`,
            });
        } catch (error) {
            res.status(500).json({ message: 'Error adding user', error: error.message });
        }
    },
    staffLogin: async (req, res)=> {
        //console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let { employmentId, password } = req.body
            //console.log(req.body)
            try {
                let staff = await Staff.findOne({ employmentId: employmentId });
                if (!staff || staff.length === 0) {
                    return res.status(400).json({ error: `Staff with employment ID ${employmentId} not found` });
                }
                let match = await bcrypt.compare(password, staff.staffPassword);
                if (!match) {
                    return res.json({ message:'Incorrect password'})
                }
                res.status(200).json({
                    message: 'Staff authenticated successfully',
                    redirectUrl: `/staff/dashboard?firstName=${encodeURIComponent(staff.firstName)}&lastName=${encodeURIComponent(staff.lastName)}&employmentId=${encodeURIComponent(staff.employmentId)}&profilePicPath=${encodeURIComponent(staff.profilePicPath)}`

                });

            } catch (error) {
                console.error(error);  
                return res.status(500).json({ message: 'An error occurred while logging in' });  }
    },
    delStaff: async  (req, res)=> {

    },
    fetchStaff: async (req, res) => {

    },
    staffDash: async (req, res) => {
        res.sendFile(path.join(process.cwd(),'view', 'staffdashboard.html'))
    },
    

   
};

export default staffController;
