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
  status: {
    type: String,
    required: true,
    enum: {
      values: [
        "running",
        "processing",
        "reviewing",
        "pending",
        "completed",
        "waiting",
        "cancelled",
        "stopped",
      ],
      message: "{VALUE} is not a valid ad status",
    },
    default: "processing",
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?/.test(v); // URL validation
      },
      message: (props) => `${props.value} is not a valid URL!`,
    },
  },
  dailyPersonsToReachMax: { type: Number, required: true, min: 0 },
  dailyPersonsToReachMin: { type: Number, required: true, min: 0 },
  endDate: {
    type: Date,
    required: true,
    trim: true,
    validate: {
      validator: function (value) {
        return value > Date.now(); // Ensure endDate is in the future
      },
      message: "End date must be in the future.",
    },
  },
  releaseDate: {
    type: Date,
    required: true,
    trim: true,
    validate: {
      validator: function (value) {
        return value > Date.now(); // Ensure releaseDate is in the future
      },
      message: "Release date must be in the future.",
    },
    default: Date.now,
  },
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
      date: { type: Date, required: true, default: Date.now },
      count: { type: Number, default: 0 },
    },
  ],

  // Targeting fields
  targetAudience: {
    title: { type: String, required: true },
    matchCriteria: {
      type: String,
      enum: {
        values: ["All", "Any", "percentage match", "number of matches"],
        message: "{VALUE} is not a valid match criteria",
      },
      default: "All",
    },
    matchCriteriaValue: { type: Number, default: 0 },
    demographics: {
      ageRange: { type: String }, // e.g., "18-24", "25-34"
      gender: {
        type: String,
        enum: {
          values: ["All", "Male", "Female", "Other"],
          message: "{VALUE} is not a valid gender",
        },
        required: true,
      },
      location: { type: String },
    },
    interests: [{ type: String }],
    behaviors: [{ type: String }],
    geography: {
      type: {
        type: String,
        enum: {
          values: ["Point", "Polygon"],
          message: "{VALUE} is not a valid geography type",
        },
        required: true,
      },
      coordinates: {
        type: [[Number]], // For polygons, an array of arrays
        required: true,
      },
      radius: {
        type: Number,
        required: function () {
          return this.type === "Point";
        },
        min: 0,
      },
    },
  },

  skipAllowedAfter: {
    type: Number,
    required: true,
    min: 0,
  },

  todaysPerformance: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
  },
});

// Middleware to log the creation of a new ad
AdVideosSchema.post("save", async function (doc, next) {
  const logFile = await AutoLogFile();
  const content = `A new ad video document created by ${doc.createdBy} on ${doc.created}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {});
  next();
});

// Middleware to prevent serving ads that are not yet released
AdVideosSchema.pre(/^find/, async function (next) {
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

// Aggregate Middleware to match ads only with release dates in the past
AdVideosSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { releaseDate: { $lte: new Date() } } });
  next();
});





export default model("advideo", AdVideosSchema);
