import express from "express";
import bodyParser from "body-parser";
import { Server } from "socket.io";

const io = new Server({ cors: true });
const app = express();

app.use(bodyParser.json());

const emailToSocketMapping = new Map();

io.on("connection", (socket) => {
  console.log("new connection: ", socket.id);

  socket.on("join-room", (data) => {
    const { roomId, emailId } = data;
    console.log("User", emailId, "Joined Room", roomId);
    emailToSocketMapping.set(emailId, socket.id);
    socket.join(roomId);
    socket.emit("joined-room", { roomId });
    socket.broadcast.to(roomId).emit("user-joined", { emailId });
  });
});

app.listen(8000, () => {
  console.log("Http server running at http://localhost:8000");
});

io.listen(8001);
