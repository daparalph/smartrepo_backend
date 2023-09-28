// const jwt = require("jsonwebtoken");

// // For user authorization
// module.exports = async (req, res, next) => {
//   //   get the token from the authorization header
//   const token = await req.cookies.token;

//   if (!token) {
//     return res.status(401).json({ message: 'Unauthorized Access' });
//   } 
//     //check if the token matches the supposed origin
//   await jwt.verify(token, "RANDOM-TOKEN", (err, decodedToken) => {
//     if (err) {
//       return res.status(401).json({ message: 'Unauthorized Access' });
//     }
//     //   if the token is valid, decode it and get the user details
//     req.userId = decodedToken.userId;
//   // pass down functionality to the endpoint
//     next();
//   }); 
// };

const jwt = require("jsonwebtoken");

module.exports = async (request, response, next) => {
  try {
    //   get the token from the authorization header
    const token = await request.headers.authorization.split(" ")[1];

    //check if the token matches the supposed origin
    const decodedToken = await jwt.verify(token, "RANDOM-TOKEN");

    // retrieve the user details of the logged in user
    const user = await decodedToken;

    // pass the the user down to the endpoints here
    request.user = user;

    // pass down functionality to the endpoint
    next();
    
  } catch (error) {
    response.status(401).json({
      error: new Error("Invalid request!"),
    });
  }
};