import mongoose from "mongoose";
import AutoLogFile from "../Utils/AutoLogFile.js"; // Assuming this utility is used for logging

const { Schema, model } = mongoose;

const agentSchema = new Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    immutable: true,
    trim: true,
    ref: "User", // References the User model
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: false,
    trim: true,
  },
  role: {
    type: String,
    enum: ["agentManager", "senior-agent_L2", "agent_L1", "agent_L0"],
    default: "agent_L0",
    required: true,
  },

  department: {
    type: String,
    enum: ["account", "technical", "billing", "general"],
    default: "general",
    required: true,
  },
  openTasks: {
    type: Number,
    required: true,
    trim: true,
    default: 0,
  },
  assignedTickets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket", // References the Ticket model
    },
  ],
  status: {
    type: String,
    enum: ["active", "inactive", "on-leave"],
    default: "active",
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
    immutable: true,
    trim: true,
  },
  updated: {
    type: Date,
    default: Date.now,
    trim: true,
    select: false,
  },
});

// Post-save middleware to log agent creation or updates
agentSchema.post("save", async function (doc, next) {
  const logFile = await AutoLogFile();
  const content = `Agent ${doc.name} with email ${doc.email} has been ${
    doc.isNew ? "created" : "updated"
  } on ${doc.updated}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {});
  next();
});

// Pre-find middleware to filter agents by status
agentSchema.pre(/^find/, function (next) {
  this.find({ status: { $ne: "inactive" } }); // Exclude inactive agents
  this.startTime = Date.now();
  next();
});

// Post-find middleware to log query execution time
agentSchema.post(/^find/, function (docs, next) {
  this.endTime = Date.now();
  const logFile = AutoLogFile();
  const content = `Query took ${
    this.endTime - this.startTime
  } milliseconds to fetch the documents on ${new Date()}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {});
  next();
});

// Pre-aggregate middleware to add a match stage to the pipeline
agentSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { status: { $ne: "inactive" } } });
  next();
});

export default model("SupportAgent", agentSchema);
