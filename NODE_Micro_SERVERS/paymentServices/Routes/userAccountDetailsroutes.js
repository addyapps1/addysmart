import express from 'express';
const router = express.Router();

import * as userAccountDetailsController from "../Controllers/userAccountDetailsController.js";
import * as authController from '../Controllers/authcontroller.js';
import upload from '../Utils/filehandler.js';

// ROUTES CHAINING for supportcv
router.route('/')
    .get(authController.protect, userAccountDetailsController.getUsersAccountDetails)
    .post(authController.protect,  userAccountDetailsController.postUserAccountDetails); 

     
    

router
  .route("/:_id")
  .get(
    authController.protect,
    userAccountDetailsController.getUserAccountDetails
  )
  .patch(
    authController.protect,
    userAccountDetailsController.patchUserAccountDetails
  )
  .put(
    authController.protect,
    userAccountDetailsController.putUserAccountDetails
  )
  .delete(
    authController.protect,
    authController.restrict("supreme"),
    userAccountDetailsController.deleteUserAccountDetails
  ); // for single role

export default router;
