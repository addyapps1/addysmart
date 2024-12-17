// Importing modules
import E_Video from "../Models/externalVideo.js";
import RecentlyViewed from "../Models/recentlyViewed.js";
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
import SetUploadsfilePathHandler from "../Utils/SetUploadsfilePathHandler.js";
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

// Middleware to delete records older than 24 hours and filter out content the user has viewed within the last 24 hours
const ViewedContentIdArray = asyncErrorHandler(async (req, res, next) => {
  // Delete records older than 24 hours
  await RecentlyViewed.deleteMany({
    nextViewTime: { $lte: Date.now() },
  });

  // Find content the user has viewed within the last 24 hours
  const viewedContent = await RecentlyViewed.find({
    userID: req.user._id,
    nextViewTime: { $gte: Date.now() },
  }).select("videoId -_id");

  console.log("viewedContent", viewedContent);

  // Map to extract an array of content IDs
  // req.viewedContentIds = viewedContent.map((item) => item.videoId.toString());
  req.viewedContentIds = viewedContent.map((item) => item.videoId);

  next();
});

// Controller to serve random videos tasks, excluding content viewed in the past 24 hours
// Controller to serve random videos tasks, excluding content viewed in the past 24 hours
export const getE_VideosTask = asyncErrorHandler(async (req, res, next) => {
  // Ensure ViewedContentIdArray middleware is executed first
  await ViewedContentIdArray(req, res, next);

  // Define the number of random results to retrieve
  const numRandomResults = 12;

  console.log("req.viewedContentIds", req.viewedContentIds);

  // Build the aggregation pipeline
  const pipeline = [
    {
      $match: {
        vidStatus: "active", // Only active videos
      },
    },
    // Exclude the viewed content from the results
    {
      $match: {
        _id: { $nin: req.viewedContentIds }, // Filter out viewed content IDs
      },
    },
    // Randomly select 12 documents
    { $sample: { size: numRandomResults } },
    // Exclude the 'watchcode' field
    {
      $project: {
        watchcode: 0, // Exclude 'watchcode' field from the result
      },
    },
  ];

  // Execute the aggregation pipeline
  let randomVideos = await E_Video.aggregate(pipeline);

  // Process each video and update it with the verified version
  randomVideos = await Promise.all(
    randomVideos.map(async (data) => {
      data = await decodeAndVerifyData(data);
      data = await limitEncDetaFromServe(data); // Verify the video data
      let decodeFields = ["instructions", "link"];
      data = HTMLspecialChars.decode(data, decodeFields);
      return data; // Return the verified video
    })
  );

  // Send the response back to the client
  res.status(200).json({
    status: "success",
    resource: "e_Video",
    action: "getRandom",
    length: randomVideos.length,
    data: randomVideos,
  });
});

// Exporting functions
export const getAllE_Videos = asyncErrorHandler(async (req, res, next) => {
  let features = new ApiFeatures(E_Video.find(), req.query)
    .countDocuments()
    .filter()
    .sort()
    .limitfields()
    .limitfields2()
    .paginate();

  // Execute the query and get the result
  let e_Video = await features.query;

  // Get the total count of records
  let totalCount = await features.totalCountPromise;

  // console.log("RecordsEstimate", totalCount);
  // console.log("e_Video b4 decode", e_Video);

  let decodeFields = ["instructions", "link"];
  e_Video = HTMLspecialChars.decode(e_Video, decodeFields);
  console.log("e_Video afta", e_Video);

  res.status(200).json({
    status: "success",
    resource: "e_Video",
    RecordsEstimate: totalCount,
    action: "getAll",
    length: e_Video.length,
    data: e_Video,
  });
});

export const postE_Video = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  // console.log("postE_Video req.user", req.user);
  if (req.files) {
    let filesArrayOfObjects = ProcessMultipleFilesArrayOfObjects(req);
    req.body.files = filesArrayOfObjects;
  }

  // console.log("req.user ", req.user, "req.user._id ", req.user._id);
  req.body.createdBy = req.user._id;
  let e_Video = await E_Video.create(req.body);

  let decodeFields = ["instructions", "link"];
  e_Video = HTMLspecialChars.decode(e_Video, decodeFields);

  res.status(201).json({
    status: "success",
    resource: "e_Video",
    e_Video: "created",
    length: e_Video.length,
    data: e_Video,
  });
});

export const getE_VideoAndUpdateRecentlyViewed = asyncErrorHandler(
  async (req, res, next) => {
    // console.log("RESPONS OK0");
    // console.log("req.params.videoID", req.params.videoID);
    const e_Video = await E_Video.findById(req.params.videoID);
    if (!e_Video) {
      const error = new CustomError(
        `E_Video with ID: ${req.params._id} is not found`,
        404
      );
      return next(error);
    }

    let rViewed = {
      videoId: req.params.videoID,
      userID: req.user._id,
    };

    // console.log("RESPONS OK1");

    const recentlyViewed = await RecentlyViewed.create(rViewed);
    // console.log("recentlyViewed.nextViewTime", recentlyViewed.nextViewTime);

    e_Video.nextViewTime = recentlyViewed.nextViewTime;
    // console.log("e_Video.nextViewTime ", e_Video.nextViewTime);
    // console.log("RESPONS OK2");

    let e_VideoClone = e_Video.toObject ? e_Video.toObject() : { ...e_Video };

    e_VideoClone.nextViewTime = recentlyViewed.nextViewTime;

    let decodeFields = ["instructions", "link"];
    e_VideoClone = HTMLspecialChars.decode(e_VideoClone, decodeFields);

    res.status(200).json({
      status: "success",
      resource: "e_Video",
      e_Video: "created",
      length: e_Video.length,
      data: e_VideoClone,
    });
  }
);

export const getE_Video = asyncErrorHandler(async (req, res, next) => {
  let e_Video = await E_Video.findById(req.params._id);

  if (!e_Video) {
    const error = new CustomError(
      `E_Video with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }
  e_Video = await decodeAndVerifyData(e_Video);
  e_Video = await limitEncDetaFromServe(e_Video);

  let decodeFields = ["instructions", "link"];
  e_Video = HTMLspecialChars.decode(e_Video, decodeFields);

  res.status(200).json({
    status: "success",
    resource: "e_Video",
    e_Video: "created",
    length: e_Video.length,
    data: e_Video,
  });
});

export const patchE_Video = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  let e_Video = await E_Video.findByIdAndUpdate(req.params._id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!e_Video) {
    const error = new CustomError(
      `E_Video with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }

  e_Video = await limitEncDetaFromServe(e_Video);

  // console.log("B4 decode");
  let decodeFields = ["instructions", "link"];
  e_Video = HTMLspecialChars.decode(e_Video, decodeFields);
  // console.log("AFTA decode");

  res.status(200).json({
    status: "success",
    resource: "e_Video",
    action: "patch",
    length: e_Video.length,
    data: e_Video,
  });
});

export const putE_Video = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  let e_Video = await E_Video.findByIdAndUpdate(req.params._id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!e_Video) {
    const error = new CustomError(
      `E_Video with ID: ${req.params._id} is not available`,
      404
    );
    return next(error);
  }

  // console.log(" e_Video", e_Video);
  // console.log("B4 decode");
  let decodeFields = ["instructions", "link"];
  e_Video = HTMLspecialChars.decode(e_Video, decodeFields);
  // console.log("AFTA decode");

  res.status(200).json({
    status: "success",
    resource: "e_Video",
    action: "put",
    length: e_Video.length,
    data: e_Video,
  });
});

export const deleteE_Video = asyncErrorHandler(async (req, res, next) => {
  const e_Video = await E_Video.findByIdAndDelete(req.params._id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!e_Video) {
    const error = new CustomError(
      `E_Video with ID: ${req.params._id} is not available`,
      404
    );
    return next(error);
  }

  if (e_Video.files) {
    UnlinkMultipleFiles(e_Video.files, req);
  }

  res.status(204).json({
    status: "success",
    resource: "e_Video",
    message: "deleted",
  });
});

export const filesToE_VideosPath = asyncErrorHandler(async (req, res, next) => {
  SetUploadsfilePathHandler(req, `./uploads/e_Videos`);
  next();
});
