const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

let clients = []; // SSE clients

// SSE endpoint
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  clients.push(newClient);

  res.write(`data: Connected to SSE\n\n`);

  req.on("close", () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

// function to send SSE notifications
function sendNotification(message) {
  clients.forEach(client => {
    client.res.write(`data: ${message}\n\n`);
  });
}

// socket connection
io.on("connection", (socket) => {
  console.log("User connected");

  sendNotification("A user joined the chat 🚀");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    sendNotification("A user left the chat ❌");
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});