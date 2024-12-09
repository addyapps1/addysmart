import util from "util";
import jwt from "jsonwebtoken";

const verifyToken = async (testToken) => {
  // console.log("testToken", testToken);

  let token;
  if (testToken) {
    if (testToken.startsWith("Bearer") || testToken.startsWith("Server")) {
      token = testToken.split(" ")[1];
      // console.log("token", token);
    }
  }
  if (!token) {
    throw new CustomError("You are not logged in!", 401);
  }

  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRETKEY
  );

  if (decodedToken) return decodedToken;
};

export default verifyToken;
