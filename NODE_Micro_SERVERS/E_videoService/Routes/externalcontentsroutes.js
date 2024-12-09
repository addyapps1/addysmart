import express from 'express';
const router = express.Router();

import * as externalContentsController from "../Controllers/externalVideoController.js";
import * as authController from '../Controllers/authcontroller.js';
import upload from '../Utils/filehandler.js';

// ROUTES CHAINING for supportcv

router
  .route("/tasks")
  .get(
    authController.protect, externalContentsController.getE_VideosTask);

router
  .route("/evuplv/:videoID")
  .get(
    authController.protect,
    externalContentsController.getE_VideoAndUpdateRecentlyViewed
  );

router
  .route("/")
  .get(authController.protect, externalContentsController.getAllE_Videos)
  .post(
    authController.protect,
    externalContentsController.filesToE_VideosPath,
    upload.array("files"),
    externalContentsController.postE_Video
  ); // allows multiple files uploads

      

router
  .route("/:_id")
  .get(
    authController.protect,
    authController.restrict("admin"),
    externalContentsController.getE_Video
  )
  .patch(authController.protect, externalContentsController.patchE_Video)
  .put(authController.protect, externalContentsController.putE_Video)
  .delete(
    authController.protect,
    authController.restrict("admin"),
    externalContentsController.deleteE_Video
  ); // for single role

export default router;
