import { MongoClient, ObjectId } from 'mongodb';

class TinderMongoClient {
  private client: MongoClient;
  private db: any;

  constructor(uri: string, dbName: string) {
    this.client = new MongoClient(uri);
    this.db = this.client.db(dbName);
  }

  async connect() {
    await this.client.connect();
    console.log('Connected to MongoDB');
  }

  async disconnect() {
    await this.client.close();
    console.log('Disconnected from MongoDB');
  }

  async addMatch(userId: string, profile: any) {
    const userCollection = this.db.collection('users');
    await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { matches: { timestamp: new Date(), profile } } },
    );
  }

  async addSwipe(userId: string, profile: any, direction: string) {
    const userCollection = this.db.collection('users');
    await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { swipes: { profile, direction, timestamp: new Date() } } },
    );
  }

  async addProfileUpdate(userId: string, imageIndex: number, newImage: string) {
    const profileUpdatesCollection = this.db.collection('profile_updates');
    const userCollection = this.db.collection('users');
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });

    if (user && user.profile && user.profile.images) {
      user.profile.images[imageIndex] = newImage;
      await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { 'profile.images': user.profile.images } },
      );

      await profileUpdatesCollection.insertOne({
        timestamp: new Date(),
        profile: user.profile,
      });
    }
  }
}

export default TinderMongoClient;
