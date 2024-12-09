import express from "express";
const router = express.Router();

import * as referralsController from "../Controllers/referralsController.js";
import * as authController from "../Controllers/authcontroller.js";
import upload from "../Utils/filehandler.js";

// ROUTES CHAINING for supportcv
router



  router
    .route("/user")
    .get(authController.protect, referralsController.getUserReferrals);

router
  .route("/")
  .get(
    authController.protect,
    authController.restrict("admin"),
    referralsController.getAllReferrals
)
  
  .post(
    authController.protect,
    authController.restrict("superAdmin","supreme"),
    referralsController.postReferrals
  );

router
  .route("/:_id")
  .get(
    authController.protect,
   authController.restrict("superAdmin","supreme"),
    referralsController.getReferral
  )
  .patch(
    authController.protect,
   authController.restrict("superAdmin","supreme"),
    referralsController.patchReferral
  )
  .put(
    authController.protect,
   authController.restrict("superAdmin","supreme"),
    referralsController.putReferral
  )
  .delete(
    authController.protect,
   authController.restrict("superAdmin","supreme"),
    referralsController.deleteReferral
  ); // for single role

export default router;
