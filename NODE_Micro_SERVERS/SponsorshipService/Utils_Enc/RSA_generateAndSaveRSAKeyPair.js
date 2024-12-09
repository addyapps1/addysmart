const startTime = Date.now();
import { generateKeyPair } from 'crypto';
import fs from 'fs/promises'; // Assuming you're using Node.js 14 or later
import { promisify } from 'util';
import AsyncLock from 'async-lock';
import logActivity from '../Utils/LogActivies.js';


// Promisify generateKeyPair function
const generateKeyPairAsync = promisify(generateKeyPair);

export const generateRSAKeyPair = async () => {
    try {
        const { publicKey, privateKey } = await generateKeyPairAsync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            }
        });

        return { publicKey, privateKey };
    } catch (error) {
        throw error;
    }
};

const readKeysFromFile = async (filePath) => {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If the file doesn't exist, return an empty array
            await fs.writeFile(filePath, '[]', 'utf8'); // Create the file
            return [];
        }
        throw error;
    }
};




const lock = new AsyncLock();
const writeKeysToFile = async (filePath, keys) => {
    await lock.acquire(filePath, async () => {
        await fs.writeFile(filePath, JSON.stringify(keys), 'utf8');
    });
};

// const writeKeysToFile = async (filePath, keys) => {
//     await fs.writeFile(filePath, JSON.stringify(keys), 'utf8');
// };

const generateRandomString = async () => {
    const length = Math.floor(Math.random() * 6) + 10; // Random length between 10 and 15
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}



const MAX_KEYS = 3;
const EXP_TIME = 1; // Number of days until expiration
const KEYS_FILE_PATH = 'keys.json';

const generateAndSaveRSAKeyPair = async () => {
    let startTime = new Date()
    console.log('GeNeratiting new RSA keys, generateAndSaveRSAKeyPair called')
    try {
        // Generate RSA key pair
        const keyPair = await generateRSAKeyPair();

        // Read existing keys from file or create the file if it doesn't exist
        let keys = await readKeysFromFile(KEYS_FILE_PATH);

        // generate success criteria
        let succesCriteria = await generateRandomString()

        // Push the new key pair to the array
        keys.push({ exp: new Date().getTime() + (EXP_TIME * 24 * 3600000), keyPair, succesCriteria});

        // Remove the oldest record if the array length exceeds MAX_KEYS
        if (keys.length > MAX_KEYS) {
            keys.shift(); // Remove the first element
        }

        // Write the updated keys array back to the file
        await writeKeysToFile(KEYS_FILE_PATH, keys);

        console.log('Keys saved:', keys);

        let report = 'New RSA key pairs generated'
        logActivity('serverLog',startTime, report )
    } catch (error) {
        let report = 'New RSA key pairs generation failed'
        logActivity('serverLog',startTime, report )
        console.error('Error:', error);
    }
};


export default generateAndSaveRSAKeyPair;