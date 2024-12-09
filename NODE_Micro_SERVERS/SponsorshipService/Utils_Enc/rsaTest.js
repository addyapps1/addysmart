import { encryptWithRSA, decryptWithRSA } from './RSA_encryptionUtils.js';
import getLatestPublicKey from './RSA_getLatestPublicKey.js';

// Define the module function
const encryptAndDecryptData = async () => {
    try {
        // Get the latest public key and success criteria from the keys file
        const [privateKey, publicKey, succesCriteria] = await getLatestPublicKey(true);
        console.log('privateKey', privateKey)
        console.log('')
        console.log('publicKey', publicKey)
        console.log('')

        // Define your data to encrypt
        const dataToEncrypt = `${succesCriteria} Your data here`;
console.log('dataToEncrypt', dataToEncrypt)
        // Encrypt data with the public key
        const encryptedData = await encryptWithRSA(publicKey, dataToEncrypt);
        console.log('Encrypted Data:', encryptedData);
        
        // Decrypt the encrypted data with the private key
        const decryptedData = await decryptWithRSA(privateKey, encryptedData);
        console.log('Decrypted Data:', decryptedData);

        return { encryptedData, decryptedData };
    } catch (error) {
        console.error('Error:', error);
    }
};

// Export the module function
export default encryptAndDecryptData;
