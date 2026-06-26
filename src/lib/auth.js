import { betterAuth } from 'better-auth';
import { MongoClient } from 'mongodb';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.AUTH_DB_NAME;

if (!uri) {
  throw new Error('Please add MONGODB_URI to your .env file');
}

// কানেকশন লিক বন্ধ করতে গ্লোবাল ভেরিয়েবল লজিক
let client;

if (process.env.NODE_ENV === 'development') {
  // ডেভেলপমেন্ট মোডে গ্লোবাল ভেরিয়েবল ব্যবহার করা হবে
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri);
  }
  client = global._mongoClient;
} else {
  // প্রোডাকশনে নতুন ক্লায়েন্ট তৈরি হবে
  client = new MongoClient(uri);
}

const db = client.db(dbName);

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client, // ট্রানজ্যাকশন এনাবল রাখার জন্য
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      role: {
        default: 'user',
      },
      plan: {
        default: 'free',
      },
    },
  },
});
