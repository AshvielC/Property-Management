'use strict'

import Client from '../model/client.model.js';

let clientController = {

    clientUpdate: async (req, res) => {
        let { editClientId, editClientFirstName, editClientLastName, editClientPhone, editClientAddress, editClientEmail } = req.body;

        if (!editClientId) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        let phoneNum = Number(editClientPhone);
        let reqBody = {
            firstName: editClientFirstName,
            lastName: editClientLastName,
            phone: phoneNum,
            email: editClientEmail,
            address: editClientAddress
        };
       // console.log(reqBody);

        try {
            const clientToUpdate = await Client.findOne({ _id: editClientId });

            if (!clientToUpdate) {
                return res.status(400).json({ message: 'Client not found' });
            }

            let update = {};
            Object.keys(reqBody).forEach(key => {
                if (clientToUpdate[key] !== reqBody[key]) {
                    update[key] = reqBody[key];
                }
            });

            if (Object.keys(update).length === 0) {
                return res.status(400).json({ message: 'No updates to apply' });
            }

            let updateClient = await Client.findOneAndUpdate(
                { _id: editClientId },
                { $set: update },
                { new: true }
            );

           // console.log(updateClient);

            if (!updateClient) {
                return res.status(400).json('Error updating client information');
            }

            res.status(200).json({ message: 'Client information updated' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating client information' });
        }
    }
,

    clientSearch: async (req, res) => {
        
        let { searchPhone, searchEmploymentId } = req.body
        
        if (searchPhone==='' && searchEmploymentId==='') {
            return res.status(400).json({message:'Please enter either client phone or staff employment id to search'})
        }
        let filter = {};
        if (searchPhone != '') filter['phone'] = searchPhone;
        if (searchEmploymentId != '') filter['clientOf.employmentId'] = searchEmploymentId;
        //console.log(filter)
        let searchClient = await Client.find(filter)
        if (searchClient.length === 0) {
            return res.status(404).json({message:'No clients found'})
        }
        return res.status(200).json({ message: ' Search Complete', searchClient })
    },
    clientListing: async (req, res) => {
        const { employmentId } = req.body;

        if (!employmentId) {
            return res.status(404).json({ message: 'Employment ID not found' });
        }

        try {
            const clientListing = await Client.find({ 'clientOf.employmentId': employmentId });

            if (!clientListing || clientListing.length === 0) {
                return res.json({ message: 'No clients found for this staff member' });
            }

            return res.status(200).json({ message: 'Client listing updated', clientListing });
        } catch (error) {
            console.error(error);  // Log error details
            return res.status(500).json({ message: 'An error occurred while updating client listing' });
        }
    }

}

export default clientController