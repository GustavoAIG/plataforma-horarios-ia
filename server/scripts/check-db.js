require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || process.argv[2];
if (!uri) {
  console.error('ERROR: Provide MONGODB_URI in env or as first argument');
  process.exit(2);
}

async function run() {
  try {
    await mongoose.connect(uri);
    const ping = await mongoose.connection.db.admin().ping();
    console.log('DB ping result:', ping); // expected { ok: 1 }
    console.log('mongoose readyState:', mongoose.connection.readyState); // 1 = connected
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }
}

run();
