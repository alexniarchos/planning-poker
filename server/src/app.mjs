import express from "express";
import https from "https";
import http from "http";
import fs from "fs";
import cors from "cors";
import * as socketio from "socket.io";
import { DECKS, MAX_SEATS } from "./constants/game-config.mjs";
import logger from "./logger.mjs";
import {
  getRoom,
  setRoom,
  updateRoomSettings,
  getRandomEmptySeat,
  createRoom,
  removeRoomUser,
  addRoomUser,
  updateRoomUser,
  getRoomUser,
  findUserRoom,
} from "./rooms.mjs";
import { initDB } from "./db/index.mjs";

const app = express();
app.use(cors());

let server;

if (process.env.NODE_ENV !== "production") {
  server = http.createServer({}, app);
} else {
  server = https.createServer(
    {
      key: fs.readFileSync(process.env.SSL_KEY),
      cert: fs.readFileSync(process.env.SSL_CERT),
      ca: fs.readFileSync(process.env.SSL_CA),
    },
    app
  );
}

await initDB();

const io = new socketio.Server(server, {
  cors: {
    origin: true,
  },
});

io.on("connection", (socket) => {
  socket.on("joinRoom", async ({ user }) => {
    let room = await getRoom(user.roomId);

    if (!room) {
      const newRoom = {
        id: user.roomId,
        users: {},
        showVotes: false,
        seats: MAX_SEATS,
        decks: DECKS,
        activeDeck: DECKS.fib.key,
      };

      room = await createRoom(newRoom);
    }

    const newUser = {
      ...user,
      id: socket.id,
      hasVoted: false,
      vote: null,
      seat: getRandomEmptySeat(room),
    };

    socket.join(room.id);
    addRoomUser(room.id, newUser);
    logger.info(`${newUser.name} joined the room: ${newUser.roomId}`);

    room = await getRoom(room.id);

    io.to(socket.id).emit("initState", {
      room: room.id,
      users: room.users,
      showVotes: room.showVotes,
      votes: Object.values(room.users).map((curUser) => ({
        id: curUser.id,
        vote: curUser.vote,
      })),
      decks: room.decks,
      activeDeck: room.activeDeck,
    });

    socket.broadcast.to(room.id).emit("userConnect", newUser);
  });

  socket.on("disconnecting", async () => {
    let user;

    const it = socket.rooms.values();
    const roomIds = Array.from(it);

    const roomPromises = roomIds.map(async (roomId) => {
      const room = await getRoom(roomId);
      return { roomId, room };
    });

    const rooms = await Promise.all(roomPromises);

    for (const { roomId, room } of rooms) {
      if (room) {
        user = removeRoomUser(roomId, socket.id);
        break;
      }
    }

    if (!user) {
      return;
    }

    logger.info(`${user.name} left the room: ${user.roomId}`);
    io.to(user.roomId).emit("userDisconnect", user.id);
  });

  socket.on("seatChanged", (seatId) => {
    const room = findUserRoom(socket.rooms);

    if (!room) {
      logger.error("Could not find a known room in rooms");
      return;
    }

    io.to(room.id).emit("userChangedSeat", { userId: socket.id, seat: seatId });
  });

  socket.on("vote", ({ vote }) => {
    const room = findUserRoom(socket.rooms);

    if (!room) {
      logger.error("Could not find a known room in rooms");
      return;
    }

    const user = getRoomUser(room.id, socket.id);

    const hasVoted = vote !== null;

    updateRoomUser(room.id, {
      userId: user.id,
      vote,
      hasVoted,
    });

    io.to(user.roomId).emit("userVoted", {
      userId: socket.id,
      hasVoted,
    });
  });

  socket.on("showVotes", () => {
    const room = findUserRoom(socket.rooms);

    const userVotes = Object.values(room.users).map((user) => ({
      userId: user.id,
      vote: user.vote,
    }));

    setRoom(room.id, { showVotes: true });

    io.to(room.id).emit("showVotes", userVotes);
  });

  socket.on("clearVotes", () => {
    const room = findUserRoom(socket.rooms);

    setRoom(room.id, { showVotes: false });
    Object.values(room.users).forEach((user) => {
      updateRoomUser(room.id, {
        userId: user.id,
        vote: null,
        hasVoted: false,
      });
    });

    io.to(room.id).emit("clearVotes");
  });

  socket.on("gameSettingsUpdated", async ({ decks, activeDeck }) => {
    const room = findUserRoom(socket.rooms);

    await updateRoomSettings(room.id, { decks, activeDeck });

    io.to(room.id).emit("gameSettingsUpdated", { decks, activeDeck });
  });
});

server.listen(process.env.SOCKET_PORT);
logger.info(`Server listening on port: ${process.env.SOCKET_PORT}`);
