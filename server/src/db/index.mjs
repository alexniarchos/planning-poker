import { MongoClient } from 'mongodb';
import logger from '../logger.mjs';

let db;

async function initDB() {
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  db = client.db('planning-poker');
  logger.info('Connected to MongoDB');
}

async function fetchRoom(id) {
  try {
    return await db.collection('rooms').findOne({ id });
  } catch (err) {
    logger.error(err);
    return null;
  }
}

async function insertRoom(room) {
  try {
    await db.collection('rooms').insertOne(room);
  } catch (err) {
    logger.error(err);
  }
}

async function deleteRoom(id) {
  try {
    await db.collection('rooms').deleteOne({ id });
  } catch (err) {
    logger.error(err);
  }
}

async function updateRoom(id, room) {
  try {
    await db.collection('rooms').updateOne({ id }, { $set: room });
  } catch (err) {
    logger.error(err);
  }
}

export {
  initDB, fetchRoom, insertRoom, deleteRoom, updateRoom,
};
