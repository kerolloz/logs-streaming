import { Worker } from 'bullmq';
import { redisClient } from '../lib/redis';
import { BUILD_JOBS_QUEUE_NAME, type BuildJob } from './config';
import { exec } from 'node:child_process';
import { kafkaClient } from '../lib/kafka';

const producer = kafkaClient.producer();
const admin = kafkaClient.admin();
await producer.connect();
await admin.connect();
await admin
  .createTopics({
    topics: [{ topic: 'build-logs' }],
  })
  .then(() => console.log('Created topic'))
  .catch(console.error)
  .finally(() => admin.disconnect());

const sendLog = async (data: string) =>
  await producer.send({
    topic: 'build-logs',
    messages: [{ value: data }],
  });

const buildJobsWorker = new Worker<BuildJob>(
  BUILD_JOBS_QUEUE_NAME,
  async (job) => {
    const startTimestamp = Date.now();
    const script = `
    set -e #
    echo ">> Job #${job.id} started"
    echo ">> Cloning ${job.data.githubRepoUrl}"
    # Suppress the output of the git clone command
    git clone ${job.data.githubRepoUrl} /tmp/job-${job.id} --depth 1 > /dev/null 2>&1
    echo ">> Cloning finished"
    cd /tmp/job-${job.id}
    echo ">> Running build command"
    ${job.data.buildCommand} # This is NOT SAFE and should not be used in production
    echo ">> Build command finished"
    rm -rf /tmp/job-${job.id} # Clean up
    `;

    const process = exec(script, { cwd: '/tmp' });
    // Stream the logs of the running process to kafka

    process.stdout?.on('data', sendLog);
    process.stderr?.on('data', sendLog);
    process.on('exit', async (code) => {
      await sendLog(`>> Exited with code ${code}\n`);
      await sendLog(`>> Finished in ${Date.now() - startTimestamp}ms`);
    });
  },
  { connection: redisClient },
);

buildJobsWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

buildJobsWorker.on('ready', () => {
  console.log('Worker ready');
});
