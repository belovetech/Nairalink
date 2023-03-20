import { Queue } from "bullmq";

export class NotificationClient {
  queue;
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
