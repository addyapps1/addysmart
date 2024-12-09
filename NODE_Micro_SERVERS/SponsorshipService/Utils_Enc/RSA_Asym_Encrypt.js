// encrypt.js
import { publicEncrypt } from 'crypto';

export const encryptData = (publicKey, data) => {
    const encryptedData = publicEncrypt(publicKey, Buffer.from(data));
    return encryptedData.toString('base64');
};

export default decryptData;

