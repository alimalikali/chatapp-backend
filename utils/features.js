import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const connectDB = (uri) => {
  mongoose
    .connect(uri, { dbName: "Chatapp" })
    .then((data) => console.log(`connected to ${data.connection.host}`))
    .catch((err) => {
      throw err;
    });
};
export const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
};
export const sendToken = (res, user, code, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

  return res.status(code).cookie("chattu-token", token, cookieOptions).json({
    success: true,
    // user,
    message,
  });
};
export const emitEvent = (req, event, users, data) => {
  // const io = req.app.get("io");
  // const usersSocket = getSockets(users);
  // io.to(usersSocket).emit(event, data);
  console.log("emit eveventt,",event);
};

export const deletFilesFromCloudinary = (req, event, users, data) => {
  // const io = req.app.get("io");
  // const usersSocket = getSockets(users);
  // io.to(usersSocket).emit(event, data);
  // console.log("emit eveventt,",event);
};


