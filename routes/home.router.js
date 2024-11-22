'use strict'

import express from 'express';
import homeController from '../controllers/home.controller.js';

let router = express.Router();

router.get('/', homeController.getHomePage);

export default router;