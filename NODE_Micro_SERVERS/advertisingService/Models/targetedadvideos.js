import mongoose from "mongoose";
import fs from "fs";
import AutoLogFile from "../Utils/AutoLogFile.js";

const { Schema, model } = mongoose;

const AdVideosSchema = new Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  adType: {
    type: String,
    required: true,
    enum: {
      values: ["video", "image", "carousel", "text", "interactive"],
      message: "{VALUE} is not a valid ad type",
    },
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String, required: true, unique: true },
  dailyPersonsToReachMax: { type: Number, required: true },
  dailyPersonsToReachMin: { type: Number, required: true },
  endDate: { type: Date, default: Date.now, required: true, trim: true },
  releaseDate: { type: Date, default: Date.now, required: true, trim: true },
  created: { type: Date, default: Date.now, immutable: true, trim: true },
  updated: { type: Date, default: Date.now, trim: true, select: false },

  // Call to Action fields
  callToAction: {
    text: { type: String, required: true },
    link: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?/.test(v); // URL validation
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
  },
  totalCTAClicks: {
    type: Number,
    default: 0,
  },
  dailyCTAClicks: [
    {
      date: { type: Date, required: true },
      count: { type: Number, default: 0 },
    },
  ],

  // Targeting fields
  targetAudience: {
    demographics: {
      ageRange: { type: String }, // e.g., "18-24", "25-34"
      gender: {
        type: String,
        enum: ["All", "Male", "Female", "Other"],
        required: true,
      }, // Targeting by gender
      location: { type: String }, // e.g., "New York", "USA"
    },
    interests: [{ type: String }], // List of interests
    behaviors: [{ type: String }], // List of behaviors
    geography: {
      type: {
        type: String, // "Point" or "Polygon"
        enum: ["Point", "Polygon"],
        required: true,
      },
      coordinates: {
        type: [[Number]], // For polygons, an array of arrays
        required: true,
      },
      radius: {
        type: Number, // Radius in meters, applicable for Point type
        required: function () {
          return this.type === "Point";
        },
        min: 0, // Radius cannot be negative
      },
    },
  },

  // Skip duration field
  skipAllowedAfter: {
    type: Number, // Duration in seconds
    required: true,
    min: 0, // Skip allowed after 0 seconds at a minimum
  },
});

// USING MONGOOSE MIDDLEWARE
// Post hook
AdVideosSchema.post("save", async function (doc, next) {
  const logFile = await AutoLogFile();
  const content = `A new ad video document created by ${doc.createdBy} on ${doc.created}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {});
  next();
});

AdVideosSchema.pre(/^find/, async function (next) {
  // Note: this model will not serve anything that is not up to its release date
  // else remove this middleware
  this.find({ releaseDate: { $lte: Date.now() } });
  this.startTime = Date.now();
  next();
});

AdVideosSchema.post(/^find/, async function (docs, next) {
  this.endTime = Date.now();
  const logFile = await AutoLogFile();
  const content = `Query took ${
    this.endTime - this.startTime
  } milliseconds to fetch the documents, on ${new Date()}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {});
  next();
});

// AGGREGATION MIDDLEWARES
AdVideosSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { releaseDate: { $lte: new Date() } } });
  next();
});

// Function to track CTA clicks
AdVideosSchema.methods.trackCTAClick = async function () {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0]; // Get YYYY-MM-DD format

  // Update total clicks
  await this.model("advideo").findByIdAndUpdate(this._id, {
    $inc: { totalCTAClicks: 1 },
  });

  // Update daily clicks
  await this.model("advideo").findOneAndUpdate(
    { _id: this._id, "dailyCTAClicks.date": formattedDate },
    { $inc: { "dailyCTAClicks.$.count": 1 } },
    { upsert: true, new: true }
  );
};

export default model("advideo", AdVideosSchema);
