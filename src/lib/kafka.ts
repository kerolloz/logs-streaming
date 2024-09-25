import { Kafka } from 'kafkajs';
import { env } from './env';

export const kafkaClient = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka1:9092'],
});
