import * as SymmetricEncryption from "./SYMMETRIC_encryptionUtils.js";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config({ path: "./config.env" });

// Function to create a hash of the data
const createHash = (data) => {
  const hash = crypto.createHash("sha256");
  hash.update(JSON.stringify(data)); // Convert the data object to a string
  return hash.digest("hex"); // Return the hex representation of the hash
};

const decodeAndVerifyData = async (data) => {
  const encryptionKey = process.env.ENCRYPTIONKEY;
  const iv = process.env.IV;

  if (!encryptionKey || !iv) {
    throw new Error("Encryption key or IV is missing");
  }

  try {
    // Extract the encrypted data and random string hash from the input
    const encData = data.encData; // Extract encData from the input

    // console.log("encData", encData);

    // Decrypt the data using the encryption key and IV
    const decryptedData = await SymmetricEncryption.decryptDataEncData(
      encData,
      encryptionKey,
      iv
    );

    // console.log("Decrypted data before parsing:", decryptedData);

    // Parse the decrypted decryptedData back into the object
    const decryptedDataPlainText = JSON.parse(decryptedData);
    // console.log("decryptedDataPlainText", decryptedDataPlainText);
    // Assuming space separation between the random string and the actual data
    const [randomString, decryptedPayload] = decryptedDataPlainText.split(
      "::::::::::",
      2
    );

    // Recalculate the hash of the random string to verify integrity
    const recalculatedHash = createHash(randomString);

    // Compare the recalculated hash with the stored hash
    if (recalculatedHash !== data.dataHash) {
      throw new Error(
        "Data integrity check failed: data may have been tampered with."
      );
    }

    // Parse the decrypted payload back into the object
    const decryptedObject = JSON.parse(decryptedPayload);
    // Update each field in the original data with the decrypted values
    Object.keys(decryptedObject).forEach((key) => {
      // Add the field to data, even if it was deleted during encryption
      data[key] = decryptedObject[key];
    });

    return data; // Return the updated data
  } catch (error) {
    throw new Error(
      "Error during decryption and verification: " + error.message
    );
  }
};

export default decodeAndVerifyData;
