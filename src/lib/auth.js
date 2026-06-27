import { betterAuth } from 'better-auth';
import { MongoClient } from 'mongodb';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.AUTH_DB_NAME;

let client;
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri);
  }
  client = global._mongoClient;
} else {
  client = new MongoClient(uri);
}

const db = client.db(dbName);

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
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
  // ১. additionalFields এর সিনট্যাক্স আপডেট করা হয়েছে
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
      },
      plan: {
        type: 'string',
        defaultValue: 'free',
      },
    },
  },

  // user jeivabei login or sign up koruk na keno role r plan set hobe jodi na thkae
  // databaseHooks: {
  //   user: {
  //     create: {
  //       before: async user => {
  //         return {
  //           ...user,
  //           role: user.role || 'user',
  //           plan: user.plan || 'free',
  //         };
  //       },
  //     },
  //   },
  // },
});
