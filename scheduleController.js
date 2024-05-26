const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const DB_FILE = './store.json';
let db = {};
if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    logToConsole('Database loaded successfully.');
} else {
    db = { events: [], settings: {} };
    fs.writeFileSync(DB_FILE, JSON.stringify(db), 'utf8');
    logToConsole('No existing database found. Initialized a new one.');
}

const createEvent = (event) => {
    event.id = uuidv4();
    db.events.push(event);
    saveDB();
    logToConsole(`Event created: ${event.id}`);
    return event;
};

const readEvent = (eventId) => {
    const event = db.events.find(event => event.id === eventId);
    logToConsole(event ? `Event read: ${eventId}` : `Event not found: ${eventId}`);
    return event;
};

const updateEvent = (eventId, newEventData) => {
    const eventIndex = db.events.findIndex(event => event.id === eventId);
    if (eventIndex !== -1) {
        db.events[eventIndex] = { ...db.events[eventIndex], ...newEventData };
        saveDB();
        logToConsole(`Event updated: ${eventId}`);
        return db.events[eventIndex];
    }
    logToConsole(`Event not found for update: ${eventId}`);
    return null;
};

const deleteEvent = (eventId) => {
    const eventIndex = db.events.findIndex(event => event.id === eventId);
    if (eventIndex !== -1) {
        const [deletedEvent] = db.events.splice(eventIndex, 1);
        saveDB();
        logToConsole(`Event deleted: ${eventId}`);
        return deletedEvent;
    }
    logToConsole(`Event not found for deletion: ${eventId}`);
    return null;
};

const updateSettings = (newSettings) => {
    db.settings = { ...db.settings, ...newSettings };
    saveDB();
    logToConsole('Settings updated.');
    return db.settings;
};

const getSettings = () => {
    logToConsole('Settings retrieved.');
    return db.settings;
};

const checkForConflicts = (proposedEvent) => {
    const hasConflict = db.events.some(event => {
        return event.date === proposedEvent.date && !(event.endTime <= proposedEvent.startTime || event.startTime >= proposedEvent.endTime);
    });
    logToConsole(hasConflict ? 'Conflict detected for proposed event.' : 'No conflict detected for proposed event.');
    return hasConflict;
};

const saveDB = () => {
    fs.writeFileSync(DB_FILE, JSON.stringify(db), 'utf8');
    logToConsole('Database saved.');
};

const logToConsole = (message) => {
    console.log(`[SmartScheduler] ${message}`);
};

module.exports = {
    createEvent,
    readEvent,
    updateEvent,
    deleteEvent,
    updateSettings,
    getSettings,
    checkForConflicts
};