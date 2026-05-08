/**
 * Gateway does not connect to MongoDB.
 * (Auth/Profile services own the DB connection in microservice mode.)
 */
export async function connectDB(): Promise<void> {
  return;
}
