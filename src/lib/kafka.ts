import { Kafka } from 'kafkajs';
import { env } from './env';

export const kafkaClient = new Kafka({
  clientId: 'my-app',
  brokers: [env('KAFKA_CONNECTION_STRING')],
});
