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

const filefilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({ storage: storage, fileFilter: filefilter });

export default upload;
