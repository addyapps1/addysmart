import express from "express";
const router = express.Router();

import * as authController from "../Controllers/authcontroller.js";
import * as campainController from "../Controllers/CampainController.js";
import upload from "../Utils/filehandler.js";

// ROUTES CHAINING
router
  .route("/task")
  .get(authController.protect, campainController.getTargetedCampaignTask);

router
  .route("/follower")
  .get(authController.protect, campainController.postFollowersGained);

router
  .route("/subscribed")
  .get(authController.protect, campainController.postSubscriberGained);

router.route("/viewed").get(authController.protect, campainController.postView);

router
  .route("/cta")
  .get(authController.protect, campainController.postCampaignCTAclick);

router
  .route("/conversion")
  .get(authController.protect, campainController.postCampaignConversion);

router
  .route("/impression")
  .get(authController.protect, campainController.postCampaignImpression);

// CRUD
router
  .route("/")
  .get(authController.protect, campainController.getCampaigns)
  .post(
    authController.protect,
    campainController.filesToCampaign,
    upload.array("files"),
    campainController.postCampaign
  ); // allows multiple files uploads

router
  .route("/:_id")
  .get(authController.protect, campainController.getCampaign)
  .patch(authController.protect, campainController.patchCampaign)
  .put(authController.protect, campainController.putCampaign)
  .delete(
    authController.protect,
    authController.restrict("admin"),
    campainController.deleteCampaign
  ); // for single role

export default router;
