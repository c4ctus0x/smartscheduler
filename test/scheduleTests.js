// Import statements
const { describe, it, after, before } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const app = require('../app');
const scheduleService = require('../services/scheduleService');
const dotenv = require('dotenv');

// Setup dotenv configuration
before((done) => {
  dotenv.config();
  done();
});

// Main describe block for scheduling functionality tests
describe('Scheduling Functionality Tests', function() {
  this.timeout(10000); // Increasing timeout for slower environments

  // Cleanup after each test case
  afterEach(() => {
    sinon.restore(); // Restores the original state of stubbed methods
  });

  // Test case for successfully adding a new schedule
  it('should successfully add a new schedule', async () => {
    const newSchedule = {
      userId: 1,
      time: "2023-07-10T14:30:00Z",
      description: "Team meeting",
    };

    // Stubbing addSchedule method to resolve with newSchedule
    sinon.stub(scheduleService, 'addSchedule').returns(Promise.resolve(newSchedule));

    // Making a POST request to /schedule endpoint
    const response = await request(app)
      .post('/schedule')
      .send(newSchedule); // Sending newSchedule in the request body

    // Assertions
    expect(response.status).to.equal(200);
    expect(response.body).to.include(newSchedule);
  });

  // Test case for rejecting a schedule with an invalid time format
  it('should reject a schedule with invalid time format', async () => {
    const invalidSchedule = {
      userId: 1,
      time: "invalid-date",
      description: "Team meeting"
    };

    // Making a POST request with invalidSchedule
    const response = await request(app)
      .post('/schedule')
      .send(invalidSchedule);

    // Assertions
    expect(response.status).to.equal(400);
    expect(response.body.message).to.equal('Invalid time format');
  });

  // Test case for handling concurrent scheduling requests gracefully
  it('should handle concurrent scheduling requests gracefully', async () => {
    const concurrentSchedule1 = {
      userId: 1,
      time: "2023-07-10T15:00:00Z",
      description: "Doctor Appointment",
    };

    const concurrentSchedule2 = {
      userId: 2,
      time: "2023-07-10T15:00:00Z",
      description: "Client Call",
    };

    // Making concurrent requests to /schedule endpoint
    const responses = await Promise.all([
      request(app).post('/schedule').send(concurrentSchedule1),
      request(app).post('/schedule').send(concurrentSchedule2),
    ]);

    // Assertions
    responses.forEach(response => {
      expect(response.status).to.equal(200);
    });
  });

  // Test case for not allowing scheduling in the past
  it('should not allow scheduling in the past', async () => {
    const pastSchedule = {
      userId: 1,
      time: "2020-01-01T09:00:00Z",
      description: "Past event"
    };

    // Making a POST request with a schedule in the past
    const response = await request(app)
      .post('/schedule')
      .send(pastSchedule);

    // Assertions
    expect(response.status).to.equal(400);
    expect(response.body.message).to.include('cannot schedule in the past');
  });

  // Test case for ensuring high load capacity
  it('should ensure high load capacity', async () => {
    // Function to simulate high load by creating random schedule events
    const loadSchedule = () => {
      return request(app)
        .post('/schedule')
        .send({
          userId: Math.floor(Math.random() * 100),
          time: new Date().toISOString(),
          description: "High load test event",
        });
    };

    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(loadSchedule());
    }

    // Awaiting resolution of all high-load requests
    const responses = await Promise.all(promises);

    // Assertions
    responses.forEach(response => {
      expect(response.status).to.equal(200);
    });
  });
});