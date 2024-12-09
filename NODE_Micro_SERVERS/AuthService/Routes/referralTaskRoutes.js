import express from "express";
const router = express.Router();

import * as referralTaskController from "../Controllers/referralTaskController.js";
import * as authController from "../Controllers/authcontroller.js";

import upload from "../Utils/filehandler.js";

// ROUTES CHAINING for supportcv
router
  .route("/all")
  .get(
    authController.protect,
    authController.restrict("superAdmin", "supreme"),
    referralTaskController.getAllReferralTask
  );

router
  .route("/")
  .get(authController.protect, referralTaskController.getReferralTask);

router
  .route("/:_id")
  .get(
    authController.protect,
    authController.restrict("superAdmin", "supreme"),
    referralTaskController.getReferralTask
  )
  .delete(
    authController.protect,
    authController.restrict("superAdmin", "supreme"),
    referralTaskController.deleteReferralTask
  ); // for single role

export default router;
