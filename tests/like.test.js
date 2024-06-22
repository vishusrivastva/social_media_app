const request = require('supertest');
const app = require('../app');
const User = require('../models/userModel');
const Status = require('../models/statusModel');
const mongoose = require('mongoose');

let token;
let statusId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Create a user and get token
  const userRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
  token = userRes.body.token;

  // Create a status
  const statusRes = await request(app)
    .post('/api/statuses')
    .set('Authorization', `Bearer ${token}`)
    .send({ text: 'Test status' });
  statusId = statusRes.body._id;
});

afterAll(async () => {
  await User.deleteMany({});
  await Status.deleteMany({});
  await mongoose.connection.close();
});

describe('Like Controller', () => {
  it('should like a status', async () => {
    const res = await request(app)
      .post('/api/likes')
      .set('Authorization', `Bearer ${token}`)
      .send({ statusId: statusId });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Status liked');
  });
});