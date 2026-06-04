import { beforeAll, afterAll } from '@jest/globals';

beforeAll(() => {
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '5432';
  process.env.DB_NAME = 'pricepulse_test';
  process.env.DB_USER = 'pricepulse';
  process.env.DB_PASSWORD = 'pricepulse';
});

afterAll(() => {

});
