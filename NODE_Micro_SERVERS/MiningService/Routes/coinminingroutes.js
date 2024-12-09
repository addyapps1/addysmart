import express from 'express';
const router = express.Router();

import * as coinMiningController from "../Controllers/coinMiningController.js";
import * as authController from '../Controllers/authcontroller.js';
import upload from '../Utils/filehandler.js';

// ROUTES CHAINING for supportcv
router.route('/')
    .get(authController.protect, coinMiningController.getCoinMinings)
    .post(authController.protect, coinMiningController.postCoinMining); 

    

router
  .route("/:_id")
  .get(authController.protect, coinMiningController.getCoinMining);


export default router;
