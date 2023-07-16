/* eslint-disable no-unused-vars */
import { Queue } from 'bullmq';

class NotificationClient {
  constructor(opts) {
    this.queue = new Queue('notification', opts);
  }

  async enqueue(jobName, job, retry = undefined) {
    await this.queue.add(jobName, job);
    console.log(`Enqueued an email sending to ${job.to}`);
  }

  close() {
    return this.queue.close();
  }
}

module.exports = { NotificationClient };
