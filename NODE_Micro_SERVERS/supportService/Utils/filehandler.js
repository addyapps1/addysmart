import multer from 'multer';
import path from 'path';

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

// const filefilter = (req, file, cb) => {
//     if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
//         cb(null, true);
//     } else {
//         cb(null, false);
//     }
// };

// File filter to determine which files are allowed to be uploaded
const filefilter = (req, file, cb) => {
    // Array of allowed MIME types
    const allowedTypes = [
        'image/png', 'image/jpg', 'image/jpeg', 
        'video/mp4', 'video/mpeg', 'video/quicktime',
        'audio/mp3', 'audio/wav',
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    // Check if the file's MIME type is in the list of allowed types
    cb(null, allowedTypes.includes(file.mimetype));
};

const upload = multer({ storage: storage, fileFilter: filefilter });

export default upload;
