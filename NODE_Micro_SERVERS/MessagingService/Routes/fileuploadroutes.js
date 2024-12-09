import express from 'express';
import router from express.Router();

import fileUploadsController from '../Controllers/fileUploadsController.js';
import authController from '../Controllers/authcontroller.js';
import upload from '../Utils/filehandler.js';

// ROUTES CHAINING
router.route('/linkprofileimage')
    .put(authController.protect, authController.fileToProfileImgPath, upload.single('file'), fileUploadsController.linkProfileImage)
    .patch(authController.protect, authController.fileToProfileImgPath, upload.single('file'), fileUploadsController.linkProfileImage);

router.route('/unlinkprofileimage')
    .put(authController.protect, fileUploadsController.unlinkProfileImage) // for single role
    .patch(authController.protect, fileUploadsController.unlinkProfileImage); // for single role

router.route('/multipleimage')
    .post(authController.protect, upload.array('files'), fileUploadsController.multipleFilesUpload);

router.route('/unlinkmultiplefiles/:_id')
    .put(authController.protect, fileUploadsController.unlinkProfileImage) // for multiple role
    .patch(authController.protect, fileUploadsController.unlinkProfileImage); // for multiple role

export default router;
