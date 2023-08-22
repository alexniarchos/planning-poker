export const up = async (db) => {
  await db.createCollection('rooms');
};

export const down = async (db) => {
  await db.collection('rooms').drop();
};
