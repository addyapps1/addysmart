import express from "express";
import * as authController from "../Controllers/authcontroller.js";

const router = express.Router();

// PUBLIC ROUTES
router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/forgotpassword").post(authController.forgotpassword);
router.route("/verifyemail/:token").get(authController.VerifyEmail);
router.route("/resetpassword/:Token").patch(authController.resetpassword);

// PROTECTED ROUTES

router
  .route("/resendverificationemail")
  .get(authController.protect, authController.ResendVerificationEmail);

router
  .route("/profileupdate")
  // .put(authController.protect)
  .put(authController.protect, authController.putMe)
  .patch(authController.protect, authController.patchMe);


router
  .route("/me")
  .get(authController.protect, authController.getMe)
  

router
  .route("/searchuser")
  .get(authController.protect, authController.searchUsers);
  

router
  .route("/changepassword")
  .put(authController.protect, authController.changePassword)
  .patch(authController.protect, authController.changePassword);

router
  .route("/logoutall")
  .put(authController.protect, authController.logOutAll)
  .patch(authController.protect, authController.logOutAll);

authController.getUsers;


  

router
  .route("/updaterole/:_id")
  .patch(
    authController.protect,
    authController.restrict("superAdmin", "supreme"),
    authController.updateUserToggleRole
  );
// router.route('/approve/:_id').patch(authController.protect, authController.restrict('admin'), authController.approveUser);


router
  .route("/:_id")
  .get(
    authController.protect,
    authController.restrict("admin"),
    authController.getUser
  )
  .put(
    authController.protect,
    authController.restrict("admin"),
    authController.adminPutUser
  )
  .patch(
    authController.protect,
    authController.restrict("admin"),
    authController.adminPatchUser
  );

router.route("/").get(authController.protect, authController.getUser);

export default router;
