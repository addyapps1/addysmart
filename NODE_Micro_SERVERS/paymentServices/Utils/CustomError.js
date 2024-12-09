class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';

        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default CustomError;

////

// class CustomError extends Error{
//     constructor(message, statusCode){
//         super(message)
//         this.statusCode = statusCode
//         this.status = statusCode >= 400  && statusCode < 500 ? 'fail' : 'error'

//         this.isOperational = true
//         Error.captureStackTrace(this, this.constructor)
//     }
// }
// //const error = new CustomError('some error message', 404)

// module.exports = CustomError;


///

// const CustomError = async () => {
//     let DATE = new Date();
//     let YY = DATE.getFullYear();
//     let mm = String(DATE).split(' ')[1]; // to get the second element of the generated array
//     let dd = String(DATE).split(' ')[2]; // to get the second element of the generated array

//     const logFile = `./Log/log_${dd}_${mm}_${YY}.txt`;

//     return logFile;
// };

// export default CustomError;