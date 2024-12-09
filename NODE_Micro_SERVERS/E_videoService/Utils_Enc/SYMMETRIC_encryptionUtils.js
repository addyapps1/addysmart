import CryptoJS from "crypto-js";
// import forge from "node-forge";
import { Buffer } from "buffer";
import { promises as fs } from "fs";
import AutoLogFile from "../Utils/AutoLogFile.js";

// Function to encrypt data
const encryptData = (plainText, encryptionKey, iv, criteria = "success") => {
  try {
    const arrayData = `${criteria}:${JSON.stringify(plainText)}`;
    const key = CryptoJS.enc.Hex.parse(encryptionKey);
    const ivHex = CryptoJS.enc.Hex.parse(iv);

    const encrypted = CryptoJS.AES.encrypt(arrayData, key, {
      iv: ivHex,
    }).toString();

    return encrypted;
  } catch (error) {
    console.error("Error encrypting data:", error);
    throw error;
  }
};

// Function to decrypt data
const decryptData = async (
  encryptedText,
  encryptionKey,
  iv,
  dataSource = "none",
  criteria = "success"
) => {
  try {
    const key = CryptoJS.enc.Hex.parse(encryptionKey);
    const ivHex = CryptoJS.enc.Hex.parse(iv);

    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
      iv: ivHex,
    }).toString(CryptoJS.enc.Utf8);

    const [decryptedCriteria, decryptedData] = decrypted.split(":");

    if (decryptedCriteria === criteria) {
      return JSON.parse(decryptedData);
    } else {
      let now = new Date();
      const logFile = await AutoLogFile("decryptFailure");
      const content = `A symmetric decryption failed, time: ${now}, dataSource: ${dataSource} \n`;
      await fs.appendFile(logFile, content); // Use async fs for logging
      throw new Error("Decryption criteria failed");
    }
  } catch (error) {
    console.error("Error decrypting data:", error);
    throw error;
  }
};

// Function to decrypt encData
const encryptDataEncData = (plainText, encryptionKey, iv) => {
  try {
    const arrayData = `${JSON.stringify(plainText)}`;
    const key = CryptoJS.enc.Hex.parse(encryptionKey);
    const ivHex = CryptoJS.enc.Hex.parse(iv);

    const encrypted = CryptoJS.AES.encrypt(arrayData, key, {
      iv: ivHex,
    }).toString();

    return encrypted;
  } catch (error) {
    console.error("Error encrypting data:", error);
    throw error;
  }
};
const decryptDataEncData = async (encryptedText, encryptionKey, iv) => {
  try {
    // Parse the encryption key and IV
    const key = CryptoJS.enc.Hex.parse(encryptionKey);
    const ivHex = CryptoJS.enc.Hex.parse(iv);

    // Perform AES decryption
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
      iv: ivHex,
    }).toString(CryptoJS.enc.Utf8);

    // Check if the decrypted result is a valid string
    if (!decrypted) {
      throw new Error(
        "Failed to decrypt data. The result is empty or invalid."
      );
    }

    return decrypted;
  } catch (error) {
    console.error("Error decrypting data:", error.message);
    throw new Error("Decryption failed: " + error.message);
  }
};

// Encrypt and serialize file
const encryptAndSerializeFile = async (
  fileStream,
  encryptionKey,
  filekeyIV
) => {
  try {
    const chunkSize = 1024 * 1024; // Set your desired chunk size, e.g., 1 MB
    const encryptedChunks = [];

    // Function to encrypt a chunk
    const encryptChunk = async (chunk) => {
      try {
        const encryptedData = await encryptData(
          chunk,
          encryptionKey,
          filekeyIV
        );
        return encryptedData;
      } catch (error) {
        throw error;
      }
    };

    // Function to read and encrypt the file in chunks
    const encryptChunks = async () => {
      let chunk;
      while ((chunk = await fileStream.read(chunkSize)) !== null) {
        const encryptedChunk = await encryptChunk(chunk);
        encryptedChunks.push(encryptedChunk);
      }
    };

    // Encrypt the file in chunks
    await encryptChunks();

    // Serialize encrypted chunks to JSON string
    const encryptedJsonStr = JSON.stringify({ encryptedChunks });

    return encryptedJsonStr;
  } catch (error) {
    console.error("Error encrypting and serializing file:", error);
    throw error;
  }
};

// Deserialize and decrypt file
const deserializeAndDecryptFile = async (
  encryptedJsonStr,
  encryptionKey,
  filekeyIV
) => {
  try {
    const { encryptedChunks } = JSON.parse(encryptedJsonStr);
    let decryptedFile = Buffer.alloc(0);

    // Function to decrypt a chunk
    const decryptChunk = async (encryptedChunk) => {
      try {
        const decryptedData = await decryptData(
          encryptedChunk,
          encryptionKey,
          filekeyIV
        );
        return decryptedData;
      } catch (error) {
        throw error;
      }
    };

    // Function to decrypt and concatenate chunks
    const decryptChunks = async () => {
      for (let i = 0; i < encryptedChunks.length; i++) {
        const decryptedChunk = await decryptChunk(encryptedChunks[i]);
        decryptedFile = Buffer.concat([decryptedFile, decryptedChunk]);
      }
    };

    // Decrypt the file in chunks
    await decryptChunks();

    return decryptedFile;
  } catch (error) {
    console.error("Error deserializing and decrypting file:", error);
    throw error;
  }
};

export {
  encryptAndSerializeFile,
  deserializeAndDecryptFile,
  encryptData,
  decryptData,
  decryptDataEncData,
  encryptDataEncData,
};
