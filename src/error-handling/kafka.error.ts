export class KafkaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KafkaError';
  }
}
