import { decryptWithRSA } from './RSA_encryptionUtils.js';
import fs from 'fs';

const decryptAsymData = async (encryptedData) => {
    const keysFilePath = './keys.json';
    let successCriteria = '';
    console.log('')
    console.log('encryptedData',encryptedData)
    console.log('')
    try {
        const fileContent = await fs.promises.readFile(keysFilePath, 'utf8'); // Await the promise here
        const keys = JSON.parse(fileContent);

        if (keys.length === 0) {
            throw new Error('No keys found in the file.');
        }

        // Iterate through the keys in reverse order (starting from the latest)
        for (let i = keys.length - 1; i >= 0; i--) {
            console.log(`Decrypting with ${i} index key`)

            const privateKey = keys[i].keyPair.privateKey;
            successCriteria = keys[i].succesCriteria; // Corrected the variable name
            console.log('privateKey',privateKey)
            console.log('')

            console.log('successCriteria',successCriteria)
            console.log('')


            try {
                console.log('The try block start')

                // Attempt decryption using the current private key
                const decryptedData = await decryptWithRSA(privateKey, encryptedData)
            
                console.log('decryptedData',decryptedData)

                let decryptedDataArray = JSON.parse(decryptedData)
                console.log('decryptedDataArray',decryptedDataArray)
                console.log('')

                console.log('type of decryptedDataArray', typeof(decryptedDataArray))
                console.log('')
                console.log('successCriteria decryptedDataArray[0]', decryptedDataArray[0])
                console.log('')
                console.log('successCriteria', successCriteria)
                console.log('')

                // Decryption successful, return the decrypted data
                if (successCriteria === decryptedDataArray[0]){
                    console.log('Decryption successful')
                    return decryptedDataArray;
                }
            } catch (error) {
                // Decryption failed with this key, try the next one
                console.error('Decryption failed with key:', i);
            }
        }

        // If none of the private keys meet the success criteria, throw an error
        throw new Error('Extra secured connection failed.');
    } catch (error) {
        throw error;
    }
};

export default decryptAsymData;
