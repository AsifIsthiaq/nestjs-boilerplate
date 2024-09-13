export class MongodbError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MongodbError';
  }
}
