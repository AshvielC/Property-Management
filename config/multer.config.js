'use strict'

import multer from 'multer'
const imgPath = '/mnt/data/uploads/'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imgPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // File naming convention
    }
});

const uploads = multer({ storage: storage});

export default uploads
