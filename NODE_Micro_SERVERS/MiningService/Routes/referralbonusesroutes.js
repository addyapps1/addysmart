import express from 'express';
const router = express.Router();

import * as referralBonusesController from "../Controllers/referralBonusesController.js";
import * as authController from '../Controllers/authcontroller.js';
import upload from '../Utils/filehandler.js';

// ROUTES CHAINING for supportcv
router.route('/')
    .get(authController.protect, referralBonusesController.getreferralBonuses)
    .post(authController.protect,  referralBonusesController.postReferralBonus); 

    

router
  .route("/:_id")
  .get(authController.protect, referralBonusesController.getReferralBonus)
  .delete(
    authController.protect,
    authController.restrict("supreme"),
    referralBonusesController.deleteReferralBonus
  ); // for single role

export default router;
