const Queue = require('bullmq').Queue;

class NotificationClient {
  constructor(type, opts) {
    this.queue = new Queue(type, opts);
  }

  async enqueue(jobName, job, retry = undefined) {
    await this.queue.add(jobName, job);
    console.log(`Enqueued ${jobName} notification to ${job.to}`);
  }

  close() {
    return this.queue.close();
  }
}

module.exports = new NotificationClient('notification', {
  connection: { host: 'localhost', port: 6379 },
});
