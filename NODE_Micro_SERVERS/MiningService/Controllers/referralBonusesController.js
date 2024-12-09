// Importing modules
import ReferralBonus from "../Models/referralBonuses.js";
import ApiFeatures from "../Utils/ApiFeatures.js";
import asyncErrorHandler from "../Utils/asyncErrorHandler.js";
import CustomError from "../Utils/CustomError.js";
import paginationCrossCheck from "../Utils/paginationCrossCheck.js";
import UnlinkMultipleFiles from "../Utils/UnlinkMultipleFiles.js";
import ProcessMultipleFilesArrayOfObjects from "../Utils/ProcessMultipleFilesArrayOfObjects.js";
import HTMLspecialChars from "../Utils/HTMLspecialChars.js";
import GetUserDetailsFromHeader from "../Utils/GetUserDetailsFromHeader.js";
import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";
import decodeAndVerifyData from "../Utils_Enc/decodeAndVerifyData.js";
import limitEncDetaFromServe from "../Utils_Enc/limitEncDetaFromServe.js";


// Exporting functions
export const getreferralBonuses = asyncErrorHandler(async (req, res, next) => {
  let features = new ApiFeatures(ReferralBonus.find(), req.query)
    .countDocuments()
    .filter()
    .sort()
    .limitfields()
    .limitfields2()
    .paginate();

  // Execute the query and get the result
  let referralBonus = await features.query;

  // Get the total count of records
  let totalCount = await features.totalCountPromise;

  console.log("RecordsEstimate", totalCount);

      referralBonus = await Promise.all(
        referralBonus.map(async (data) => {
          data = await decodeAndVerifyData(data);
          data = await limitEncDetaFromServe(data); // Verify the data data
          return data; // Return the verified data
        })
      );


  res.status(200).json({
    status: "success",
    resource: "referralBonus",
    RecordsEstimate: totalCount,
    action: "getAll",
    length: referralBonus.length,
    data: referralBonus,
  });
});


export const postReferralBonus = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  if (req.files) {
    let filesArrayOfObjects = ProcessMultipleFilesArrayOfObjects(req);
    req.body.files = filesArrayOfObjects;
  }

  const referralBonus = await ReferralBonus.create(req.body);

  res.status(201).json({
    status: "success",
    resource: "referralBonus",
    referralBonus: "created",
    length: referralBonus.length,
    data: referralBonus,
  });
});


export const getReferralBonus = asyncErrorHandler(async (req, res, next) => {
  const referralBonus = await ReferralBonus.findById(req.params._id);
  if (!referralBonus) {
    const error = new CustomError(
      `ReferralBonus with ID: ${req.params._id} is not found`,
      404,
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "referralBonus",
    referralBonus: "created",
    length: referralBonus.length,
    data: referralBonus,
  });
});


export const patchReferralBonus = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  const referralBonus = await ReferralBonus.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!referralBonus) {
    const error = new CustomError(
      `ReferralBonus with ID: ${req.params._id} is not found`,
      404,
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "referralBonus",
    action: "patch",
    length: referralBonus.length,
    data: referralBonus,
  });
});


export const putReferralBonus = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  const referralBonus = await ReferralBonus.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!referralBonus) {
    const error = new CustomError(
      `ReferralBonus with ID: ${req.params._id} is not available`,
      404,
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "referralBonus",
    action: "put",
    length: referralBonus.length,
    data: referralBonus,
  });
});


export const deleteReferralBonus = asyncErrorHandler(async (req, res, next) => {
  const referralBonus = await ReferralBonus.findByIdAndDelete(
    req.params._id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!referralBonus) {
    const error = new CustomError(
      `ReferralBonus with ID: ${req.params._id} is not available`,
      404,
    );
    return next(error);
  }

  if (referralBonus.files) {
    UnlinkMultipleFiles(referralBonus.files, req);
  }

  res.status(204).json({
    status: "success",
    resource: "referralBonus",
    message: "deleted",
  });
});



