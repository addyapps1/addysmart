import mongoose from "mongoose";
import fs from "fs";
import AutoLogFile from "../Utils/AutoLogFile.js";

import crypto from "crypto";
import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";

import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });


const { Schema, model } = mongoose;

const externalVideoSchema = new Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  link: { type: String, required: true, unique: true },
  watchcode: { type: String, required: true },
  instructions: { type: String, required: true },
  releaseDate: { type: Date, default: Date.now, required: true, trim: true },
  created: { type: Date, default: Date.now, immutable: true, trim: true },
  updated: { type: Date, default: Date.now, trim: true, select: false },
  vidStatus: {
    type: String,
    trim: true,
    default: "pending",
  },
  challengeType: {
    type: String,
    trim: true,
    default: "wordoccurrence",
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

// USING MONGOOSE MIDDLEWARE
// Post hook
externalVideoSchema.post("save", async function (doc, next) {
  const logFile = await AutoLogFile();
  const content = `A new external Content document with issueCode ${doc.issueCode} created by ${doc.createdBy} on ${doc.created}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {});
  next();
});

externalVideoSchema.pre(/^find/, async function (next) {
  // Note: this model will not serve anything that is not up to its release date
  // else remove this middleware
  this.find({ releaseDate: { $lte: Date.now() } });
  this.startTime = Date.now();
  next();
});

externalVideoSchema.post(/^find/, async function (docs, next) {
  this.endTime = Date.now();
  const logFile = await AutoLogFile();
  const content = `Query took  ${
    this.endTime - this.startTime
  } in milliseconds to fetch the documents, on ${new Date()}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {});
  next();
});

// AGGREGATION MIDDLEWARES
externalVideoSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { releaseDate: { $lte: new Date() } } });
  next();
});

externalVideoSchema.pre("save", async function (next) {
  try {
    const linkToCheck = this.link;

    // If the `link` is provided, check its uniqueness
    if (linkToCheck) {
      // Find any document with the same `link`
      const existingDocument = await this.constructor.findOne({
        link: linkToCheck,
      });

      // If a document exists and it's not the same as the current one, it's a duplicate
      if (
        existingDocument &&
        existingDocument._id.toString() !== this._id.toString()
      ) {
        throw new Error(
          "Link must be unique. This link is already in use by another document."
        );
      }
    }

    next(); // Proceed with saving the document if no duplicates are found
  } catch (err) {
    next(err); // Pass any error to the next middleware
  }
});




externalVideoSchema.pre(
  ["updateOne", "findOneAndUpdate"],
  async function (next) {
    try {
      // For update operations, retrieve the update data using `getUpdate()`
      const updateData = this.getUpdate();
      const linkToCheck = updateData.link;

      if (linkToCheck) {
        // Check if a document with the same link already exists in the collection
        const existingDocument = await this.model.findOne({
          link: linkToCheck,
        });

        if (existingDocument) {
          // Get the filter used in the update query (usually the _id of the document being updated)
          const queryFilter = this.getQuery();

          // Ensure that the document being updated is not the one with the existing link
          if (existingDocument._id.toString() !== queryFilter._id.toString()) {
            throw new Error(
              "Link must be unique. This link is already in use."
            );
          }
        }
      }

      next(); // Proceed with the update
    } catch (err) {
      next(err); // Pass any error to the next middleware
    }
  }
);

// Middleware to update the 'updated' field
externalVideoSchema.pre("save", function (next) {
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
  //   if (key !== "encData" && key !== "_id" && key !== "__v") {
  //     delete this[key];
  //   }
  // }

  next(); // Proceed with saving the document
});

externalVideoSchema.pre(
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


const E_Videos = model("externalVideo", externalVideoSchema);
export default E_Videos;



// export default model("externalVideo", externalVideoSchema);
