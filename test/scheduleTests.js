const { describe, it, afterEach, before } = require('mocha');
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
    const newSchedule = createNewSchedule();
    stubScheduleService(newSchedule);

    const response = await postSchedule(newSchedule);

    assertScheduleResponse(response, 200, newSchedule);
  });

  it('should reject a schedule with invalid time format', async () => {
    const invalidSchedule = createInvalidSchedule();

    const response = await postSchedule(invalidSchedule);

    expect(response.status).to.equal(400);
    expect(response.body.message).to.equal('Invalid time format');
  });

  it('should handle concurrent scheduling requests gracefully', async () => {
    const [concurrentSchedule1, concurrentSchedule2] = createConcurrentSchedules();
    const responses = await Promise.all([
      postSchedule(concurrentSchedule1),
      postSchedule(concurrentSchedule2),
    ]);

    responses.forEach(response => {
      expect(response.status).to.equal(200);
    });
  });

  it('should not allow scheduling in the past', async () => {
    const pastSchedule = createPastSchedule();

    const response = await postSchedule(pastSchedule);

    expect(response.status).to.equal(400);
    expect(response.body.message).to.include('cannot schedule in the past');
  });

  it('should ensure high load capacity', async () => {
    const responses = await simulateHighLoad();

    responses.forEach(response => {
      expect(response.status).to.equal(200);
    });
  });
});

function createNewSchedule() {
  return {
    userId: 1,
    time: "2023-07-10T14:30:00Z",
    description: "Team meeting",
  };
}

function createInvalidSchedule() {
  return {
    userId: 1,
    time: "invalid-date",
    description: "Team meeting"
  };
}

function createConcurrentSchedules() {
  return [{
      userId: 1,
      time: "2023-07-10T15:00:00Z",
      description: "Doctor Appointment",
    }, {
      userId: 2,
      time: "2023-07-10T15:00:00Z",
      description: "Client Call",
  }];
}

function createPastSchedule() {
  return {
    userId: 1,
    time: "2020-01-01T09:00:00Z",
    description: "Past event"
  };
}

function simulateHighLoad() {
  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(postSchedule({
      userId: Math.floor(Math.random() * 100),
      time: new Date().toISOString(),
      description: "High load test event",
    }));
  }
  return Promise.all(promises);
}

async function postSchedule(schedule) {
  return request(app).post('/schedule').send(schedule);
}

function stubScheduleService(schedule) {
  sinon.stub(scheduleService, 'addSchedule').returns(Promise.resolve(schedule));
}

function assertScheduleResponse(response, expectedStatus, schedule) {
  expect(response.status).to.equal(expectedStatus);
  expect(response.body).to.include(schedule);
}