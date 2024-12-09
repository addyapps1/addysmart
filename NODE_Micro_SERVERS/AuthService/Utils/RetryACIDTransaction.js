import mongoose from "mongoose";
import CustomError from "../Utils/CustomError.js";

/**
 * Retry mechanism for ACID transactions
 * @param {Function} operation - Function containing the transaction operations
 * @param {Number} retries - Number of retries allowed
 * @param {Number} delay - Delay in milliseconds between retries
 * @param {String} errorMessage - Custom error message for failures
 * @returns {Promise<any>} - Result of the transaction operation
 */
const retryACIDTransaction = async (
  operation,
  retries = 5,
  delay = 1000,
  errorMessage = "Transaction failed after multiple retries"
) => {
  const session = await mongoose.startSession();
  let result;

  try {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        session.startTransaction();

        // Execute the provided operation
        result = await operation(session);

        // Commit the transaction if successful
        await session.commitTransaction();
        return result; // Return the successful result
      } catch (error) {
        // Abort transaction if any error occurs
        await session.abortTransaction();

        if (attempt < retries) {
          console.log(`Transaction attempt ${attempt + 1} failed. Retrying...`);
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw new CustomError(errorMessage, 500);
        }
      } finally {
        session.endSession();
      }
    }
  } catch (error) {
    throw new CustomError(`Transaction error: ${error.message}`, 500);
  }
};

export default retryACIDTransaction;


// ////
// // USAGE
// import retryACIDTransaction from "../Utils/retryACIDTransaction.js";

// // Example operation to perform within a transaction
// const exampleTransactionOperation = async (session) => {
//   const someModel = await SomeModel.findOne({
//     /* query */
//   }).session(session);

//   // Perform operations with the session, like updates
//   if (!someModel) {
//     throw new CustomError("Data not found", 404);
//   }

//   // Example operation
//   someModel.field = newValue;
//   await someModel.save({ session });

//   return someModel; // Return the result of your operation
// };

// // Calling the transaction with retry
// const performTransaction = async (req, res, next) => {
//   try {
//     const result = await retryACIDTransaction(exampleTransactionOperation);
//     res.status(200).json({ success: true, data: result });
//   } catch (error) {
//     next(error);
//   }
// };
// ////