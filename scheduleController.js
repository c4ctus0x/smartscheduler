const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const DB_FILE = './store.json';
let db = {};
if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
} else {
    db = { events: [], settings: {} };
    fs.writeFileSync(DB_FILE, JSON.stringify(db), 'utf8');
}

const createEvent = (event) => {
    event.id = uuidv4(); 
    db.events.push(event);
    saveDB();
    return event;
};

const readEvent = (eventId) => {
    return db.events.find(event => event.id === eventId);
};

const updateEvent = (eventId, newEventData) => {
    const eventIndex = db.events.findIndex(event => event.id === eventId);
    if (eventIndex !== -1) {
        db.events[eventIndex] = { ...db.events[eventIndex], ...newEventData };
        saveDB();
        return db.events[eventIndex];
    }
    return null;
};

const deleteEvent = (eventId) => {
    const eventIndex = db.events.findIndex(event => event.id === eventId);
    if (eventIndex !== -1) {
        const [deletedEvent] = db.events.splice(eventIndex, 1);
        saveDB();
        return deletedEvent;
    }
    return null;
};

const updateSettings = (newSettings) => {
    db.settings = { ...db.settings, ...newSettings };
    saveDB();
    return db.settings;
};

const getSettings = () => {
    return db.settings;
};

const checkForConflicts = (proposedEvent) => {
    return db.events.some(event => {
        return event.date === proposedEvent.date && !(event.endTime <= proposedEvent.startTime || event.startTime >= proposedEvent.endTime);
    });
};

const saveDB = () => {
    fs.writeFileSync(DB_FILE, JSON.stringify(db), 'utf8');
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