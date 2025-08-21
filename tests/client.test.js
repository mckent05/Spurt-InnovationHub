const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = require('../app.js');
const User = require('../model/user');
const Client = require('../model/client');
const Project = require('../model/project');
let connectionString = process.env.MONGO_URI
connectionString = connectionString.replace("<password>", encodeURIComponent(process.env.password))

describe('Client and Project Endpoints', () => {
  let token;

  beforeAll(async () => {
    // Connect to your test DB
    await mongoose.connect(connectionString);

    // Clean up database
    await User.deleteMany();
    await Client.deleteMany();
    await Project.deleteMany();

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = new User({
      username: 'testuser',
      password: hashedPassword,
      role: 'admin',
    });
    await user.save();

    // Login and get token
    const res = await request(app).post('/api/auth/login').send({
      username: 'testuser',
      password: 'password123',
    });
    token = res.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test('POST /api/clients should create a client', async () => {
    const res = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Client',
        email: 'unique-client1@example.com',
        phone: '1234567890',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('name', 'Test Client');
    expect(res.body).toHaveProperty('email', 'unique-client1@example.com');
  });

  test('PUT /api/projects/:id should update a project', async () => {
    // Create client
    const client = new Client({
      name: 'Test Client 2',
      email: 'unique-client2@example.com',
    });
    await client.save();

    // Create project
    const project = new Project({
      title: 'Test Project',
      client: client._id,
    });
    await project.save();

    // Update project
    const res = await request(app)
      .put(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Project',
        client: client._id,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'Updated Project');
    expect(res.body.client).toBe(client._id.toString());
  });
});
