// Function to encrypt files to buffer asynchronously
const encryptFilesToBuffer = async (file) => {
    try {
      const reader = new FileReader();
  
      const encryptedBuffer = await new Promise((resolve, reject) => {
        reader.onload = (event) => {
          try {
            const encryptedData = encryptFile(event.target.result);
            resolve(new Blob([encryptedData], { type: 'application/octet-stream' }));
          } catch (error) {
            reject(error);
          }
        };
  
        reader.onerror = (error) => {
          reject(error);
        };
  
        reader.readAsArrayBuffer(file);
      });
  
      return encryptedBuffer;
    } catch (error) {
      console.error('Error encrypting files to buffer:', error);
      throw error;
    }
  };
  
  // Function to decrypt a buffer
  const decryptBuffer = (encryptedBuffer) => {
    try {
      const encryptedString = Buffer.from(encryptedBuffer).toString('utf-8');
      const decryptedText = decryptFile(encryptedString);
      return decryptedText;
    } catch (error) {
      console.error('Error decrypting buffer:', error);
      throw error;
    }
  };
  
  // Function to encrypt a file
  const encryptFile = (fileBuffer) => {
    try {
      const wordArray = CryptoJS.lib.WordArray.create(fileBuffer);
      const encrypted = CryptoJS.AES.encrypt(wordArray, encryptionKey.current, { iv: iv.current });
      return encrypted.toString();
    } catch (error) {
      console.error('Error encrypting file:', error);
      throw error;
    }
  };
  
  // Function to decrypt a file
  const decryptFile = (encryptedBase64) => {
    try {
      const encryptedWordArray = CryptoJS.enc.Base64.parse(encryptedBase64);
      const decrypted = CryptoJS.AES.decrypt({ ciphertext: encryptedWordArray }, encryptionKey.current, { iv: iv.current });
      const decryptedBuffer = Buffer.from(decrypted.toString(CryptoJS.enc.Latin1), 'latin1');
      return decryptedBuffer;
    } catch (error) {
      console.error('Error decrypting file:', error);
      throw error;
    }
  };
  
  // Function to encrypt data
  const encryptData = (plainText) => {
    try {
      const arrayData = JSON.stringify([succesCriteria.current, plainText]);
      const encrypted = CryptoJS.AES.encrypt(arrayData, encryptionKey.current, { iv: iv.current }).toString();
      return encrypted;
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw error;
    }
  };
  
  // Function to decrypt data
  const decryptData = (encryptedText) => {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, encryptionKey.current, { iv: iv.current }).toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw error;
    }
  };
  