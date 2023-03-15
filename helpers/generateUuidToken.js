// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuid4 } from 'uuid';

const UuidToken = (id) => uuid4(id);

module.exports = UuidToken;
