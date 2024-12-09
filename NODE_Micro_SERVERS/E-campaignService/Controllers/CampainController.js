// Importing necessary modules for the campaign performance functionality
import Campaign from "../Models/Campaign.js";
import CampaignPerformanceData from "../Models/CampaignPerformanceData.js";
import ApiFeatures from "../Utils/ApiFeatures.js";
import asyncErrorHandler from "../Utils/asyncErrorHandler.js";
import CustomError from "../Utils/CustomError.js";
import paginationCrossCheck from "../Utils/paginationCrossCheck.js";
import UnlinkMultipleFiles from "../Utils/UnlinkMultipleFiles.js";
import ProcessMultipleFilesArrayOfObjects from "../Utils/ProcessMultipleFilesArrayOfObjects.js";
import HTMLspecialChars from "../Utils/HTMLspecialChars.js";
import GetUserDetailsFromHeader from "../Utils/GetUserDetailsFromHeader.js";
import updateResponseFilePathsWithHostName from "../Utils/updateResponseFilePathsWithHostName.js";
import mongoose from "mongoose";
import retryACIDTransaction from "../Utils/RetryACIDTransaction.js"; // Import the retry utility
import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";
import decodeAndVerifyData from "../Utils_Enc/decodeAndVerifyData.js";
import limitEncDetaFromServe from "../Utils_Enc/limitEncDetaFromServe.js";



/**
 * Track today's performance
 */

const trackTodaysPerformance = async (
  campaignDoc,
  followersGained = 0,
  subscribersGained = 0,
  totalViews = 0,
  impressions = 0,
  clicks = 0,
  conversions = 0,
  session
) => {
  // Function that handles the core logic for tracking today's performance
  const trackPerformanceWithRetry = async (session) => {
    try {
      // Get today's date (at midnight)
      const todayDate = new Date().setHours(0, 0, 0, 0);

      // Find today's performance data
      let todayEngagement = campaignDoc.performance.dailyEngagements.find(
        (engagement) => engagement.date.getTime() === todayDate
      );

      // If today's data doesn't exist, reset dailyEngagements and add a new entry
      if (!todayEngagement) {
        // Reset the dailyEngagements array
        campaignDoc.performance.dailyEngagements = [
          {
            date: todayDate,
            followersGained,
            subscribersGained,
            totalViews,
            impressions,
            clicks,
            conversions,
          },
        ];
      } else {
        // If today's engagement exists, update it
        todayEngagement.followersGained += followersGained;
        todayEngagement.subscribersGained += subscribersGained;
        todayEngagement.totalViews += totalViews;
        todayEngagement.impressions += impressions;
        todayEngagement.clicks += clicks;
        todayEngagement.conversions += conversions;
      }

      // Update the total engagement counts
      campaignDoc.performance.totalEngagements.followersGained +=
        followersGained;
      campaignDoc.performance.totalEngagements.subscribersGained +=
        subscribersGained;
      campaignDoc.performance.totalEngagements.totalViews += totalViews;
      campaignDoc.performance.totalEngagements.impressions += impressions;
      campaignDoc.performance.totalEngagements.clicks += clicks;
      campaignDoc.performance.totalEngagements.conversions += conversions;

      // Save the updated document
      await campaignDoc.save({ session });

      return campaignDoc;
    } catch (error) {
      throw new CustomError(
        `Failed to track today's performance: ${error.message}`,
        500
      );
    }
  };

  // Retry mechanism with ACID transaction
  return await retryACIDTransaction(trackPerformanceWithRetry);
};


 /**
  * Utility function to track performance data with dynamic input.
  * @param {String} campaignId - The ID of the campaign to update.
  * @param {Number} followersGained - Followers gained today.
  * @param {Number} subscribersGained - Subscribers gained today.
  * @param {Number} totalViews - Views gained today.
  * @param {Number} impressions - Impressions gained today.
  * @param {Number} clicks - Clicks gained today.
  * @param {Number} conversions - Conversions gained today.
  */
 const trackEveryDaysCampaignPerformanceData = asyncErrorHandler(
   async (
     campaignId,
     followersGained = 0,
     subscribersGained = 0,
     totalViews = 0,
     impressions = 0,
     clicks = 0,
     conversions = 0,
     session
   ) => {
     // Function to track today's performance with retry
     const trackPerformanceWithRetry = async (session) => {
       try {
         // Fetch or create today's campaign performance data
         let campaignData = await CampaignPerformanceData.findOne({
           campaignId,
         }).session(session);

         if (!campaignData) {
           throw new CustomError(
             `No campaign data found with ID: ${campaignId}`,
             404
           );
         }

         const todayDate = new Date().setHours(0, 0, 0, 0);

         // Find today's entry in data array
         let todayData = campaignData.data.find(
           (entry) => entry.date.getTime() === todayDate
         );

         // If today's data doesn't exist, reset and create a new entry
         if (!todayData) {
           campaignData.data = [
             {
               date: todayDate,
               totalFollowersGained: 0,
               totalSubscribersGained: 0,
               totalViews: 0,
               totalImpressions: 0,
               totalClicks: 0,
               totalConversions: 0,
             },
           ];
           todayData = campaignData.data[0]; // Reference the new entry
         }

         // Update today's performance data
         todayData.totalFollowersGained += followersGained;
         todayData.totalSubscribersGained += subscribersGained;
         todayData.totalViews += totalViews;
         todayData.totalImpressions += impressions;
         todayData.totalClicks += clicks;
         todayData.totalConversions += conversions;

         // Update the 'updated' timestamp
         campaignData.updated = Date.now();

         // Save the updated campaign data
         await campaignData.save({ session });

         return campaignData;
       } catch (error) {
         throw new CustomError(
           `Failed to track campaign data: ${error.message}`,
           500
         );
       }
     };

     // Create a session and use retry mechanism with the tracking function
     return await retryACIDTransaction(trackPerformanceWithRetry);
   }
 );




// Utility functions for location and campaign task targeting

const validateUserLocationCoordinate = (coordinate) => {
  if (!Array.isArray(coordinate) || coordinate.length !== 2) {
    throw new CustomError(
      "Invalid location coordinate format. Expected an array of [longitude, latitude].",
      400
    );
  }
  const [lon, lat] = coordinate;
  if (typeof lon !== "number" || typeof lat !== "number") {
    throw new CustomError(
      "Invalid coordinates. Longitude and latitude must be numbers.",
      400
    );
  }
  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
    throw new CustomError(
      "Coordinates out of range. Longitude must be between -180 and 180, latitude between -90 and 90.",
      400
    );
  }
};

const getDistance = (userLocation, targetLocation) => {
  const [lon1, lat1] = userLocation;
  const [lon2, lat2] = targetLocation;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const R = 6371; // Earth radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

/**
 * Function to check if a point is inside a polygon using the Ray-Casting algorithm.
 * @param {Array} point - The point to check, represented as [longitude, latitude].
 * @param {Array} polygon - The polygon, represented as an array of points [[lon1, lat1], [lon2, lat2], ...].
 * @returns {boolean} - Returns true if the point is inside the polygon, false otherwise.
 */
const isPointInPolygon = (point, polygon) => {
  let [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect =
      yi > y !== yj > y && // Check if the y-coordinate is between the vertices
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi; // Check if the x-coordinate is to the left of the edge

    if (intersect) inside = !inside; // Toggle the inside status
  }

  return inside;
};

// Example usage:
// const point = [5, 5]; // Point to check (longitude, latitude)
// const polygon = [
//   [0, 0],
//   [10, 0],
//   [10, 10],
//   [0, 10],
// ]; // Polygon coordinates

// console.log(isPointInPolygon(point, polygon)); // true if inside, false if outside


/**
 * Additional utility function to calculate user age
 */
const calculateAge = (dateOfBirth) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};





// Updated function to get targeted campaign task
export const getTargetedCampaignTask = asyncErrorHandler(
  async (req, res, next) => {
    const user = req.user;

    // Try to get user location coordinate from headers
    const userLocationCoordinateNew = req.headers.userLocationCoordinate;

    // Fallback to the saved user location if current location fails
    const userLocationCoordinate =
      userLocationCoordinateNew || (user.location && user.location.coordinates);

    // Validate user location coordinate
    let validLocation = false;

    // Default location in case both new and saved locations are invalid
    const defaultLocation = { type: "Point", coordinates: [0, 0] }; // Update with your appropriate default location
    let locationToUse = defaultLocation;

    // First, validate the new location coordinate
    try {
      if (userLocationCoordinateNew) {
        validateUserLocationCoordinate(userLocationCoordinateNew);
        validLocation = true; // If validation passes
        locationToUse = userLocationCoordinateNew; // Use the new location
      }
    } catch (error) {
      // If validation fails for the new location, log it and try the saved location
      console.warn("Validation failed for new location:", error.message);
      if (user.location && user.location.coordinates) {
        try {
          validateUserLocationCoordinate(user.location.coordinates);
          validLocation = true; // If validation passes for the saved location
          locationToUse = user.location.coordinates; // Use the saved location
        } catch (error) {
          // If both fail, use the default location
          console.warn("Validation failed for saved location:", error.message);
        }
      }
    }

    // Use the location to use, either the validated or the default
    const finalLocation = validLocation ? locationToUse : defaultLocation;

    // Check if user data is valid
    if (!user || !user.dateOfBirth || !user.gender || !finalLocation) {
      return res.status(400).json({ error: "Invalid user data." });
    }

    const today = new Date();
    const userAge = calculateAge(user.dateOfBirth);
    const userGender = user.gender;
    const userInterests = user.interests || [];
    const userBehaviors = user.behaviors || [];
    const userMaritalStatus = user.maritalStatus;
    const userOccupation = user.occupation;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Query the Campaign collection to find campaigns targeting users like this one
      const targetedCampaigns = await Campaign.aggregate([
        {
          $match: {
            campaignStartDate: { $lte: today },
            campaignEndDate: { $gte: today },
            $expr: {
              $or: [
                { $eq: ["$maxImpressionsPerDay", Infinity] },
                { $lt: ["$todaysPerformance.impressions", "$maxImpressionsPerDay"] },
              ],
            },
            $or: [
              {
                "targetAudience.demographics.ageRange": { $regex: `${userAge}` },
                "targetAudience.demographics.gender": { $in: ["All", userGender] },
                "targetAudience.demographics.maritalStatus": { $in: ["All", userMaritalStatus] },
                "targetAudience.demographics.occupation": { $in: ["Any", userOccupation] },
                $or: [
                  { "targetAudience.interests": { $in: userInterests } },
                  { "targetAudience.behaviors": { $in: userBehaviors } },
                ],
              },
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
                    vars: { targetLocation: "$targetAudience.geography.coordinates" },
                    in: getDistance(finalLocation, "$$targetLocation"),
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
                    args: [finalLocation, "$targetAudience.geography.coordinates"],
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
          $project: {
            title: 1,
            description: 1,
            taskDetails: 1,
            impressions: "$todaysPerformance.impressions",
            maxImpressionsPerDay: 1,
            completionRequiredBy: 1,
            callToAction: 1,
            matchCriteria: 1,
            matchCriteriaValue: 1,
          },
        },
      ]);

      // Filter campaigns based on matchCriteria and matchCriteriaValue
      const filteredCampaigns = targetedCampaigns.filter(campaign => {
        const { matchCriteria, matchCriteriaValue } = campaign;

        const interestMatchCount = userInterests.filter(interest =>
          campaign.targetAudience.interests.includes(interest)
        ).length;
        const behaviorMatchCount = userBehaviors.filter(behavior =>
          campaign.targetAudience.behaviors.includes(behavior)
        ).length;

        const maritalStatusMatch = (userMaritalStatus === campaign.targetAudience.demographics.maritalStatus || campaign.targetAudience.demographics.maritalStatus === "All") ? 1 : 0;
        const occupationMatch = (userOccupation === campaign.targetAudience.demographics.occupation || campaign.targetAudience.demographics.occupation === "Any") ? 1 : 0;

        const totalCriteria = campaign.targetAudience.interests.length + campaign.targetAudience.behaviors.length + maritalStatusMatch + occupationMatch;

        switch (matchCriteria) {
          case "All":
            return userInterests.length >= matchCriteriaValue &&
              maritalStatusMatch &&
              occupationMatch;
          case "Any":
            return (
              interestMatchCount > 0 || behaviorMatchCount > 0 ||
              maritalStatusMatch || occupationMatch
            );
          case "percentage match":
            const percentageMatch = ((interestMatchCount + behaviorMatchCount + maritalStatusMatch + occupationMatch) / totalCriteria) * 100;
            return percentageMatch >= matchCriteriaValue;
          case "number of matches":
            return (interestMatchCount + behaviorMatchCount + maritalStatusMatch + occupationMatch) >= matchCriteriaValue;
          default:
            return false; // Default to false if no criteria matched
        }
      });

      await session.commitTransaction();

      return res.status(200).json(filteredCampaigns.length > 0 ? filteredCampaigns[0] : null);
    } catch (error) {
      await session.abortTransaction();
      return next(new CustomError("Failed to retrieve targeted campaigns", 500));
    } finally {
      session.endSession();
    }
  }
);




// PERFORMANCE
export const postFollowersGained = asyncErrorHandler(async (req, res, next) => {
  const { campaignId } = req.body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const campaign = await Campaign.find({
      campaignId,
    }).session(session);
    if (!campaign) {
      await session.abortTransaction();
      return next(
        new CustomError(
          `Performance data with ID: ${campaignId} not found`,
          404
        )
      );
    }

    // Call the standalone trackTodaysPerformance function
    // Example usage with transaction session
    await trackTodaysPerformance(
      campaign, // The campaign document to update
      1, // followersGained
      0, // subscribersGained
      0, // View
      0, // impression
      0, // clicks
      0, // conversion
      session // MongoDB transaction session
    );

    // Call to track today's campaign performance
    await trackEveryDaysCampaignPerformanceData(
      campaignId, // The campaign ID to track
      1, // followersGained
      0, // subscribersGained
      0, // View
      0, // impression
      0, // clicks
      0, // conversion
      session // MongoDB session object
    );

    await session.commitTransaction();
    res.status(200).json({ status: "success", message: "Total views logged" });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

// POST: Log subscribers gained
export const postSubscriberGained = asyncErrorHandler(
  async (req, res, next) => {
    const { campaignId } = req.body;
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const campaign = await Campaign.find({ campaignId }).session(session);
      if (!campaign) {
        await session.abortTransaction();
        return next(
          new CustomError(
            `Performance data with ID: ${campaignId} not found`,
            404
          )
        );
      }

      // Call the standalone trackTodaysPerformance function
      // Example usage with transaction session
      await trackTodaysPerformance(
        campaign, // The campaign document to update
        0, // followersGained
        1, // subscribersGained
        0, // totalViews
        0, // impressions
        0, // clicks
        0, // conversions
        session // MongoDB transaction session
      );

      // Call to track today's campaign performance
      await trackEveryDaysCampaignPerformanceData(
        campaignId, // The campaign ID to track
        0, // followersGained
        1, // subscribersGained
        0, // totalViews
        0, // impressions
        0, // clicks
        0, // conversions
        session // MongoDB session object
      );

      await session.commitTransaction();
      res
        .status(200)
        .json({ status: "success", message: "Subscribers gained logged" });
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  }
);


export const postView = asyncErrorHandler(async (req, res, next) => {
  const { campaignId } = req.body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const campaign = await Campaign.find({
      campaignId,
    }).session(session);
    if (!campaign) {
      await session.abortTransaction();
      return next(
        new CustomError(
          `Performance data with ID: ${campaignId} not found`,
          404
        )
      );
    }

    // Call the standalone trackTodaysPerformance function
    // Example usage with transaction session
    await trackTodaysPerformance(
      campaign, // The campaign document to update
      0, // followersGained
      0, // subscribersGained
      0, // View
      0, // impression
      0, // clicks
      1, // conversion
      session // MongoDB transaction session
    );

    // Call to track today's campaign performance
    await trackEveryDaysCampaignPerformanceData(
      campaignId, // The campaign ID to track
      0, // followersGained
      0, // subscribersGained
      0, // View
      0, // impression
      0, // clicks
      1, // conversion
      session // MongoDB session object
    );


    await session.commitTransaction();
    res.status(200).json({ status: "success", message: "Total views logged" });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

export const postCampaignImpression = asyncErrorHandler(
  async (req, res, next) => {
    const { campaignId } = req.body;
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const campaign = await Campaign.find({
        campaignId,
      }).session(session);
      if (!campaign) {
        await session.abortTransaction();
        return next(
          new CustomError(
            `Performance data with ID: ${campaignId} not found`,
            404
          )
        );
      }

      // Call the standalone trackTodaysPerformance function
      // Example usage with transaction session
      await trackTodaysPerformance(
        campaign, // The campaign document to update
        0, // followersGained
        0, // subscribersGained
        0, // View
        1, // impression
        0, // clicks
        0, // conversion
        session // MongoDB transaction session
      );

      // Call to track today's campaign performance
      await trackEveryDaysCampaignPerformanceData(
        campaignId, // The campaign ID to track
        0, // followersGained
        0, // subscribersGained
        0, // View
        1, // impression
        0, // clicks
        0, // conversion
        session // MongoDB session object
      );

      await session.commitTransaction();
      res
        .status(200)
        .json({ status: "success", message: "Total views logged" });
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  }
);

// Update performance data for CTA clicks
export const postCampaignCTAclick = asyncErrorHandler(
  async (req, res, next) => {
    const { campaignId } = req.body;
    const session = await mongoose.startSession(); // Start a session
    session.startTransaction(); // Start a transaction

    try {
      const campaign = await Campaign.find({ campaignId }).session(session);
      if (!campaign) {
        await session.abortTransaction();
        return next(
          new CustomError(`Campaign with ID: ${campaignId} is not found`, 404)
        );
      }

      // Call the standalone trackTodaysPerformance function
      // Call the standalone trackTodaysPerformance function
      // Example usage with transaction session
      await trackTodaysPerformance(
        campaign, // The campaign document to update
        0, // followersGained
        0, // subscribersGained
        0, // totalViews
        0, // impressions
        1, // clicks
        0, // conversions
        session // MongoDB transaction session
      );

      // Call to track today's campaign performance
      await trackEveryDaysCampaignPerformanceData(
        campaignId, // The campaign ID to track
        0, // followersGained
        0, // subscribersGained
        0, // totalViews
        0, // impressions
        1, // clicks
        0, // conversions
        session // MongoDB session object
      );

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
  }
);


// Update performance data for conversions
export const postCampaignConversion = asyncErrorHandler(
  async (req, res, next) => {
    const { campaignId } = req.body;
    const session = await mongoose.startSession(); // Start a session
    session.startTransaction(); // Start a transaction

    try {
      const campaign = await Campaign.find({ campaignId }).session(session);
      if (!campaign) {
        await session.abortTransaction();
        return next(
          new CustomError(`Campaign with ID: ${campaignId} is not found`, 404)
        );
      }

      // Call the standalone trackTodaysPerformance function
      // Example usage with transaction session
      await trackTodaysPerformance(
        campaign, // The campaign document to update
        0, // followersGained
        0, // subscribersGained
        0, // totalViews
        0, // impressions
        0, // clicks
        1, // conversions
        session // MongoDB transaction session
      );

      // Call to track today's campaign performance
      await trackEveryDaysCampaignPerformanceData(
        campaignId, // The campaign ID to track
        0, // followersGained
        0, // subscribersGained
        0, // totalViews
        0, // impressions
        0, // clicks
        1, // conversions
        session // MongoDB session object
      );

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
  }
);



// CRUD
// Get all ad
export const getCampaigns = asyncErrorHandler(async (req, res, next) => {
  let features = new ApiFeatures(Campaign.find(), req.query)
    .countDocuments()
    .filter()
    .sort()
    .limitfields()
    .limitfields2()
    .paginate();

  // Execute the query and get the result
  let OrganicFollowerss = await features.query;

  // Get the total count of records
  let totalCount = await features.totalCountPromise;

  console.log("RecordsEstimate", totalCount);

  OrganicFollowerss = updateResponseFilePathsWithHostName(
    OrganicFollowerss,
    process.env.HOST
  );

  res.status(200).json({
    status: "success",
    resource: "OrganicFollowerss",
    RecordsEstimate: totalCount,
    action: "getAll",
    length: OrganicFollowerss.length,
    data: OrganicFollowerss,
  });
});


// Create a new ad video
export const postCampaign = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  if (req.files) {
    let filesArrayOfObjects = ProcessMultipleFilesArrayOfObjects(req);
    req.body.files = filesArrayOfObjects;
  }

  const campaign = await Campaign.create(req.body);

  // Initialize performance data
  const campaignPerformanceData = await CampaignPerformanceData.create({
    campaignId: campaign._id,
    data: [],
  });

  res.status(201).json({
    status: "success",
    resource: "OrganicFollowerss",
    OrganicFollowers: "created",
    length: campaign.length,
    data: campaign,
    performanceData: campaignPerformanceData,
  });
});




// Get a specific campaign
export const getCampaign = asyncErrorHandler(async (req, res, next) => {
  let Campaign = await Campaign.findById(req.params._id);
  if (!Campaign) {
    return next(
      new CustomError(`Campaign with ID: ${req.params._id} is not found`, 404)
    );
  }

  Campaign = updateResponseFilePathsWithHostName(Campaign, process.env.HOST);

  res.status(200).json({
    status: "success",
    resource: "Campaign",
    Campaign: "retrieved",
    length: Campaign.length,
    data: Campaign,
  });
});



// Update an existing ad video
export const patchCampaign = asyncErrorHandler(async (req, res, next) => {
  const { campaignId } = req.params;

  const Campaign = await Campaign.findByIdAndUpdate(campaignId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!Campaign) {
    return next(new CustomError(`Campaign with ID: ${campaignId} is not found`, 404));
  }

  res.status(200).json({
    status: "success",
    resource: "Campaign",
    Campaign: "updated",
    length: Campaign.length,
    data: Campaign,
  });
});


export const putCampaign = asyncErrorHandler(async (req, res, next) => {
  const { campaignId } = req.params;

  const Campaign = await Campaign.findByIdAndUpdate(campaignId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!Campaign) {
    return next(new CustomError(`Campaign with ID: ${campaignId} is not found`, 404));
  }

  res.status(200).json({
    status: "success",
    resource: "Campaign",
    Campaign: "updated",
    length: Campaign.length,
    data: Campaign,
  });
});


// Delete an ad video
export const deleteCampaign = asyncErrorHandler(async (req, res, next) => {
  const { campaignId } = req.params;

  const Campaign = await Campaign.findByIdAndDelete(campaignId);
  if (!Campaign) {
    return next(new CustomError(`Campaign with ID: ${campaignId} is not found`, 404));
  }

  res.status(204).json({
    status: "success",
    message: "Ad video deleted successfully",
  });
});



export const filesToCampaign = asyncErrorHandler(async (req, res, next) => {
  SetUploadsfilePathHandler(req, `./uploads/campaign`);
  next();
});
