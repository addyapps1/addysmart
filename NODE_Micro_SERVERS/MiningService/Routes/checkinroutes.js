import express from 'express';
const router = express.Router();

import * as checkInController from "../Controllers/checkInController.js";
import * as authController from '../Controllers/authcontroller.js';
import upload from '../Utils/filehandler.js';

// ROUTES CHAINING for supportcv
router
  .route("/")
  .get(authController.protect, checkInController.getCheckIns)
  .post(authController.protect, checkInController.postCheckIn); 

     


router.route("/:_id").get(authController.protect, checkInController.getCheckIn);


export default router;
