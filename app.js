import dotenv from "dotenv";

import cookieParser from "cookie-parser";
import express from "express";
import { createServer } from 'http';
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "./constants/events.js";
import { getSockets } from "./lib/helper.js";
import { errorMiddleware } from "./middlewares/error.js";
import adminRoute from "./routes/admin.js";
import chatRoute from "./routes/chat.js";
import userRoute from "./routes/user.js";
import { connectDB } from "./utils/features.js";
import { Message } from "./models/message.js";

dotenv.config({ path: "./.env" });
const mongoURI = process.env.URI;
const port = process.env.PORT || 500;
export const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";
export const adminSecretKey = process.env.ADMIN_SECRET_KEY || "adsasdsdfsdfsdfd";
export const userSocketIDs = new Map();
// const onlineUsers = new Set();

connectDB(mongoURI);
// createUser(10);
// createSingleChats(10);
// createGroupChats(10);
// createMessagesInAChat("6671da56dd64035e9c7d3deb",50)

const app = express();
const server = createServer(app)
const io = new Server(server,{});

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/admin", adminRoute);


app.use("/", (req, res, next) => {
  return res.json({
    message: "hello world",
  });
});

io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.request.res,
    async (err) => await socketAuthenticator(err, socket, next)
  );
});

io.on("connection",(socket)=>{
  const user = {
    _id: "asli",
    name:"ali"
  };
  userSocketIDs.set(user._id.toString() , socket.id)
  console.log("user connected",socket.id);
  console.log(userSocketIDs,";;;;");
  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    const messageForRealTime = {
      content: message,
      _id: uuid(),
      sender: {
        _id: user._id,
        name: user.name,
      },
      chat: chatId,
      createdAt: new Date().toISOString(),
    };

    const messageForDB = {
      content: message,
      sender: user._id,
      chat: chatId,
    };
    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(NEW_MESSAGE, {
      chatId,
      message: messageForRealTime,
    });
    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

    try {
      await Message.create(messageForDB);
    } catch (error) {
      throw new Error(error);
    }
  })



  socket.on("disconnect", () => {
    userSocketIDs.delete(user._id.toString());
    // onlineUsers.delete(user._id.toString());
    console.log("user disconnected");
  });
})
app.use(errorMiddleware);

server.listen(port, () => console.log(`Server running on port ${port} 🔥 in ${envMode} Mode`));
