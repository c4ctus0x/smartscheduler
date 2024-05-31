const fs = require('fs');
const { v4: generateUniqueId } = require('uuid');

const DATABASE_FILE_PATH = './store.json';
let databaseStorage = {};

if (fs.existsSync(DATABASE_FILE_PATH)) {
    databaseStorage = JSON.parse(fs.readFileSync(DATABASE_FILE_PATH, 'utf8'));
    displayLog('Database loaded successfully.');
} else {
    databaseStorage = { events: [], settings: {} };
    fs.writeFileSync(DATABASE_FILE_PATH, JSON.stringify(databaseStorage), 'utf8');
    displayLog('No existing database found. Initialized a new one.');
}

const createNewEvent = (eventDetails) => {
    eventDetails.id = generateUniqueId();
    databaseStorage.events.push(eventDetails);
    persistDatabase();
    displayLog(`Event created: ${eventDetails.id}`);
    return eventDetails;
};

const fetchEventById = (eventId) => {
    const event = databaseStorage.events.find(event => event.id === eventId);
    displayLog(event ? `Event read: ${eventId}` : `Event not found: ${eventId}`);
    return event;
};

const searchEventsByCriteria = (searchCriteria) => {
    const matchedEvents = databaseStorage.events.filter(event => {
        let doesMatchCriteria = true;
        if (searchCriteria.date) {
            doesMatchCriteria = doesMatchCriteria && event.date === searchCriteria.date;
        }
        if (searchCriteria.keyword) {
            doesMatchCriteria = doesMatchCriteria && event.title.includes(searchCriteria.keyword);
        }
        return doesMatchCriteria;
    });
    displayLog(`${matchedEvents.length} events found matching criteria.`);
    return matchedEvents;
};

const modifyEventDetails = (eventId, updatedEventData) => {
    const eventIndex = databaseStorage.events.findIndex(event => event.id === eventId);
    if (eventIndex !== -1) {
        databaseStorage.events[eventIndex] = { ...databaseStorage.events[eventIndex], ...updatedEventData };
        persistDatabase();
        displayLog(`Event updated: ${eventId}`);
        return databaseStorage.events[eventIndex];
    }
    displayLog(`Event not found for update: ${eventId}`);
    return null;
};

const removeEventById = (eventId) => {
    const eventIndex = databaseStorage.events.findIndex(event => event.id === eventId);
    if (eventIndex !== -1) {
        const [deletedEvent] = databaseStorage.events.splice(eventIndex, 1);
        persistDatabase();
        displayLog(`Event deleted: ${eventId}`);
        return deletedEvent;
    }
    displayLog(`Event not found for deletion: ${eventId}`);
    return null;
};

const applyNewSettings = (settings) => {
    databaseStorage.settings = { ...databaseStorage.settings, ...settings };
    persistDatabase();
    displayLog('Settings updated.');
    return databaseStorage.settings;
};

const getExistingSettings = () => {
    displayLog('Settings retrieved.');
    return databaseStorage.settings;
};

const detectEventConflicts = (eventProposal) => {
    const hasConflict = databaseStorage.events.some(event => {
        return event.date === eventProposal.date && !(event.endTime <= eventProposal.startTime || event.startTime >= eventProposal.endTime);
    });
    displayLog(hasConflict ? 'Conflict detected for proposed event.' : 'No conflict detected for proposed event.');
    return hasConflict;
};

const alertForUpcomingEvents = () => {
    const currentTime = new Date();
    const imminentEvents = databaseStorage.events.filter(event => {
        const eventStartDateTime = new Date(event.date + 'T' + event.startTime);
        const hoursTillEvent = (eventStartDateTime - currentTime) / (1000 * 60 * 60);
        return hoursTillEvent >= 0 && hoursTillEvent <= 24; // Events within the next 24 hours
    });
    imminentEvents.forEach(event => {
        displayLog(`Upcoming event: ${event.title} at ${event.date}, ${event.startTime}`);
    });
};

const persistDatabase = () => {
    fs.writeFileSync(DATABASE_FILE_PATH, JSON.stringify(databaseStorage), 'utf8');
    displayLog('Database saved.');
};

const displayLog = (message) => {
    console.log(`[SmartScheduler] ${message}`);
};

module.exports = {
    createNewEvent,
    fetchEventById,
    modifyEventDetails,
    removeEventById,
    applyNewSettings,
    getExistingSettings,
    detectEventConflicts,
    searchEventsByCriteria,
    alertForUpcomingEvents // Expose new functionality
};