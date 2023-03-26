import { Queue } from 'bullmq';

/* eslint-disable import/prefer-default-export */
export class NotificationClient {
  constructor(type, opts) {
    this.queue = new Queue(type, opts);
  }

  /* eslint-disable no-unused-vars */
  async enqueue(jobName, job, retry = undefined) {
    await this.queue.add(jobName, job);
    console.log(`Enqueued an mobile alert to ${job.to}`);
  }

  close() {
    return this.queue.close();
  }
}

export const notificationClient = new NotificationClient('notification', {
  connection: { host: 'localhost', port: 6379 },
});
