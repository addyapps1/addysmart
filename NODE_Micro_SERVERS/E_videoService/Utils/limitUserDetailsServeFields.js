const limitUserDetailsServeFields = (user) => {
  //   console.log(user);

  // Convert Mongoose document to a plain JavaScript object
  const userClone = user.toObject ? user.toObject() : { ...user };

  const excludeFields = [
    "__v",
    "password",
    "passwordResetToken",
    "passwordResetTokenExp",
    "emailVerificationToken",
    "emailVerificationTokenExp",
    "failedLogginAttempts",
    "lastAttemptTime",
  ];

  excludeFields.forEach((el) => {
    if (el in userClone) {
      // console.log(`deleted ${el}`);
      delete userClone[el];
    } else {
      // console.log(`not deleted: ${el}`);
    }
  });

  //   console.log(userClone);
  return userClone;
};

export default limitUserDetailsServeFields;
