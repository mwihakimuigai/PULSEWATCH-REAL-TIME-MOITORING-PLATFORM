import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env";

let io: Server;

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    socket.emit("connected", { message: "Socket connected to PulseWatch" });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized");
  }
  return io;
};
