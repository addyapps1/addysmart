const asyncErrorHandler = (asyncfunc) => {
    return async (req, res, next) => {
        try {
            await asyncfunc(req, res, next);
        } catch (err) {
            next(err);
        }
    };
};

export default asyncErrorHandler;


// module.exports = (asyncfunc) => {
//     return (req, res, next) => {
//         asyncfunc(req, res, next).catch(err => next(err))
//     }
// }