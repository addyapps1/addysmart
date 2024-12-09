import mongoose from "mongoose";
import crypto from "crypto";
import fs from "fs";
import AutoLogFile from "../Utils/AutoLogFile.js"; // Custom logging utility

import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

const { Schema, model } = mongoose;

// Define the schema for referral tasks
const ReferralTaskSchema = new Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the user who made the new referral
  },
  referralID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // References the User model (the user who referred this user)
  },
  totalReferrals: { type: Number, default: 0, trim: true },
  qaulifiedReferrals: { type: Number, default: 0, trim: true },

  completed: {
    type: Boolean,
    default: false, // Whether the task is completed or not
  },
  created: {
    type: Date,
    default: Date.now, // Automatically set the creation date
  },
  encData: {
    type: String,
    trim: true,
    default: "new",
  },
  dataHash: {
    type: String,
    trim: true,
    default: "new",
  },
});


// Pre-save middleware to check for unique userID
ReferralTaskSchema.pre("save", async function (next) {
  try {
    // Check if userID is provided
    if (!this.userID) {
      return next(new Error("userID cannot be empty"));
    }

    // Check if referralID is provided
    if (!this.referralID) {
      return next(new Error("referralID cannot be empty"));
    }


    next(); // Proceed to save the document
  } catch (error) {
    next(error); // Pass any errors to the next middleware
  }
});


// Pre-save hook for checking if userID is unique
ReferralTaskSchema.pre("save", async function (next) {
  try {
    const toCheck = this.userID;

    // If the `userID` is provided, check its uniqueness
    if (toCheck) {
      // Find any document with the same `userID`
      const existingDocument = await this.constructor.findOne({
        userID: this.userID,
      });

      // If a document exists and it's not the same as the current one, it's a duplicate
      if (
        existingDocument &&
        existingDocument._id.toString() !== this._id.toString()
      ) {
        throw new Error("userID must be unique");
      }
    }

    next(); // Proceed with saving the document if no duplicates are found
  } catch (err) {
    next(err); // Pass any error to the next middleware
  }
});

// Pre-save hook for checking if userID is unique
ReferralTaskSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  try {
    // For update operations, retrieve the update data using `getUpdate()`
    const updateData = this.getUpdate();
    const toCheck = updateData.userID;

    if (toCheck) {
      // Check if a document with the same link already exists in the collection
      const existingDocument = await this.model.findOne({
        userID: toCheck,
      });

      if (existingDocument) {
        // Get the filter used in the update query (usually the _id of the document being updated)
        const queryFilter = this.getQuery();

        // Ensure that the document being updated is not the one with the existing link
        if (existingDocument._id.toString() !== queryFilter._id.toString()) {
          throw new Error(
            "userID must be unique"
          );
        }
      }
    }

    next(); // Proceed with the update
  } catch (err) {
    next(err); // Pass any error to the next middleware
  }
});



// Middleware to update the 'updated' field
ReferralTaskSchema.pre("save", function (next) {
  const user = this; // Reference to the document being saved
  const createHash = (data) => {
    const hash = crypto.createHash("sha256");
    hash.update(JSON.stringify(data)); // Convert the data object to a string
    return hash.digest("hex"); // Return the hex representation of the hash
  };

  const encryptData = (data) => {
    const encryptionKey = process.env.ENCRYPTIONKEY;
    const iv = process.env.IV;

    if (!encryptionKey || !iv) {
      throw new Error("Encryption key or IV is missing");
    }

    return SymmetricEncryption.encryptDataEncData(data, encryptionKey, iv);
  };

  // Clone the user data
  const cloneData = user.toObject();

  // Specify the fields to exclude from the encrypted data
  const fieldsToExclude = ["encData", "dataHash", "created", "_id", "__v"]; // Add any additional fields you want to exclude

  // Remove specified fields from the cloneData before encryption
  fieldsToExclude.forEach((field) => {
    delete cloneData[field];
  });

  // Generate a random string
  const randomString = crypto.randomBytes(7).toString("hex");

  // Combine the random string with the cloneData before encryption
  let toEncryptData = `${randomString}::::::::::${JSON.stringify(cloneData)}`; // Convert cloneData to a string for encryption

  // Encrypt the combined data
  this.encData = encryptData(toEncryptData);

  // Hash the random string for later verification
  this.dataHash = createHash(randomString); // Store the hash alongside the encrypted data

  // // Optionally, prevent original data from being saved
  // for (const key in cloneData) {
  //   if (key !== "encData" && key !== "__v") {
  //     delete this[key];
  //   }
  // }

  next(); // Proceed with saving the document
});



ReferralTaskSchema.pre(
  ["updateOne", "findOneAndUpdate"],
  async function (next) {
    try {
      // Retrieve the update data using `getUpdate()`
      const updateData = this.getUpdate();

      // Function to create a hash from a given data
      const createHash = (data) => {
        const hash = crypto.createHash("sha256");
        hash.update(JSON.stringify(data)); // Convert the data object to a string
        return hash.digest("hex"); // Return the hex representation of the hash
      };

      // Function to encrypt the data
      const encryptData = (data) => {
        const encryptionKey = process.env.ENCRYPTIONKEY;
        const iv = process.env.IV;

        if (!encryptionKey || !iv) {
          throw new Error("Encryption key or IV is missing");
        }

        return SymmetricEncryption.encryptDataEncData(data, encryptionKey, iv);
      };

      // Clone the update data (excluding certain fields)
      const fieldsToExclude = ["encData", "dataHash", "created", "_id", "__v"]; // Fields to exclude
      let cloneData = { ...updateData };

      // Remove specified fields from the cloneData before encryption
      fieldsToExclude.forEach((field) => {
        delete cloneData[field];
      });

      // Generate a random string
      const randomString = crypto.randomBytes(7).toString("hex");

      // Combine the random string with the cloneData before encryption
      let toEncryptData = `${randomString}::::::::::${JSON.stringify(
        cloneData
      )}`;

      // Encrypt the combined data and update the `encData` field in the update object
      updateData.encData = encryptData(toEncryptData);

      // Hash the random string for later verification and update the `dataHash` field
      updateData.dataHash = createHash(randomString);

      // Continue with the update operation
      next();
    } catch (err) {
      next(err); // Handle any errors during the encryption or update process
    }
  }
);

// Create a Mongoose model for referral tasks
const ReferralTask = model("ReferralTask", ReferralTaskSchema);

// Export the model so it can be used in other parts of the app
export default ReferralTask;
