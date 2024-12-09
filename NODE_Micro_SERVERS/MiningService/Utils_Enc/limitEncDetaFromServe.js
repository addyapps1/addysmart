const limitEncDetaFromServe = (data) => {
  //   console.log(data);

  // Convert Mongoose document to a plain JavaScript object
  const dataClone = data.toObject ? data.toObject() : { ...data };

  const excludeFields = ["__v", "dataHash", "encData"];

  excludeFields.forEach((el) => {
    if (el in dataClone) {
      // console.log(`deleted ${el}`);
      delete dataClone[el];
    } else {
      // console.log(`not deleted: ${el}`);
    }
  });

  //   console.log(dataClone);
  return dataClone;
};

export default limitEncDetaFromServe;
