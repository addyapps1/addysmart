const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const GetUserDetailsFromHeader = require('../Utils/GetUserDetailsFromHeader')
const User = require('./../Models/userModel')
const UnlinkSingleFile = require('./../Utils/UnlinkSingleFile')
const ProcessSingleFileObj = require('./../Utils/ProcessSingleFileObj')
const ProcessMultipleFilesArrayOfObjects = require('./../Utils/ProcessMultipleFilesArrayOfObjects');
const limitUserDetailsServeFields = require('../Utils/limitUserDetailsServeFields');





exports.linkProfileImage = asyncErrorHandler(async(req, res, next) => {
    const testToken = req.headers.authorization
    const decodedToken =  await GetUserDetailsFromHeader(testToken)
    
    const user = await User.findById(decodedToken._id)

    
    //// unlink prev
    if(user.profileImg && user.profileImg.filePath){
        UnlinkSingleFile(user.profileImg.filePath, req)
    }
    
    let newfileObj = ProcessSingleFileObj(req)

    user.profileImg = newfileObj

    await user.save({validateBeforeSave: false})

    limitedUser = limitUserDetailsServeFields(user)
    res.status(201).json({ 
        status : "success",
        resource : "user",
        action: "profile Image change",
        message: "File Uploaded successfully",
        lenght : user.length,
        data : limitedUser
       })  
})


exports.unlinkProfileImage = asyncErrorHandler(async(req, res, next) => {
    const testToken = req.headers.authorization

    const decodedToken =  await GetUserDetailsFromHeader(testToken)

    const user = await User.findById(decodedToken._id)
    
        if(user.profileImg && user.profileImg.filePath){
            UnlinkSingleFile(user.profileImg.filePath, req)
        }

        const file = undefined

        user.profileImg = file

        await user.save({validateBeforeSave: false}) 

        res.status(201).send('File unlinked successfully')

})


exports.multipleFilesUpload = async(req, res, next) => {
    try{
        let filesArray = ProcessMultipleFilesArrayOfObjects(req)

        const multipleFiles = new MultipleFiles({
            title: req.body.title,
            files: filesArray
        })
        await multipleFiles.save() // save the file in db
        res.status(201).send('File Uploaded successfully')

    }
    catch(error){
        res.status(400).send(error.message)
    }
}
