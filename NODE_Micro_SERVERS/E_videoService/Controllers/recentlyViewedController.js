// Importing modules
import ViewedWithinTime from "../Models/recentlyViewed.js";
import ApiFeatures from "../Utils/ApiFeatures.js";
import asyncErrorHandler from "../Utils/asyncErrorHandler.js";
import CustomError from "../Utils/CustomError.js";
import paginationCrossCheck from "../Utils/paginationCrossCheck.js";
import UnlinkMultipleFiles from "../Utils/UnlinkMultipleFiles.js";
import ProcessMultipleFilesArrayOfObjects from "../Utils/ProcessMultipleFilesArrayOfObjects.js";
import HTMLspecialChars from "../Utils/HTMLspecialChars.js";
import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";
import decodeAndVerifyData from "../Utils_Enc/decodeAndVerifyData.js";
import limitEncDetaFromServe from "../Utils_Enc/limitEncDetaFromServe.js";
import getNextServerIndex from "../Utils/LoadBalancerManual.js";

const AuthHOST = () => {
  let url;

  if (process.env.NODE_ENV === "development") {
    url = `http://${process.env.DEV_AUTH_HOST}`;
  } else if (
    process.env.NODE_ENV === "production" &&
    process.env.PROD_TEST === "true"
  ) {
    url = `http://${process.env.AUTH_HOST}`;
  } else {
    url = `http://${process.env.AUTH_HOST}`;

    // Split and modify the URL
    const [firstPart, secondPart] = url.split(/\.(.+)/);

    // Assuming `getNextServerIndex` is a function that returns a string or number
    url = `${firstPart}${getNextServerIndex("AUTH_HOST")}.${secondPart}`;
  }

  return url;
};

// Exporting functions
export const getViewedWithinTimes = asyncErrorHandler(
  async (req, res, next) => {
    let features = new ApiFeatures(ViewedWithinTime.find(), req.query)
      .countDocuments()
      .filter()
      .sort()
      .limitfields()
      .limitfields2()
      .paginate();

    // Execute the query and get the result
    let viewedWithinTime = await features.query;

    // Get the total count of records
    let totalCount = await features.totalCountPromise;

    console.log("RecordsEstimate", totalCount);

    res.status(200).json({
      status: "success",
      resource: "viewedWithinTime",
      RecordsEstimate: totalCount,
      action: "getAll",
      length: viewedWithinTime.length,
      data: viewedWithinTime,
    });
  }
);

export const postViewedWithinTime = asyncErrorHandler(
  async (req, res, next) => {
    req.body = HTMLspecialChars.encode(req.body);
    if (req.files) {
      let filesArrayOfObjects = ProcessMultipleFilesArrayOfObjects(req);
      req.body.files = filesArrayOfObjects;
    }

    const viewedWithinTime = await ViewedWithinTime.create(req.body);

    res.status(201).json({
      status: "success",
      resource: "viewedWithinTime",
      action: "created",
      length: viewedWithinTime.length,
      data: viewedWithinTime,
    });
  }
);

export const getViewedWithinTime = asyncErrorHandler(async (req, res, next) => {
  const viewedWithinTime = await ViewedWithinTime.findById(req.params._id);
  if (!viewedWithinTime) {
    const error = new CustomError(
      `ViewedWithinTime with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "viewedWithinTime",
    action: "getOne",
    length: viewedWithinTime.length,
    data: viewedWithinTime,
  });
});

export const patchViewedWithinTime = asyncErrorHandler(
  async (req, res, next) => {
    req.body = HTMLspecialChars.encode(req.body);
    const viewedWithinTime = await ViewedWithinTime.findByIdAndUpdate(
      req.params._id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!viewedWithinTime) {
      const error = new CustomError(
        `ViewedWithinTime with ID: ${req.params._id} is not found`,
        404
      );
      return next(error);
    }

    res.status(200).json({
      status: "success",
      resource: "viewedWithinTime",
      action: "patch",
      length: viewedWithinTime.length,
      data: viewedWithinTime,
    });
  }
);

export const putViewedWithinTime = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  const viewedWithinTime = await ViewedWithinTime.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!viewedWithinTime) {
    const error = new CustomError(
      `ViewedWithinTime with ID: ${req.params._id} is not available`,
      404
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "viewedWithinTime",
    action: "put",
    length: viewedWithinTime.length,
    data: viewedWithinTime,
  });
});

export const deleteViewedWithinTime = asyncErrorHandler(
  async (req, res, next) => {
    const viewedWithinTime = await ViewedWithinTime.findByIdAndDelete(
      req.params._id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!viewedWithinTime) {
      const error = new CustomError(
        `ViewedWithinTime with ID: ${req.params._id} is not available`,
        404
      );
      return next(error);
    }

    if (viewedWithinTime.files) {
      UnlinkMultipleFiles(viewedWithinTime.files, req);
    }

    res.status(204).json({
      status: "success",
      resource: "viewedWithinTime",
      message: "deleted",
    });
  }
);
