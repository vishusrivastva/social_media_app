const request = require('supertest');
const app = require('../app');
const User = require('../models/userModel');
const mongoose = require('mongoose');

let token;
let userId;

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
  userId = userRes.body._id;
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('User Controller', () => {
  it('should get user profile', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Test User');
  });

  it('should follow a user', async () => {
    // Create another user to follow
    const anotherUser = await User.create({
      name: 'Another User',
      email: 'another@example.com',
      password: 'password123'
    });

    const res = await request(app)
      .post(`/api/users/${anotherUser._id}/follow`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', `You are now following ${anotherUser.name}`);
  });
});