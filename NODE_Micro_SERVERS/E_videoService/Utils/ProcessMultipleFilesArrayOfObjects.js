import fileSizeFormatter from './fileSizeFormatter.js';

const formatFiles = (req) => {
    let filesArray = [];

    req.files.forEach(element => {
        const file = {
            fileName: element.originalname,
            filePath: `${element.path}`,
            fileType: element.mimetype,
            fileSize: fileSizeFormatter(element.size, 2) // 0.00
        };
        filesArray.push(file);
    });
    return filesArray;
};

export default formatFiles;
