import mongoose from "mongoose";
import fs from "fs";
import AutoLogFile from "../Utils/AutoLogFile.js";

const { Schema, model } = mongoose;

const userSupportSchema = new Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    immutable: true,
  },
  supportAgentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  ticketID: {
    type: String,
    required: true,
    unique: true,
    immutable: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  messages: [
    {
      senderID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
      messageContent: {
        type: String,
        required: true,
        trim: true,
      },
      attachments: [
        {
          fileURL: { type: String, trim: true },
          fileType: { type: String, trim: true },
        },
      ],
      sentAt: {
        type: Date,
        default: Date.now,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: ["open", "pending", "resolved", "closed"],
    default: "open",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  resolutionNote: {
    type: String,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  closedAt: {
    type: Date,
  },
});

// USING MONGOOSE MIDDLEWARE
// Log when a new support ticket is created
userSupportSchema.post("save", async function (doc, next) {
  const logFile = await AutoLogFile();
  const content = `A new support ticket with ID ${doc.ticketID} created by user ${doc.userID} on ${doc.created}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {});
  next();
});

// Pre-find hook to log query times
userSupportSchema.pre(/^find/, async function (next) {
  this.startTime = Date.now();
  next();
});

userSupportSchema.post(/^find/, async function (docs, next) {
  this.endTime = Date.now();
  const logFile = await AutoLogFile();
  const content = `Query for support tickets took ${
    this.endTime - this.startTime
  } milliseconds on ${new Date()}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {});
  next();
});

// AGGREGATION MIDDLEWARE: Ensure only tickets up to today's date are retrieved
userSupportSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { created: { $lte: new Date() } } });
  next();
});


const UnansweredQuestion = model("UserSupport", userSupportSchema);
export default UnansweredQuestion;