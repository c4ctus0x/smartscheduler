const { describe, it, before, after } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const app = require('../app');
const scheduleService = require('../services/scheduleService');
const dotenv = require('dotenv');

before((done) => {
  dotenv.config();
  done();
});

describe('Scheduling Functionality Tests', function() {
  this.timeout(10000);

  afterEach(() => {
    sinon.restore();
  });

  it('should successfully add a new schedule', async () => {
    const newSchedule = {
      userId: 1,
      time: "2023-07-10T14:30:00Z",
      description: "Team meeting",
    };

    sinon.stub(scheduleService, 'addSchedule').returns(Promise.resolve(newSchedule));

    const response = await request(app)
      .post('/schedule')
      .send(newSchedule);

    expect(response.status).to.equal(200);
    expect(response.body).to.include(newSchedule);
  });

  it('should reject a schedule with invalid time format', async () => {
    const invalidSchedule = {
      userId: 1,
      time: "invalid-date",
      description: "Team meeting"
    };

    const response = await request(app)
      .post('/schedule')
      .send(invalidSchedule);

    expect(response.status).to.equal(400);
    expect(response.body.message).to.equal('Invalid time format');
  });

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

    const responses = await Promise.all([
      request(app).post('/schedule').send(concurrentSchedule1),
      request(app).post('/schedule').send(concurrentSchedule2)
    ]);

    responses.forEach(response => {
      expect(response.status).to.equal(200);
    });
  });

  it('should not allow scheduling in the past', async () => {
    const pastSchedule = {
      userId: 1,
      time: "2020-01-01T09:00:00Z",
      description: "Past event"
    };

    const response = await request(app)
      .post('/schedule')
      .send(pastSchedule);

    expect(response.status).to.equal(400);
    expect(response.body.message).to.include('cannot schedule in the past');
  });

  it('should ensure high load capacity', async () => {
    const loadSchedule = () => {
      return request(app)
        .post('/schedule')
        .send({
          userId: Math.floor(Math.random() * 100),
          time: new Date().toISOString(),
          description: "High load test event"
        });      
    };

    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(loadSchedule());
    }

    const responses = await Promise.all(promises);
    responses.forEach(response => {
      expect(response.status).to.equal(200);
    });
  });
});