// Importing modules
import AffiliateProduct from "../Models/affiliateProducts.js";
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
import retryACIDTransaction from "../Utils/RetryACIDTransaction.js"; // Import the retry utility
import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";
import decodeAndVerifyData from "../Utils_Enc/decodeAndVerifyData.js";
import limitEncDetaFromServe from "../Utils_Enc/limitEncDetaFromServe.js";




// Exporting functions
export const getAffiliateProducts = asyncErrorHandler(
  async (req, res, next) => {
    let features = new ApiFeatures(AffiliateProduct.find(), req.query)
      .countDocuments()
      .filter()
      .sort()
      .limitfields()
      .limitfields2()
      .paginate();

    // Execute the query and get the result
    let affiliateProducts = await features.query;

    // Get the total count of records
    let totalCount = await features.totalCountPromise;

    console.log("RecordsEstimate", totalCount);

    res.status(200).json({
      status: "success",
      resource: "affiliateProducts",
      RecordsEstimate: totalCount,
      action: "getAll",
      length: affiliateProducts.length,
      data: affiliateProducts,
    });
  }
);


export const postAffiliateProduct = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  if (req.files) {
    let filesArrayOfObjects = ProcessMultipleFilesArrayOfObjects(req);
    req.body.files = filesArrayOfObjects;
  }

  const affiliateProduct = await AffiliateProduct.create(req.body);

  res.status(201).json({
    status: "success",
    resource: "affiliateProducts",
    affiliateProduct: "retrieved",
    length: affiliateProduct.length,
    data: affiliateProduct,
  });
});

export const getAffiliateProduct = asyncErrorHandler(async (req, res, next) => {
  const affiliateProduct = await AffiliateProduct.findById(req.params._id);
  if (!affiliateProduct) {
    const error = new CustomError(
      `AffiliateProduct with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "affiliateProduct",
    affiliateProduct: "retrieved",
    length: affiliateProduct.length,
    data: affiliateProduct,
  });
});

export const patchAffiliateProduct = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  const affiliateProduct = await AffiliateProduct.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!affiliateProduct) {
    const error = new CustomError(
      `AffiliateProduct with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "affiliateProduct",
    action: "patch",
    length: affiliateProduct.length,
    data: affiliateProduct,
  });
});

export const putAffiliateProduct = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  const affiliateProduct = await AffiliateProduct.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!affiliateProduct) {
    const error = new CustomError(
      `AffiliateProduct with ID: ${req.params._id} is not available`,
      404
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "affiliateProduct",
    action: "put",
    length: affiliateProduct.length,
    data: affiliateProduct,
  });
});

export const deleteAffiliateProduct = asyncErrorHandler(async (req, res, next) => {
  const affiliateProduct = await AffiliateProduct.findByIdAndDelete(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!affiliateProduct) {
    const error = new CustomError(
      `AffiliateProduct with ID: ${req.params._id} is not available`,
      404
    );
    return next(error);
  }

  if (affiliateProduct.files) {
    UnlinkMultipleFiles(affiliateProduct.files, req);
  }

  res.status(204).json({
    status: "success",
    resource: "affiliateProduct",
    action: "delete",
    message: "deleted",
  });
});

export const filesToAffiliateProduct = asyncErrorHandler(async (req, res, next) => {
  SetUploadsfilePathHandler(req, `./uploads/affiliateProduct`);
  next();
});

export const checkBrut = asyncErrorHandler(async (req, res, next) => {
  SetUploadsfilePathHandler(req, `./uploads/affiliateProduct`);
  next();
});
