// Importing modules
import Support from "../Models/support.js";
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
export const getSupports = asyncErrorHandler(
  async (req, res, next) => {
    let features = new ApiFeatures(Support.find(), req.query)
      .countDocuments()
      .filter()
      .sort()
      .limitfields()
      .limitfields2()
      .paginate();

    // Execute the query and get the result
    let supports = await features.query;

    // Get the total count of records
    let totalCount = await features.totalCountPromise;

    console.log("RecordsEstimate", totalCount);

    res.status(200).json({
      status: "success",
      resource: "supports",
      RecordsEstimate: totalCount,
      action: "getAll",
      length: supports.length,
      data: supports,
    });
  }
);


export const postSupport = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars(req.body);
  if (req.files) {
    let filesArrayOfObjects = ProcessMultipleFilesArrayOfObjects(req);
    req.body.files = filesArrayOfObjects;
  }

  const support = await Support.create(req.body);

  res.status(201).json({
    status: "success",
    resource: "supports",
    support: "retrieved",
    length: support.length,
    data: support,
  });
});


export const getSupport = asyncErrorHandler(async (req, res, next) => {
  const support = await Support.findById(req.params._id);
  if (!support) {
    const error = new CustomError(
      `Support with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "support",
    support: "retrieved",
    length: support.length,
    data: support,
  });
});


export const patchSupport = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars(req.body);
  const support = await Support.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!support) {
    const error = new CustomError(
      `Support with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "support",
    action: "patch",
    length: support.length,
    data: support,
  });
});


export const putSupport = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars(req.body);
  const support = await Support.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!support) {
    const error = new CustomError(
      `Support with ID: ${req.params._id} is not available`,
      404
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "support",
    action: "put",
    length: support.length,
    data: support,
  });
});


export const deleteSupport = asyncErrorHandler(async (req, res, next) => {
  const support = await Support.findByIdAndDelete(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!support) {
    const error = new CustomError(
      `Support with ID: ${req.params._id} is not available`,
      404
    );
    return next(error);
  }

  if (support.files) {
    UnlinkMultipleFiles(support.files, req);
  }

  res.status(204).json({
    status: "success",
    resource: "support",
    action: "delete",
    message: "deleted",
  });
});


export const filesToSupport = asyncErrorHandler(async (req, res, next) => {
  SetUploadsfilePathHandler(req, `./uploads/support`);
  next();
});


