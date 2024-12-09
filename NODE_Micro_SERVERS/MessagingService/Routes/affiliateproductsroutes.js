import express from 'express';
const router = express.Router();

import * as authController from '../Controllers/authcontroller.js';
import * as affiliateProductsController from "../Controllers/affiliateProductsController.js";
import upload from '../Utils/filehandler.js';

// ROUTES CHAINING for supportcv
router
  .route("/")
  .get(authController.protect, affiliateProductsController.getAffiliateProducts)
  .post(
    authController.protect,
    affiliateProductsController.filesToAffiliateProduct,
    upload.array("files"),
    affiliateProductsController.postAffiliateProduct
  ); // allows multiple files uploads

router
  .route("/:_id")
  .get(authController.protect, affiliateProductsController.getAffiliateProduct)
  .patch(
    authController.protect,
    affiliateProductsController.patchAffiliateProduct
  )
  .put(authController.protect, affiliateProductsController.putAffiliateProduct)
  .delete(
    authController.protect,
    authController.restrict("admin"),
    affiliateProductsController.deleteAffiliateProduct
  ); // for single role

export default router;
