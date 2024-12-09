import fileSizeFormatter from '../Utils/fileSizeFormatter.js';

const formatFile = (req) => {
    const fileObj = {
        fileName: req.file.originalname,
        filePath: `${req.file.path}`,
        fileType: req.file.mimetype,
        fileSize: fileSizeFormatter(req.file.size, 2) // 0.00
    };
    return fileObj;
};

export default formatFile;