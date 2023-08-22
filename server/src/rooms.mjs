import { insertRoom, updateRoom, fetchRoom } from './db/index.mjs';

const rooms = {};

function getRooms() {
  return rooms;
}

async function getRoom(id) {
  if (rooms[id]) {
    return rooms[id];
  }

  const room = await fetchRoom(id);

  if (!room) {
    return null;
  }

  rooms[id] = {
    ...room,
    users: {},
    showVotes: false,
  };

  return rooms[id];
}

function setRoom(id, newRoom) {
  rooms[id] = {
    ...rooms[id],
    ...newRoom,
  };

  return rooms[id];
}

async function updateRoomSettings(id, roomSettings) {
  rooms[id].decks = roomSettings.decks;
  rooms[id].activeDeck = roomSettings.activeDeck;

  await updateRoom(id, {
    decks: roomSettings.decks,
    activeDeck: roomSettings.activeDeck,
  });

  return rooms[id];
}

async function createRoom(newRoom) {
  const {
    id, seats, decks, activeDeck,
  } = newRoom;

  if (!rooms[newRoom.id]) {
    rooms[newRoom.id] = newRoom;
  }

  await insertRoom({
    id,
    seats,
    decks,
    activeDeck,
  });

  return newRoom;
}

function removeRoom(id) {
  delete rooms[id];
}

function addRoomUser(id, user) {
  rooms[id].users[user.id] = user;
}

function removeRoomUser(roomId, id) {
  if (!rooms[roomId]) {
    return null;
  }

  const user = { ...rooms[roomId].users[id] };
  delete rooms[roomId].users[id];

  return user;
}

function updateRoomUser(roomId, { userId, vote, hasVoted }) {
  rooms[roomId].users[userId] = {
    ...rooms[roomId].users[userId],
    vote,
    hasVoted,
  };
}

function getRoomUser(roomId, userId) {
  return rooms[roomId].users[userId];
}

function findUserRoom(userRooms) {
  let room = null;

  for (const roomId of userRooms) {
    if (rooms[roomId]) {
      room = rooms[roomId];
    }
  }

  return room;
}

function getRandomEmptySeat(room) {
  const occupiedSeats = Object.values(room.users)
    .map((user) => user.seat)
    .filter((seat) => seat !== null);

  const emptySeats = [...Array(room.seats).keys()].filter(
    (seat) => !occupiedSeats.includes(seat),
  );

  return emptySeats[Math.floor(Math.random() * emptySeats.length)];
}

export {
  createRoom,
  removeRoom,
  getRooms,
  getRoom,
  setRoom,
  updateRoomSettings,
  getRandomEmptySeat,
  addRoomUser,
  removeRoomUser,
  updateRoomUser,
  getRoomUser,
  findUserRoom,
};
