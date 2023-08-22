import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(new URL('.', import.meta.url).pathname, '.env') });

const config = {
  mongodb: {
    url: process.env.MONGO_URL,

    databaseName: 'planning-poker',

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
    },
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: 'migrations',

  changelogCollectionName: 'changelog',

  // The file extension to create migrations and search for in migration dir
  migrationFileExtension: '.js',

  useFileHash: false,

  // Don't change this, unless you know what you're doing
  moduleSystem: 'esm',
};

export default config;
