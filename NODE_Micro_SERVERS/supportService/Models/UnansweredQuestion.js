import mongoose from "mongoose";
import AutoLogFile from "../Utils/AutoLogFile.js";
const { Schema, model } = mongoose;

const UnansweredQuestionSchema = new Schema({
  question: { type: String, required: true },
  status: { type: String, default: "unanswered" }, // Status can be 'unanswered', 'answered', etc.
  timestamp: { type: Date, default: Date.now },
  userId: { type: String }, // Optional: store the ID of the user who asked the question
});


const UnansweredQuestion = model("UnansweredQuestion", UnansweredQuestionSchema);
export default UnansweredQuestion;