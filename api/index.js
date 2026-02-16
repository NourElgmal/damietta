const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

let cachedClient = global._mongoClient || null;
let cachedDb = global._mongoDb || null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb };
  if (!uri) throw new Error("MONGODB_URI not set");
  const client = new MongoClient(uri);
  await client.connect();
  const dbName = process.env.MONGODB_DB || "test";
  const db = client.db(dbName);
  cachedClient = client;
  cachedDb = db;
  global._mongoClient = client;
  global._mongoDb = db;
  return { client, db };
}

module.exports = async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) {
      return res
        .status(500)
        .json({ error: "MONGODB_URI environment variable is not set." });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection("numbers");

    if (req.method === "POST") {
      const body = req.body || {};
      const number = (body.number || body.phone || "").toString().trim();

      if (!number || !/^\+?\d{6,20}$/.test(number)) {
        return res.status(400).json({ error: "Invalid phone number format." });
      }

      const result = await collection.insertOne({
        number,
        createdAt: new Date(),
      });
      return res.status(201).json({ insertedId: result.insertedId });
    }

    // GET: return recent numbers
    const limit = parseInt(req.query && req.query.limit, 10) || 100;
    const docs = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return res.status(200).json({ count: docs.length, numbers: docs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
