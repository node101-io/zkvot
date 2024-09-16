import mongoose, { Connection } from 'mongoose';

class Database {
  private static instance: Connection;
  private static isConnecting: Promise<Connection> | null = null;

  private constructor() {}

  public static async getInstance(): Promise<Connection> {
    if (Database.instance) {
      return Database.instance;
    }

    if (Database.isConnecting) {
      return Database.isConnecting;
    }

    Database.isConnecting = new Promise<Connection>((resolve, reject) => {
      mongoose.connect(
        process.env.MONGO_URI ?? 'mongodb://localhost:27017/zkvot'
      );

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        Database.isConnecting = null;
        reject(err);
      });

      mongoose.connection.once('open', () => {
        console.log('Connected successfully to MongoDB');
        Database.instance = mongoose.connection;
        Database.isConnecting = null;
        resolve(Database.instance);
      });
    });

    return Database.isConnecting;
  }
}

export default Database;
