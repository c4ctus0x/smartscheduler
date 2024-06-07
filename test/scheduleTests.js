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

describe('Schedule Functionality Tests', function() {
  this.timeout(10000);

  afterEach(() => {
    sinon.restore();
  });

  it('add a new schedule successfully', async () => {
    const validSchedule = generateNewSchedule();
    mockScheduleService(validStringchedule);

    const response = await sendScheduleRequest(validSchedule);

    validateScheduleResponse(response, 200, validSchedule);
  });

  it('reject an invalid time format in schedule', async () => {
    const invalidTimeSchedule = generateInvalidTimeSchedule();

    const response = await sendScheduleRequest(invalidTimeSchedule);

    expect(response.status).to.equal(400);
    expect(response.body.message).to.equal('Invalid time format');
  });

  it('gracefully handle multiple scheduling requests', async () => {
    const [firstConcurrentSchedule, secondConcurrentSchedule] = generateConcurrentSchedules();
    const responses = await Promise.all([
      sendScheduleRequest(firstConcurrentSchedule),
      sendScheduleRequest(secondConcurrentSchedule),
    ]);

    responses.forEach(response => {
      expect(response.status).to.equal(200);
    });
  });

  it('prevent scheduling in the past', async () => {
    const pastTimeSchedule = generatePastTimeSchedule();

    const response = await sendScheduleRequest(pastTimeSchedule);

    expect(response.status).to.equal(400);
    expect(response.body.message).to.include('cannot schedule in the past');
  });

  it('ensure functionality under high load', async () => {
    const loadResponses = await simulateHighLoadScenario();

    loadResponses.forEach(response => {
      expect(response.status).to.equal(200);
    });
  });
});

function generateNewSchedule() {
  return {
    userId: 1,
    time: "2023-07-10T14:30:00Z",
    description: "Team meeting",
  };
}

function generateInvalidTimeSchedule() {
  return {
    userId: 1,
    time: "invalid-date",
    description: "Team meeting"
  };
}

function generateConcurrentSchedules() {
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

function generatePastTimeSchedule() {
  return {
    userId: 1,
    time: "2020-01-01T09:00:00Z",
    description: "Past event"
  };
}

function simulateHighLoadScenario() {
  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(sendScheduleRequest({
      userId: Math.floor(Math.random() * 100),
      time: new Date().toISOString(),
      description: "High load test event",
    }));
  }
  return Promise.all(promises);
}

async function sendScheduleRequest(schedule) {
  return request(app).post('/schedule').send(schedule);
}

function mockScheduleService(schedule) {
  sinon.stub(scheduleService, 'addSchedule').returns(Promise.resolve(schedule));
}

function validateScheduleResponse(response, expectedStatus, schedule) {
  expect(response.status).to.equal(expectedStatus);
  expect(response.body).to.deep.include(schedule);
}