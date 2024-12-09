// Importing modules
import AdVideo from "../Models/advideos.js";
import AdPerformanceData from "../Models/AdPerformanceData.js";
import ApiFeatures from "../Utils/ApiFeatures.js";
import asyncErrorHandler from "../Utils/asyncErrorHandler.js";
import CustomError from "../Utils/CustomError.js";
import paginationCrossCheck from "../Utils/paginationCrossCheck.js";
import UnlinkMultipleFiles from "../Utils/UnlinkMultipleFiles.js";
import ProcessMultipleFilesArrayOfObjects from "../Utils/ProcessMultipleFilesArrayOfObjects.js";
import HTMLspecialChars from "../Utils/HTMLspecialChars.js";
import GetUserDetailsFromHeader from "../Utils/GetUserDetailsFromHeader.js";
import updateResponseFilePathsWithHostName from "../Utils/updateResponseFilePathsWithHostName.js";
import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";
import decodeAndVerifyData from "../Utils_Enc/decodeAndVerifyData.js";
import limitEncDetaFromServe from "../Utils_Enc/limitEncDetaFromServe.js";



import mongoose from "mongoose";

// Helper method to track today's performance using transactions
async function trackEveryDaysPerformanceOnAdPerformanceData(
  adId,
  impressions,
  CTA,
  conversions
) {
  const session = await mongoose.startSession(); // Start a MongoDB session
  session.startTransaction(); // Start a transaction

  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  try {
    // Find the ad performance document for the specific adId
    const adPerformance = await AdPerformanceData.findOne({ adId }).session(
      session
    );

    // If the document doesn't exist, create it
    if (!adPerformance) {
      await AdPerformanceData.create(
        [
          {
            adId,
            data: [
              {
                date: new Date(),
                impressions,
                CTA,
                conversions,
              },
            ],
          },
        ],
        { session }
      );
      console.log("Created new ad performance entry:", adId);

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      return;
    }

    // Check if today's entry already exists in the data array
    const todayData = adPerformance.data.find((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfDay && entryDate <= endOfDay;
    });

    if (todayData) {
      // Update today's performance metrics
      todayData.impressions += impressions;
      todayData.CTA += CTA;
      todayData.conversions += conversions;
    } else {
      // Create a new entry for today if it doesn't exist
      adPerformance.data.push({
        date: new Date(),
        impressions,
        CTA,
        conversions,
      });
    }

    // Save the changes
    await adPerformance.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    console.log("Updated ad performance entry:", adId);
  } catch (error) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    console.error("Error tracking ad performance:", error);
  } finally {
    // End the session
    session.endSession();
  }
}


const trackTodaysPerformance = async function (
  adVideo,
  impressions = 0,
  clicks = 0,
  conversions = 0,
  session
) {
  const today = new Date().toISOString().split("T")[0]; // Get the current date in YYYY-MM-DD format

  if (!session) {
    throw new Error("A MongoDB session is required to apply ACID principles.");
  }

  try {
    // Start a transaction if it hasn't been started already
    if (!session.inTransaction()) {
      await session.startTransaction();
    }

    // Check if today's performance exists and reset if it's a new day
    if (
      !adVideo.todaysPerformance.date ||
      adVideo.todaysPerformance.date !== today
    ) {
      // Reset today's performance if it's a new day or not initialized
      adVideo.todaysPerformance = {
        date: today,
        impressions: impressions,
        clicks: clicks,
        conversions: conversions,
      };
    } else {
      // Increment today's values if it's the same day
      adVideo.todaysPerformance.impressions += impressions;
      adVideo.todaysPerformance.clicks += clicks;
      adVideo.todaysPerformance.conversions += conversions;
    }

    // Save the updated ad video document using the session
    await adVideo.save({ session });

    // Commit the transaction if everything is successful
    await session.commitTransaction();

    console.log("Performance tracked successfully.");
  } catch (error) {
    console.error("Error tracking today’s performance:", error);

    // If there's an error, abort the transaction to ensure Atomicity
    await session.abortTransaction();

    throw new Error("Failed to update today's performance");
  } finally {
    // Ensure the session is ended to release the connection
    session.endSession();
  }
};



// Exporting functions

// Get all ad videos
export const getAdVideos = asyncErrorHandler(async (req, res, next) => {
  let features = new ApiFeatures(AdVideo.find(), req.query)
    .countDocuments()
    .filter()
    .sort()
    .limitfields()
    .limitfields2()
    .paginate();

  // Execute the query and get the result
  let adVideos = await features.query;

  // Get the total count of records
  let totalCount = await features.totalCountPromise;

  console.log("RecordsEstimate", totalCount);

  adVideos = updateResponseFilePathsWithHostName(adVideos, process.env.HOST);

  res.status(200).json({
    status: "success",
    resource: "adVideos",
    RecordsEstimate: totalCount,
    action: "getAll",
    length: adVideos.length,
    data: adVideos,
  });
});

// Create a new ad video
export const postAdVideo = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  if (req.files) {
    let filesArrayOfObjects = ProcessMultipleFilesArrayOfObjects(req);
    req.body.files = filesArrayOfObjects;
  }

  const adVideo = await AdVideo.create(req.body);

  // Initialize performance data
  const adPerformanceData = await AdPerformanceData.create({
    adId: adVideo._id,
    data: [],
  });

  res.status(201).json({
    status: "success",
    resource: "adVideos",
    adVideo: "created",
    length: adVideo.length,
    data: adVideo,
    performanceData: adPerformanceData,
  });
});


// Update performance data for impressions
export const postAdImpression = asyncErrorHandler(async (req, res, next) => {
  const { adId } = req.body;
  const session = await mongoose.startSession(); // Start a session

  try {
    session.startTransaction(); // Start a transaction

    const adVideo = await AdVideo.findById(adId).session(session);
    if (!adVideo) {
      await session.abortTransaction();
      return next(
        new CustomError(`AdVideo with ID: ${adId} is not found`, 404)
      );
    }

    // Call the standalone trackTodaysPerformance function with the session for ACID handling
    await trackTodaysPerformance(adVideo, 1, 0, 0, session); // 1 impression, no CTA, no conversions
    await trackEveryDaysPerformanceOnAdPerformanceData(adId, 1, 0, 0); // Update AdPerformanceData

    // Commit the transaction
    await session.commitTransaction();

    res.status(200).json({
      status: "success",
      message: "Ad impressions logged",
    });
  } catch (error) {
    // Rollback in case of failure
    await session.abortTransaction();
    console.error("Error logging ad impressions:", error);
    next(error);
  } finally {
    // End the session
    session.endSession();
  }
});



// Update performance data for CTA clicks
export const postAdCTAclick = asyncErrorHandler(async (req, res, next) => {
  const { adId } = req.body;
  const session = await mongoose.startSession(); // Start a session
  session.startTransaction(); // Start a transaction

  try {
    const adVideo = await AdVideo.findById(adId).session(session);
    if (!adVideo) {
      await session.abortTransaction();
      return next(
        new CustomError(`AdVideo with ID: ${adId} is not found`, 404)
      );
    }

    // Call the standalone trackTodaysPerformance function
    await trackTodaysPerformance(adVideo, 0, 1, 0, session); // No impressions, 1 CTA click, no conversions
    await trackEveryDaysPerformanceOnAdPerformanceData(adId, 0, 1, 0); // Update AdPerformanceData

    // Commit the transaction
    await session.commitTransaction();
    res.status(200).json({
      status: "success",
      message: "Ad CTA click logged",
    });
  } catch (error) {
    // Rollback in case of failure
    await session.abortTransaction();
    console.error("Error logging CTA click:", error);
    next(error);
  } finally {
    // End the session
    session.endSession();
  }
});



// Update performance data for conversions
export const postAdConversion = asyncErrorHandler(async (req, res, next) => {
  const { adId } = req.body;
  const session = await mongoose.startSession(); // Start a session
  session.startTransaction(); // Start a transaction

  try {
    const adVideo = await AdVideo.findById(adId).session(session);
    if (!adVideo) {
      await session.abortTransaction();
      return next(
        new CustomError(`AdVideo with ID: ${adId} is not found`, 404)
      );
    }

    // Call the standalone trackTodaysPerformance function
    await trackTodaysPerformance(adVideo, 0, 0, 1, session); // No impressions, no CTA clicks, 1 conversion
    await trackEveryDaysPerformanceOnAdPerformanceData(adId, 0, 0, 1); // Update AdPerformanceData

    // Commit the transaction
    await session.commitTransaction();
    res.status(200).json({
      status: "success",
      message: "Ad conversion logged",
    });
  } catch (error) {
    // Rollback in case of failure
    await session.abortTransaction();
    console.error("Error logging ad conversion:", error);
    next(error);
  } finally {
    // End the session
    session.endSession();
  }
});



// Get a specific ad video
export const getAdVideo = asyncErrorHandler(async (req, res, next) => {
  let adVideo = await AdVideo.findById(req.params._id);
  if (!adVideo) {
    return next(
      new CustomError(`AdVideo with ID: ${req.params._id} is not found`, 404)
    );
  }

  adVideo = updateResponseFilePathsWithHostName(adVideo, process.env.HOST);

  res.status(200).json({
    status: "success",
    resource: "adVideo",
    adVideo: "retrieved",
    length: adVideo.length,
    data: adVideo,
  });
});

// Update an existing ad video
export const patchAdVideo = asyncErrorHandler(async (req, res, next) => {
  const { adId } = req.params;

  const adVideo = await AdVideo.findByIdAndUpdate(adId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!adVideo) {
    return next(new CustomError(`AdVideo with ID: ${adId} is not found`, 404));
  }

  res.status(200).json({
    status: "success",
    resource: "adVideo",
    adVideo: "updated",
    length: adVideo.length,
    data: adVideo,
  });
});

export const putAdVideo = asyncErrorHandler(async (req, res, next) => {
  const { adId } = req.params;

  const adVideo = await AdVideo.findByIdAndUpdate(adId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!adVideo) {
    return next(new CustomError(`AdVideo with ID: ${adId} is not found`, 404));
  }

  res.status(200).json({
    status: "success",
    resource: "adVideo",
    adVideo: "updated",
    length: adVideo.length,
    data: adVideo,
  });
});

// Delete an ad video
export const deleteAdVideo = asyncErrorHandler(async (req, res, next) => {
  const { adId } = req.params;

  const adVideo = await AdVideo.findByIdAndDelete(adId);
  if (!adVideo) {
    return next(new CustomError(`AdVideo with ID: ${adId} is not found`, 404));
  }

  res.status(204).json({
    status: "success",
    message: "Ad video deleted successfully",
  });
});


export const filesToAdVideo = asyncErrorHandler(async (req, res, next) => {
  SetUploadsfilePathHandler(req, `./uploads/AdVideo`);
  next();
});

// Function to check if user coordinates match the geography criteria of the ad
const checkGeographicalMatch = (geography, userCoordinates) => {
    const { type, coordinates, radius } = geography;

    if (type === 'Point') {
        // For Point type, check if the user is within the specified radius
        const [adLongitude, adLatitude] = coordinates[0];
        const distance = calculateDistance(adLatitude, adLongitude, userCoordinates[1], userCoordinates[0]); // assuming [longitude, latitude]
        return distance <= radius;
    } else if (type === 'Polygon') {
        // For Polygon type, use a point-in-polygon algorithm
        return isPointInPolygon(userCoordinates, coordinates);
    }
    return false;
};



// Function to determine which ad to send to a user based on their profile
export const getTargetedAd = asyncErrorHandler(async (req, res, next) => {
  // Validate user data
  let user = req.user;
  let userLocationCoorinate = req.headers.userLocationCoorinate;
  if (!user || !user.dateOfBirth || !user.gender || !user.location) {
    return res.status(400).json({ error: "Invalid user data." });
  }

  const today = new Date();
  const userAge = calculateAge(user.dateOfBirth);
  const userGender = user.gender;
  const userLocation = userLocationCoorinate;
  const userInterests = user.interests || [];
  const userBehaviors = user.behaviors || [];

  // Query the ad collection for targeted ads based on user profile and conditions
  const targetedAds = await AdVideo.aggregate([
    {
      $match: {
        releaseDate: { $lte: today },
        endDate: { $gte: today },
        "todaysPerformance.impressions": {
          $lt: { $subtract: ["$dailyPersonsToReachMax", 20] },
        },
        $or: [
          { dailyPersonsToReachMax: { $gte: userAge } },
          { dailyPersonsToReachMin: { $lte: userAge } },
        ],
        $or: [
          { "targetAudience.demographics.gender": "All" },
          { "targetAudience.demographics.gender": userGender },
        ],
        $or: [
          { "targetAudience.interests": { $in: userInterests } },
          { "targetAudience.behaviors": { $in: userBehaviors } },
        ],
      },
    },
    {
      $addFields: {
        distanceFromUser: {
          $cond: [
            { $eq: ["$targetAudience.geography.type", "Point"] },
            {
              $let: {
                vars: {
                  targetLocation: "$targetAudience.geography.coordinates",
                },
                in: getDistance(userLocation, "$$targetLocation"),
              },
            },
            -1,
          ],
        },
      },
    },
    {
      $match: {
        $or: [
          {
            "targetAudience.geography.type": "Polygon",
            $expr: {
              $function: {
                body: isPointInPolygon,
                args: [userLocation, "$targetAudience.geography.coordinates"],
                lang: "js",
              },
            },
          },
          {
            "targetAudience.geography.type": "Point",
            distanceFromUser: { $lte: "$targetAudience.geography.radius" },
          },
        ],
      },
    },
    {
      $sample: { size: 1 },
    },
    {
      $project: {
        title: 1,
        description: 1,
        link: 1,
        impressions: "$todaysPerformance.impressions",
        dailyPersonsToReachMax: 1,
        skipAllowedAfter: 1,
        callToAction: 1,
      },
    },
  ]);

  // Return the targeted ad, or null if none found
  return res.status(200).json(targetedAds.length > 0 ? targetedAds[0] : null);
});


// Helper function to calculate user's age from their date of birth
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function getDistance(userLocation, targetLocation) {
  const [lon1, lat1] = userLocation;
  const [lon2, lat2] = targetLocation;

  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const R = 6371e3; // Earth's radius in meters
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
}


function isPointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

