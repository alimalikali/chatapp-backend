import dotenv from "dotenv";

import cookieParser from "cookie-parser";
import express from "express";
import { createServer } from 'http';
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import { NEW_MESSAGE } from "./constants/events.js";
import { errorMiddleware } from "./middlewares/error.js";
import adminRoute from "./routes/admin.js";
import chatRoute from "./routes/chat.js";
import userRoute from "./routes/user.js";
import { connectDB } from "./utils/features.js";

dotenv.config({ path: "./.env" });
const mongoURI = process.env.URI;
const port = process.env.PORT || 500;
export const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";
export const adminSecretKey = process.env.ADMIN_SECRET_KEY || "adsasdsdfsdfsdfd";
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

io.on("connection",(socket)=>{
  console.log("user connected",socket.id);
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
  })

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
})
app.use(errorMiddleware);

server.listen(port, () => console.log(`Server running on port ${port} 🔥 in ${envMode} Mode`));
