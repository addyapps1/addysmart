import forge from 'node-forge';


// RSA
// Encrypt data with RSA
const encryptWithRSA = async (publicKey, data) => {
    try {
        const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
        const encryptedData = publicKeyObj.encrypt(data, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
            mgf1: {
                md: forge.md.sha1.create()
            }
        });
        return forge.util.encode64(encryptedData);
    } catch (error) {
        console.error('Encryption failed:', error);
        throw error;
    }
};

// Decrypt data with RSA
const decryptWithRSA = async (privateKey, encryptedData) => {
    try {
        const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
        const decryptedData = privateKeyObj.decrypt(forge.util.decode64(encryptedData), 'RSA-OAEP', {
            md: forge.md.sha256.create(),
            mgf1: {
                md: forge.md.sha1.create()
            }
        });
        return decryptedData;
    } catch (error) {
        console.error('Decryption failed:', error);
        throw error;
    }
};




export { encryptWithRSA, decryptWithRSA };
