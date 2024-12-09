import express from 'express';
const router = express.Router();

import * as authController from '../Controllers/authcontroller.js';
import * as adVideosController from "../Controllers/AdVideoController.js";
import upload from '../Utils/filehandler.js';



// ROUTES CHAINING
router
  .route("/cta")
  .post(authController.protect, adVideosController.postAdCTAclick)

router
  .route("/impression")
  .post(authController.protect, adVideosController.postAdImpression)

router
  .route("/conversion")
  .post(authController.protect, adVideosController.postAdConversion)

router
  .route("/targetedad")
  .get(authController.protect, adVideosController.getTargetedAd)

router
  .route("/")
  .get(authController.protect, adVideosController.getAdVideos)
  .post(
    authController.protect,
    adVideosController.filesToAdVideo,
    upload.array("files"),
    adVideosController.postAdVideo
  ); // allows multiple files uploads


    

router
  .route("/:_id")
  .get(authController.protect, adVideosController.getAdVideo)
  .patch(authController.protect, adVideosController.patchAdVideo)
  .put(authController.protect, adVideosController.putAdVideo)
  .delete(
    authController.protect,
    authController.restrict("admin"),
    adVideosController.deleteAdVideo
  ); // for single role

export default router;
