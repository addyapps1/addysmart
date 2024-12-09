import mongoose from "mongoose";
const { Schema, model } = mongoose;

// Define a schema for storing user account details
const userAccountSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
    trim: true,
  },
  bankName: {
    type: String,
    required: true,
    trim: true,
  },
  bankCode: {
    type: String,
    required: true,
    trim: true,
  },
  accountName: {
    type: String,
    required: true,
    trim: true,
  },
  currency: {
    type: String,
    default: "NGN", // Default to Nigerian Naira
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Mongoose Middleware (optional)
userAccountSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

userAccountSchema.post("save", function (doc, next) {
  console.log(`Account details for user ${doc.user} have been saved`);
  next();
});

export default model("UserAccount", userAccountSchema);
