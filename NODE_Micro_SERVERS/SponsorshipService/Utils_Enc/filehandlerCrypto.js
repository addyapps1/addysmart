import multer from 'multer';
import { encryptAndSerializeFile, deserializeAndDecryptFile } from './SYMMETRIC_encryptionUtils.js';

// const storage = multer.memoryStorage();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        req.body.targetFilepath 
            // cb(null, 'uploads')
            cb(null, req.headers.targetFilepath); // using the file path set by authcontroller
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
        // cb(null, new Date().toISOString().replace(/:/g, '-') + path.extname(file.originalname))
    }
});


const filefilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'video/mp4' || 
        file.mimetype === 'video/mpeg' || 
        file.mimetype === 'video/quicktime'
    ){
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const uploadCrypto = multer({ 
    storage: storage, 
    fileFilter: filefilter,
    limits: { fileSize: 3000 * 1024 * 1024 } // Adjust the file size limit as needed
});


const decryptFile = async (req, res, next) => {
    if (req.file && req.file.length) {
        console.log('req.file.length', req.file.length)
        const encryptedJsonStr = req.file.buffer.toString(); // Convert buffer to string
        const chunkSize = 1024 * 1024; // Set your desired chunk size, e.g., 1 MB

        try {
            const decryptedBuffer = await deserializeAndDecryptFile(encryptedJsonStr, req.encryptionKey, req.filekeyIV);
            req.file.buffer = decryptedBuffer; // Replace encrypted file with decrypted file
            next();
        } catch (error) {
            console.error('Error decrypting file:', error);
            res.status(500).send('Error decrypting file');
        }
    } else {
        next();
    }
};

export { uploadCrypto, decryptFile };
