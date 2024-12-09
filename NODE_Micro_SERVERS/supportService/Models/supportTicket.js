import mongoose from "mongoose";
import fs from "fs";
import AutoLogFile from "../Utils/AutoLogFile.js"; // Assuming this utility is used for logging

const { Schema, model } = mongoose;

const ticketSchema = new Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    immutable: true,
    required: true,
    trim: true,
    ref: "User",
  },
  issueTitle: {
    type: String,
    required: true,
    trim: true,
  },
  issueDescription: {
    type: String,
    required: true,
    trim: true,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    required: true,
  },
  category: {
    type: String,
    enum: ["account", "technical", "billing", "general"],
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "in-progress", "resolved", "closed"],
    default: "open",
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SupportAgent",
    default: null,
  },
  communicationLogs: [
    {
      message: { type: String, required: true },
      files: [],
      sentBy: { type: String, enum: ["user", "agent"], required: true },
      sentAt: { type: Date, default: Date.now, required: true },
    },
  ],
  created: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updated: {
    type: Date,
    default: Date.now,
    select: false,
  },
  resolvedDate: {
    type: Date,
    default: () => Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
  },
});

// Middleware to update "updated" field on save
ticketSchema.pre("save", function (next) {
  this.updated = Date.now();
  next();
});

// Middleware to update "updated" field on document update
ticketSchema.pre("findOneAndUpdate", async function (next) {
  this.set({ updated: Date.now() });

  // Capture original document before update
  this.originalDoc = await this.model.findOne(this.getQuery()).lean();
  next();
});

// Post-update middleware to log changes
ticketSchema.post("findOneAndUpdate", async function (doc, next) {
  if (doc && this.originalDoc) {
    try {
      const logFile = await AutoLogFile();
      const changes = [];

      // Compare the original document with updated document
      for (const [key, value] of Object.entries(this.originalDoc)) {
        if (value !== doc[key]) {
          changes.push(
            `Field "${key}" changed from "${value}" to "${doc[key]}"`
          );
        }
      }

      // Log changes if there are any
      if (changes.length > 0) {
        const content = `Ticket ${
          doc._id
        } updated on ${new Date()}:\n${changes.join("\n")}\n`;
        await fs.promises.appendFile(logFile, content);
      }
    } catch (error) {
      console.error("Error logging ticket update:", error);
    }
  }
  next();
});

// Post-save middleware to log ticket creation
ticketSchema.post("save", async function (doc, next) {
  try {
    const logFile = await AutoLogFile();
    const content = `A new ticket with title "${doc.issueTitle}" created by user ${doc.userID} on ${doc.created}\n`;
    await fs.promises.appendFile(logFile, content);
  } catch (error) {
    console.error("Error logging ticket creation:", error);
  }
  next();
});



// // Post-find middleware to log query execution time
// ticketSchema.post(/^find/, function (docs, next) {
//   this.endTime = Date.now();
//   const logFile = AutoLogFile();
//   const content = `Query took ${
//     this.endTime - this.startTime
//   } milliseconds to fetch the documents on ${new Date()}\n`;
//   fs.writeFileSync(logFile, content, { flag: "a" });
//   next();
// });

// Pre-aggregate middleware to add a match stage to the pipeline
ticketSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { releaseDate: { $lte: new Date() } } });
  next();
});

const SupportTicket = model("supportTicket", ticketSchema);
export default SupportTicket;
