// Importing modules
import SupportTicket from "../Models/supportTicket.js";
import ApiFeatures from "../Utils/ApiFeatures.js";
import asyncErrorHandler from "../Utils/asyncErrorHandler.js";
import CustomError from "../Utils/CustomError.js";
import SetUploadsfilePathHandler from "../Utils/SetUploadsfilePathHandler.js";
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

import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

let HOST;
let Client_HOST;
if (process.env.NODE_ENV === "development") {
  HOST = process.env.DEV_HOST;
  Client_HOST = process.env.DEV_CLIENT_HOST;
} else {
  HOST = process.env.PROD_HOST;
  Client_HOST = process.env.CLIENT_HOST;
}

// Exporting functions
export const getSupportTickets = asyncErrorHandler(async (req, res, next) => {
  let features = new ApiFeatures(SupportTicket.find(), req.query)
    .countDocuments()
    .filter()
    .sort()
    .limitfields()
    .limitfields2()
    .paginate();

  // Execute the query and get the result
  let supportTickets = await features.query;

  // Get the total count of records
  let totalCount = await features.totalCountPromise;

  console.log("RecordsEstimate", totalCount);

  res.status(200).json({
    status: "success",
    resource: "supportTickets",
    RecordsEstimate: totalCount,
    action: "getAll",
    length: supportTickets.length,
    data: supportTickets,
  });
});

// export const postSupportTicket = asyncErrorHandler(async (req, res, next) => {
//   req.body = HTMLspecialChars(req.body);
//   if (req.files) {
//     let filesArrayOfObjects = ProcessMultipleFilesArrayOfObjects(req);
//     req.body.files = filesArrayOfObjects;
//   }

//   const supportTicket = await SupportTicket.create(req.body);

//   res.status(201).json({
//     status: "success",
//     resource: "supportTickets",
//     supportTicket: "retrieved",
//     length: supportTicket.length,
//     data: supportTicket,
//   });
// });



// export const postCommunication = asyncErrorHandler(async (req, res, next) => {

//   console.log("req.body", req.body);
  
//   res.status(200).json({
//     status: "success",
//     resource: "supportTicket",
//     action: "patch",
//     data: "GGGGGGGGGGG",
//   });
// })

export const postCommunication = asyncErrorHandler(async (req, res, next) => {
  // Ensure that the input fields are HTML-safe
  req.body.message = HTMLspecialChars(req.body.message);
  req.body.sentBy = HTMLspecialChars(req.body.sentBy);

  // Process and attach files if they exist
  if (req.files) {
    req.body.files = ProcessMultipleFilesArrayOfObjects(req);
  }

  // Find the support ticket by ID
  const supportTicket = await SupportTicket.findById(req.params.ticketID);
  if (!supportTicket) {
    return next(
      new CustomError(
        `SupportTicket with ID: ${req.params.ticketID} is not available`,
        404
      )
    );
  }

  console.log("req.files", req.files);
  // Append the new communication log entry
  const newLogEntry = {
    message: req.body.message || "", // Default to empty string if not provided
    files: [], // Initialize an empty array for files
    sentBy: req.body.sentBy || "Anonymous", // Default to 'Anonymous' if not provided
    sentAt: new Date(), // Current timestamp
  };

  // Check if files exist in the request
  if (req.files && Array.isArray(req.files)) {
    newLogEntry.files = req.files; // Update with uploaded files
  } else {
    console.warn("No files uploaded or files is not an array");
  }

  console.log(" newLogEntry.files", newLogEntry.files);
  // Update the communicationLogs field

  // Update the communicationLogs field
  const updatedSupportTicket = await SupportTicket.findByIdAndUpdate(
    req.params.ticketID,
    { $push: { communicationLogs: newLogEntry } },
    { new: true, runValidators: true }
  );

  let newLogEntryUpdated = updateResponseFilePathsWithHostName(
    newLogEntry,
    `${req.protocol}://${HOST}`
  );

  console.log("newLogEntryUpdated", newLogEntryUpdated);

  // Respond with the updated support ticket
  res.status(200).json({
    status: "success",
    resource: "supportTicket",
    action: "patch",
    data: newLogEntryUpdated,
  });
});


export const getUserSupportTickets = asyncErrorHandler(
  async (req, res, next) => {
    console.log("req.user._id", req.user._id)
    let features = new ApiFeatures(
      SupportTicket.find({ userID: req.user._id }),
      req.query
    )
      .countDocuments()
      .filter()
      .sort()
      .limitfields()
      .limitfields2()
      .paginate();

    // Execute the query and get the result
    let supportTickets = await features.query;

    // Get the total count of records
    let totalCount = await features.totalCountPromise;

    console.log("RecordsEstimate", totalCount);
    console.log("supportTickets", supportTickets);

      let supportTicketsUpdated = updateResponseFilePathsWithHostName(
        supportTickets,
        `${req.protocol}://${HOST}`
      );

    res.status(200).json({
      status: "success",
      resource: "supportTickets",
      RecordsEstimate: totalCount,
      action: "getAll",
      length: supportTickets.length,
      data: supportTicketsUpdated,
    });
  }
);


export const getAgentHeadSupportTickets = asyncErrorHandler(
  async (req, res, next) => {
    console.log("req.user._id", req.user._id);

    // Corrected MongoDB query with $or operator
    const query = SupportTicket.find({
      $or: [{ assignedTo: req.user._id }, { assignedTo: null }],
    });

    // Apply ApiFeatures to the query
    let features = new ApiFeatures(query, req.query)
      .countDocuments()
      .filter()
      .sort()
      .limitfields()
      .limitfields2()
      .paginate();

    // Execute the query and get the result
    let supportTickets = await features.query;

    // Get the total count of records
    let totalCount = await features.totalCountPromise;

    console.log("RecordsEstimate", totalCount);
    console.log("supportTickets", supportTickets);

    // Update response file paths with hostname
    let supportTicketsUpdated = updateResponseFilePathsWithHostName(
      supportTickets,
      `${req.protocol}://${req.get("host")}`
    );

    res.status(200).json({
      status: "success",
      resource: "supportTickets",
      RecordsEstimate: totalCount,
      action: "getAll",
      length: supportTickets.length,
      data: supportTicketsUpdated,
    });
  }
);

export const getAgentSupportTickets = asyncErrorHandler(
  async (req, res, next) => {
    console.log("req.user._id", req.user._id);
    let features = new ApiFeatures(
      SupportTicket.find({ assignedTo: req.user._id }),
      req.query
    )
      .countDocuments()
      .filter()
      .sort()
      .limitfields()
      .limitfields2()
      .paginate();

    // Execute the query and get the result
    let supportTickets = await features.query;

    // Get the total count of records
    let totalCount = await features.totalCountPromise;

    console.log("RecordsEstimate", totalCount);
    console.log("supportTickets", supportTickets);

    let supportTicketsUpdated = updateResponseFilePathsWithHostName(
      supportTickets,
      `${req.protocol}://${HOST}`
    );

    res.status(200).json({
      status: "success",
      resource: "supportTickets",
      RecordsEstimate: totalCount,
      action: "getAll",
      length: supportTickets.length,
      data: supportTicketsUpdated,
    });
  }
);

export const getSupportTicket = asyncErrorHandler(async (req, res, next) => {
  const supportTicket = await SupportTicket.findById(req.params._id);
  if (!supportTicket) {
    const error = new CustomError(
      `SupportTicket with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }


  
      let supportTicketUpdated = updateResponseFilePathsWithHostName(
        supportTicket,
        `${req.protocol}://${HOST}`
      );

  console.log("supportTicketUpdated", supportTicketUpdated);
  res.status(200).json({
    status: "success",
    resource: "supportTicket",
    supportTicket: "retrieved",
    length: supportTicket.length,
    // data: supportTicketUpdated,
    data: supportTicket,
  });
});

export const patchSupportTicket = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars(req.body);
  const supportTicket = await SupportTicket.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!supportTicket) {
    const error = new CustomError(
      `SupportTicket with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "supportTicket",
    action: "patch",
    length: supportTicket.length,
    data: supportTicket,
  });
});

export const putSupportTicket = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars(req.body);
  const supportTicket = await SupportTicket.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!supportTicket) {
    const error = new CustomError(
      `SupportTicket with ID: ${req.params._id} is not available`,
      404
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "supportTicket",
    action: "put",
    length: supportTicket.length,
    data: supportTicket,
  });
});

export const deleteSupportTicket = asyncErrorHandler(async (req, res, next) => {
  const supportTicket = await SupportTicket.findByIdAndDelete(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!supportTicket) {
    const error = new CustomError(
      `SupportTicket with ID: ${req.params._id} is not available`,
      404
    );
    return next(error);
  }

  if (supportTicket.communicationLogs.files) {
    UnlinkMultipleFiles(supportTicket.communicationLogs.files, req);
  }

  res.status(204).json({
    status: "success",
    resource: "supportTicket",
    action: "delete",
    message: "deleted",
  });
});

export const filesToSupportTicket = asyncErrorHandler(
  async (req, res, next) => {
    SetUploadsfilePathHandler(req, `./uploads/supportTicket`);
    next();
  }
);
