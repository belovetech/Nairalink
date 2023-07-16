import { NotificationClient } from './notification';

class AlertClient extends NotificationClient {}

const alertClient = new AlertClient('alert', {
  connection: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
});

export default alertClient;
