import path from 'node:path';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import fastify from 'fastify';
import fastifyIO from 'fastify-socket.io';
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { ZodError } from 'zod';
import { env } from './lib/env';
import { kafkaClient } from './lib/kafka';
import { SWAGGER_ROUTE, registerSwagger } from './lib/swagger';
import { registerAllRoutes } from './routes';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(cors);
app.register(helmet);
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(fastifyIO);
app.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
});

registerSwagger(app);

app.setErrorHandler((error, _, reply) =>
  error instanceof ZodError
    ? reply.status(400).send({ message: 'Bad Request', error: error.issues })
    : reply.send(error),
);

app.after(() => registerAllRoutes(app));

app.listen({ host: '0.0.0.0', port: env('PORT') }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
  console.log(`Swagger available at ${address}${SWAGGER_ROUTE}`);
});

app.ready().then(async () => {
  const consumer = kafkaClient.consumer({ groupId: 'my-app' });
  await consumer.connect();
  await consumer
    .subscribe({
      topic: 'build-logs',
      fromBeginning: true,
    })
    .then(() => console.log('Subscribed to topic'))
    .catch(console.error);
  consumer.run({
    eachMessage: async ({ message }) => {
      // Emit the logs to all connected clients on websockets
      app.io.emit('logs', message.value?.toString());
    },
  });
  console.log('Server is ready');
});
