import CryptoJS from 'crypto-js';

// Function to encrypt data
export const encryptData = (data, req) => {
    const succesCriteria = req.headers.succesCriteria 
    const encryptionKey = req.headers.encryptionKey 
    const iv = req.headers.iv 
    let dataArray = [succesCriteria, data]
    return CryptoJS.AES.encrypt(dataArray, encryptionKey, { iv }).toString();
};
