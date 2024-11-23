'use strict'
import Property from '../model/property.model.js';
import Client from '../model/client.model.js';
import Staff from '../model/staff.model.js';
import { validationResult } from 'express-validator';


let propertyController = {

    searchProperty: async (req, res) => {
        
        const { searchStreet, searchLocality, searchCity, searchPrice } = req.body;

        let addressField = {}
        
        if (searchStreet) addressField['address.street'] = searchStreet;
        if (searchLocality) addressField['address.locality'] = searchLocality;
        if (searchCity) addressField['address.city'] = searchCity;
        if (searchPrice) addressField['price'] = searchPrice;
        
        try {
            // Find properties with the given address
            const propertySearched = await Property.find(addressField); 
            //console.log(propertySearched)
            const ownerIds = propertySearched.map(property => property.propertyOwner);
            const propertyOwner = await Client.find({ _id: ownerIds })
           
            // If no properties were found
            if (propertySearched.length === 0) {
                return res.status(404).json({ message: 'No properties found for your search' });
            }

            // Return the found properties
            res.status(200).json({
                message: 'Property found',
                propertySearched: propertySearched,
                propertyOwner: propertyOwner
            });

        } catch (error) {
            console.error('Error searching for property:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    updatePropertyPhotos: async (req, res) => {
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        try {
            // Extract property ID from the request body
            const { uploadPropertyId } = req.body;

            // Check if files are uploaded
            if (!req.files || !req.files.uploadPhotos) {
                return res.status(400).json({ message: "No photos uploaded" });
            }

            // Modify file paths for each uploaded photo
            const filePaths = req.files.uploadPhotos.map(file => {
                let propertyImagePath = file.path.replace(/\\/g, '/').replace(/\uploads\//g, '');
                return '/' + propertyImagePath; // Return the modified path
            });

            // Append the new photo paths to the existing propertyImage array
            const updateProperty = await Property.findOneAndUpdate(
                { _id: uploadPropertyId },
                { $push: { propertyImage: { $each: filePaths } } }, // Use $push with $each to append the new paths
                { new: true } // Return the updated document
            );

            // Check if the update was successful
            if (!updateProperty) {
                return res.status(404).json({ message: "Property not found" });
            }

            // Return success response
            res.status(200).json({ message: "Property photos uploaded successfully", updatedProperty: updateProperty });

        } catch (error) {
            console.error('Error uploading property photos:', error);
            res.status(500).json({ message: "Failed to upload property photos" });
        }
    },

    updateProperty: async (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            //console.log(errors)
        }
        //console.log(req.body)
        const {
            propertyId,
            editFirstName,
            editLastName,
            editOwnersAddress,
            editOldStreet,
            editOldLocality,
            editOldCity,
            editEmail,
            editOwnerPhone,
            editClientOf,
            editTitle,
            editStreet,
            editLocality,
            editCity,
            editPrice,
            editDescription
        } = req.body;

        try {
            // Find and update the property
            const updatedProperty = await Property.findOneAndUpdate(
                { _id: propertyId },
                {
                    $set: {
                        title: editTitle,
                        address: {street:editStreet,locality:editLocality,city:editCity},
                        price: editPrice,
                        description: editDescription
                    }
                },
                { new: true, runValidators: true } // Return updated document and run validation
            );
            
            if (!updatedProperty) {
                return res.status(404).json({ message: 'Property listing not found' });
            }
            let oldAddress = { street: editOldStreet, locality: editOldLocality, city: editOldCity }
            let editAddress = { street: editStreet, locality: editLocality, city: editCity }
           
            // Initialize filter and update objects
            let filter = { _id: updatedProperty.propertyOwner };
            let update = {
                firstName: editFirstName,
                lastName: editLastName,
                address: editOwnersAddress,
                phone: editOwnerPhone,
                email: editEmail
};

            // Find the client document in the database
            const updatePropertyAddressForClient = await Client.findOne({ _id: updatedProperty.propertyOwner });
            //console.log(updatePropertyAddressForClient)
            if (!updatePropertyAddressForClient) {
                return res.status(400).json({ message: 'Client not found' });
            }

            updatePropertyAddressForClient.propertyAddress.forEach(address => {
                Object.keys(oldAddress).forEach(key => {
                    if (address[key] !== undefined && address[key] === oldAddress[key]) {
                        address[key] = editAddress[key];
                    }
                });
            });

            
            // Find and update the owner
            const updatedOwner = await Client.findOneAndUpdate(
                filter,
                { $set: {...update, propertyAddress:updatePropertyAddressForClient.propertyAddress } },
             { new: true } 
            );

            if (!updatedOwner) {
                return res.status(404).json({ message: 'Failed to update client information' });
            }

            // Update the clientOf fields if employmentId has changed for the property
            if (updatedProperty.clientOf.employmentId !== editClientOf) {
                const updateStaff = await Staff.findOne({ employmentId: editClientOf });
                if (updateStaff) {
                    const staffName = `${updateStaff.firstName} ${updateStaff.lastName}`;

                    // Update both the property and the client with the new staff info
                    await Promise.all([
                        Property.findOneAndUpdate(
                            { _id: propertyId },
                            { clientOf: { staffName, employmentId: editClientOf } }
                        ),
                        Client.findOneAndUpdate(
                            { _id: updatedOwner._id },
                            { clientOf: { staffName, employmentId: editClientOf } }
                        )
                    ]);
                } else {
                    return res.status(404).json({ message: 'Staff not found for the provided employmentId' });
                }
            }
            return res.status(200).json({ message: 'Property and client information updated successfully' });
   
        } catch (error) {
            console.error(error); // Log the error for debugging
            return res.status(500).json({ message: 'An error occurred while updating property' });
        }


    },

    webListing: async (req, res) => {
        try {
            const propertyListing = await Property.find();
            if (!propertyListing || propertyListing.length === 0) {
                return res.status(200).json({message:'No property listing found'})
            }
            //console.log(propertyListing);
            return res.status(200).json({propertyListing });
        } catch (errors) {
            return res.status(500).json({ message: 'An error occured while fetching property listing' });
        }
    },

    staffListing: async (req, res) => {
        //onsole.log(req.body)
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { employmentId } = req.body;
        if (!employmentId) {
            res.json({ message: 'Employment id not found' })
        }
        try {
            // Fetch all listings for the given employmentId
            const staffListing = await Property.find({ 'clientOf.employmentId': employmentId, isAvailable: true });

            //console.log(staffListing);

            if (!staffListing || staffListing.length === 0) {
                //console.log(`Property Listing for Staff is empty`);
                return res.status(200).json({ message: "No listings found for this staff member" });
            }

            // Extract all unique propertyOwner IDs from the staff listings
            const ownerIds = [...new Set(staffListing.map(listing => listing.propertyOwner))];
            //console.log(staffListing)
            // Fetch all property owners based on the unique owner IDs
            const propertyOwner = await Client.find({ _id: { $in: ownerIds } });
            //console.log(staffListing)
            return res.status(200).json({ staffListing, propertyOwner });
        } catch (error) {
            console.error('Error fetching property listings:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
    addProperty: async (req, res) => {
        let errors = validationResult(req);
        //console.log(req.files)
        if (!errors.isEmpty()) {
            //console.log(errors)
            return res.status(500).json({ message: 'An error occured while validating request' });

        }
        try {
            // Access property and client images
            const propertyImage = req.files.propertyImage;
            const clientImage = req.files.clientImage;

            // Check if both images were uploaded
            if (!propertyImage || !clientImage) {
                return res.status(400).json({ message: 'Both client and property images are required.' });
            }

            // Process the file paths
            let propertyImagePath = propertyImage[0].path.replace(/\\/g, '/').replace(/\uploads\//g,'');
            propertyImagePath = 'https://property-management-production-63a4.up.railway.app/' + propertyImagePath;

            let clientImagePath = clientImage[0].path.replace(/\\/g, '/').replace(/\uploads\//g,'');
            clientImagePath = 'https://property-management-production-63a4.up.railway.app/' + clientImagePath;
            //console.log(req.body)
            // Extract property details from the request body
            const { firstName, street, locality, city, lastName, ownerPhone, title, clientOf, price, email, description, ownersAddress } = req.body;

            // Validate that all required fields are present
            if (!firstName || !street || !locality || !city || !ownersAddress || !lastName || !ownerPhone || !clientOf || !price || !email || !description || !title) {
                return res.status(400).json({ message: "All fields are required." });
            }
            const addressObj = { street: street, locality: locality, city: city };
            // Find staff member based on employment ID
            const staff = await Staff.findOne({ employmentId: clientOf });
            if (!staff) {
                return res.status(404).json({ message: `Staff with employment ID ${clientOf} not found.` });
            }

            // Check if the property address already exists
            const existingProperty = await Property.findOne({ 'address.street': street, 'address.locality': locality, 'address.city': city });
            if (existingProperty) {
                return res.status(400).json({ message: 'Property address already exists' });
            }

            // Check if the client already exists
            let existingClient = await Client.findOne({ phone: ownerPhone });

            if (existingClient) {
                // Check if the address already exists in the client's address array
                const addressExists = existingClient.propertyAddress.some(addr =>
                    addr.street === addressObj.street &&
                    addr.locality === addressObj.locality &&
                    addr.city === addressObj.city
                );

                if (addressExists) {
                    return res.status(400).json({ message: 'Property address already exists for this client' });
                } else {
                    // Add the new address to the array
                    existingClient.propertyAddress.push(addressObj);
                    await existingClient.save();
                }
            } else {
                // If the client doesn't exist, create a new one
                existingClient = new Client({
                    clientImage: clientImagePath,
                    firstName: firstName,
                    lastName: lastName,
                    clientOf: { staffName: `${staff.firstName} ${staff.lastName}`, employmentId: clientOf },
                    phone: ownerPhone,
                    propertyAddress: [addressObj],
                    address: ownersAddress,
                    email: email
                });

                await existingClient.save();
            }


            // Create the new property with the staff details and reference the existing client
            const newProperty = new Property({
                propertyOwner: existingClient._id, // Reference to the client
                title: title,
                clientOf: { staffName: `${staff.firstName} ${staff.lastName}`, employmentId: clientOf },
                address: addressObj,
                price,
                description,
                propertyImage: [propertyImagePath],
                isAvailable: true,
            });

            // Save the new property
            await newProperty.save();

            // Respond with success message and property details
            return res.status(200).json({
                message: 'Property added to listing',
                property: {
                    firstName,
                    lastName,
                    ownerPhone,
                    email,
                    clientOf: `${staff.firstName} ${staff.lastName}`,
                    address: addressObj,
                    price,
                    description,
                    propertyImage: propertyImagePath,
                    clientImage: clientImagePath
                }
            });

        } catch (error) {
            console.error('Error adding property:', error);
            return res.status(500).json({ message: "Error adding property" });
        }

    }


}
export default propertyController
