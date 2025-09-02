// lib/mongodb.ts
import { MongoClient } from "mongodb";
import mongoose from "mongoose";

export const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};


const uri = process.env.MONGODB_URI!;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Extend the NodeJS global type to avoid redeclaration errors
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI in .env.local");
}

if (process.env.NODE_ENV === "development") {
  // Use global variable to avoid creating multiple connections in development
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new client for each connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
