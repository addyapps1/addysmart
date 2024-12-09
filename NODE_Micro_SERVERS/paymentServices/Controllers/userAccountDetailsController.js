// Importing modules
import UserAccountDetails from "../Models/UserAccountDetails.js";
import ApiFeatures from "../Utils/ApiFeatures.js";
import asyncErrorHandler from "../Utils/asyncErrorHandler.js";
import CustomError from "../Utils/CustomError.js";
import paginationCrossCheck from "../Utils/paginationCrossCheck.js";
import UnlinkMultipleFiles from "../Utils/UnlinkMultipleFiles.js";
import ProcessMultipleFilesArrayOfObjects from "../Utils/ProcessMultipleFilesArrayOfObjects.js";
import HTMLspecialChars from "../Utils/HTMLspecialChars.js";
import GetUserDetailsFromHeader from "../Utils/GetUserDetailsFromHeader.js";
import updateResponseFilePathsWithHostName from "../Utils/updateResponseFilePathsWithHostName.js";
// adVideo = updateResponseFilePathsWithHostName(adVideo, HOST);
import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";
import decodeAndVerifyData from "../Utils_Enc/decodeAndVerifyData.js";
import limitEncDetaFromServe from "../Utils_Enc/limitEncDetaFromServe.js";



// Exporting functions
export const getUsersAccountDetails = asyncErrorHandler(async (req, res, next) => {
  let features = new ApiFeatures(UserAccountDetails.find(), req.query)
    .countDocuments()
    .filter()
    .sort()
    .limitfields()
    .limitfields2()
    .paginate();

  // Execute the query and get the result
  let userAccountDetails = await features.query;

  // Get the total count of records
  let totalCount = await features.totalCountPromise;

  console.log("RecordsEstimate", totalCount);

  res.status(200).json({
    status: "success",
    resource: "userAccountDetails",
    RecordsEstimate: totalCount,
    action: "getAll",
    length: userAccountDetails.length,
    data: userAccountDetails,
  });
});

export const postUserAccountDetails = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars(req.body);
  if (req.files) {
    let filesArrayOfObjects = ProcessMultipleFilesArrayOfObjects(req);
    req.body.files = filesArrayOfObjects;
  }

  const userAccountDetails = await UserAccountDetails.create(req.body);

  res.status(201).json({
    status: "success",
    resource: "userAccountDetails",
    userAccountDetails: "created",
    length: userAccountDetails.length,
    data: userAccountDetails,
  });
});


export const getUserAccountDetails = asyncErrorHandler(async (req, res, next) => {
  const userAccountDetails = await UserAccountDetails.findById(req.params._id);
  if (!userAccountDetails) {
    const error = new CustomError(
      `UserAccountDetails with ID: ${req.params._id} is not found`,
      404,
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "userAccountDetails",
    userAccountDetails: "created",
    length: userAccountDetails.length,
    data: userAccountDetails,
  });
});


export const patchUserAccountDetails = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars(req.body);
  const userAccountDetails = await UserAccountDetails.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!userAccountDetails) {
    const error = new CustomError(
      `UserAccountDetails with ID: ${req.params._id} is not found`,
      404,
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "userAccountDetails",
    action: "patch",
    length: userAccountDetails.length,
    data: userAccountDetails,
  });
});


export const putUserAccountDetails = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars(req.body);
  const userAccountDetails = await UserAccountDetails.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!userAccountDetails) {
    const error = new CustomError(
      `UserAccountDetails with ID: ${req.params._id} is not available`,
      404,
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "userAccountDetails",
    action: "put",
    length: userAccountDetails.length,
    data: userAccountDetails,
  });
});


export const deleteUserAccountDetails = asyncErrorHandler(async (req, res, next) => {
  const userAccountDetails = await UserAccountDetails.findByIdAndDelete(
    req.params._id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!userAccountDetails) {
    const error = new CustomError(
      `UserAccountDetails with ID: ${req.params._id} is not available`,
      404,
    );
    return next(error);
  }

  if (userAccountDetails.files) {
    UnlinkMultipleFiles(userAccountDetails.files, req);
  }

  res.status(204).json({
    status: "success",
    resource: "userAccountDetails",
    message: "deleted",
  });
});



