const request = require('supertest');
const app = require('../app');
const User = require('../models/userModel');
const mongoose = require('mongoose');

let token;
let userId;
let anotherUserId;

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
  userId = userRes.body.data._id;

  // Create another user to follow
  const anotherUser = await User.create({
    name: 'Another User',
    email: 'another@example.com',
    password: 'password123'
  });
  anotherUserId = anotherUser._id;
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
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('name', 'Test User');
  });

  it('should follow a user', async () => {
    const res = await request(app)
      .post(`/api/users/${anotherUserId}/follow`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('message', `You are now following Another User`);
  });

  it('should unfollow a user', async () => {
    await request(app)
      .post(`/api/users/${anotherUserId}/follow`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .post(`/api/users/${anotherUserId}/unfollow`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('message', `You have unfollowed Another User`);
  });
});
