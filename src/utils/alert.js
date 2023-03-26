import { NotificationClient } from './notification';

class AlertClient extends NotificationClient {}

const alertClient = new AlertClient('alert', {
  connection: { host: 'localhost', port: 6379 },
});

export default alertClient;
