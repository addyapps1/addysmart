// module.exports = (count) => {

//     if( count === 0){
//             throw new Error('this page is not found')  
//     }
// }

const checkPageCount = (count) => {
    if (count === 0) {
        throw new Error('this page is not found');
    }
};

export default checkPageCount;
