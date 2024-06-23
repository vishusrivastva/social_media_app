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
  token = userRes.body.data.token;
});

afterAll(async () => {
  await User.deleteMany({});
  await Status.deleteMany({});
  await mongoose.connection.close();
});

describe('Status Controller', () => {
  it('should create a new status', async () => {
    const res = await request(app)
      .post('/api/statuses')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Test status' });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('text', 'Test status');
    statusId = res.body.data._id;
  });

  it('should get a status by ID', async () => {
    const res = await request(app)
      .get(`/api/statuses/${statusId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('text', 'Test status');
  });

  it('should get all statuses', async () => {
    const res = await request(app)
      .get('/api/statuses')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });
});
