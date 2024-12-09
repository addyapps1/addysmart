// Importing modules
import asyncErrorHandler from '../Utils/asyncErrorHandler.js';
import GetUserDetailsFromHeader from '../Utils/GetUserDetailsFromHeader.js';
import User from '../Models/userModel.js';
import UnlinkSingleFile from '../Utils/UnlinkSingleFile.js';
import ProcessSingleFileObj from '../Utils/ProcessSingleFileObj.js';
import ProcessMultipleFilesArrayOfObjects from '../Utils/ProcessMultipleFilesArrayOfObjects.js';
import limitUserDetailsServeFields from '../Utils/limitUserDetailsServeFields.js';

// Exporting functions
export const linkProfileImage = asyncErrorHandler(async (req, res, next) => {
    const testToken = req.headers.authorization;
    const decodedToken = await GetUserDetailsFromHeader(testToken);
    const user = await User.findById(decodedToken._id);

    // Unlink previous image
    if (user.profileImg && user.profileImg.filePath) {
        UnlinkSingleFile(user.profileImg.filePath, req);
    }

    let newfileObj = ProcessSingleFileObj(req);

    user.profileImg = newfileObj;

    await user.save({ validateBeforeSave: false });

    const limitedUser = limitUserDetailsServeFields(user);
    res.status(201).json({ 
        status: "success",
        resource: "user",
        action: "profile Image change",
        message: "File Uploaded successfully",
        length: user.length,
        data: limitedUser
    });
});

export const unlinkProfileImage = asyncErrorHandler(async (req, res, next) => {
    const testToken = req.headers.authorization;
    const decodedToken = await GetUserDetailsFromHeader(testToken);
    const user = await User.findById(decodedToken._id);

    if (user.profileImg && user.profileImg.filePath) {
        UnlinkSingleFile(user.profileImg.filePath, req);
    }

    const file = undefined;

    user.profileImg = file;

    await user.save({ validateBeforeSave: false });

    res.status(201).send('File unlinked successfully');
});

export const multipleFilesUpload = async (req, res, next) => {
    try {
        let filesArray = ProcessMultipleFilesArrayOfObjects(req);

        const multipleFiles = new MultipleFiles({
            title: req.body.title,
            files: filesArray
        });
        await multipleFiles.save(); // save the file in db
        res.status(201).send('File Uploaded successfully');
    } catch (error) {
        res.status(400).send(error.message);
    }
};
