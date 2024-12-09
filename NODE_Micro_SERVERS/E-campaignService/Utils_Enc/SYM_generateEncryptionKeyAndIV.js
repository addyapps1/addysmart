import { randomBytes } from "crypto";

// Function to generate a random string of specified length using crypto
const generateRandomString = (length) => {
  return randomBytes(length).toString("hex").slice(0, length);
};

// Function to generate a random encryption key and IV
const generateEncryptionKeyAndIV = async (bytes = 32) => {
  // Generate random encryption key and IV
  const iv = generateRandomString(16); // 128-bit IV
  console.log("iv", iv);
  const filekey = generateRandomString(bytes); // 256-bit or custom key length
  console.log("filekey", filekey);
  return { filekey, iv };
};

// Call the function to generate encryption key and IV
generateEncryptionKeyAndIV(64);

// Export the module function (if needed)
// export default generateEncryptionKeyAndIV;
