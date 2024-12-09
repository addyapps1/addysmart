import fs from 'fs';
// import fs from 'fs/promises';

import generateAndSaveRSAKeyPair from './RSA_generateAndSaveRSAKeyPair.js';
import CustomError from '../Utils/CustomError.js';

// Function to get the latest public key
export const getLatestPublicKey = async (all) => {
    const filePath = './keys.json';
    let keys = '';
    // Read keys file
    try {
        if (!fs.existsSync(filePath)) {
            // console.log('filePath does not exist called');
                await generateAndSaveRSAKeyPair();
            }

        const fileContent = await fs.promises.readFile(filePath, 'utf8'); // Await the promise here
        // console.log('fileContent', fileContent)
        keys = JSON.parse(fileContent);

        // Check if keys are available and not expired or 6hrs late
        if (keys.length === 0 || keys[keys.length - 1].exp < Date.now() - (6*3600000)) {
            // Generate and save new RSA key pair
            await generateAndSaveRSAKeyPair();

            // Read the keys file again to get the latest keys
            const newFileContent = await fs.promises.readFile(filePath, 'utf8'); // Await the promise here
            keys = JSON.parse(newFileContent);
        }

        // Return the latest public key
        // return [ succesCriteria, publicKey];
        if (all){
            return [ keys[keys.length - 1].keyPair.privateKey, keys[keys.length - 1].keyPair.publicKey,  keys[keys.length - 1].succesCriteria];
        }
        return [ keys[keys.length - 1].keyPair.publicKey,  keys[keys.length - 1].succesCriteria];
    } catch (error) {
        console.log('reading ./keys.json error');
        throw new CustomError('reading keys error', 404);
    }
};

// Export the function
export default getLatestPublicKey;
