import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar, { EventApi, EventClickArg, EventContentArg } from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Button, Modal, Form, Input, Select, notification } from 'antd';
import './ScheduleManager.css';
import { debounce } from 'lodash';

const { Option } = Select;

interface ScheduleEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  participants?: string[];
}

interface Participant {
  email: string;
  name: string;
}

const initialParticipants: Participant[] = [
  { email: 'example1@example.com', name: 'John Doe' },
  { email: 'example2@example.com', name: 'Jane Doe' },
];

const ScheduleManager: React.FC = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null);
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);

  useEffect(() => {
    async function fetchEvents() {
      // Mock API Call
      const loadedEvents: ScheduleEvent[] = []; // Replace with your fetching method
      setEvents(loadedEvents);
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    async function saveEvents() {
      // Mock saving logic, replace with API call
    }
    saveEvents();
  }, [events]);

  const onEventAdded = (event: ScheduleEvent) => {
    setEvents((prevEvents) => [...prevEvents, event]);
  };

  const onEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo.event);
    setModalVisible(true);
  };

  // Debounce function to delay the execution
  const debouncedEventUpdate = useCallback(debounce(async (event: ScheduleEvent) => {
    // Implementation of API call to update the event in the backend
    console.log('Event updated:', event); // Replace with actual API call
  }, 1000), []); // 1000 ms delay

  const handleEventDrop = (event: EventApi) => {
    // Prepare the updated event data
    const updatedEvent: ScheduleEvent = {
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
    };

    // Call the debounced function
    debouncedEventUpdate(updatedEvent);

    // Update the event locally (optional, could await API update)
    setEvents((prevEvents) =>
      prevEvents.map((evt) => (evt.id === event.id ? updatedEvent : evt)),
    );
  };

  const handleOk = () => {
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const eventRender = (eventContent: EventContentArg) => {
    return (
      <>
        <b>{eventContent.timeText}</b>
        <i>{eventContent.event.title}</i>
      </>
    );
  };

  return (
    <div className="schedule-manager">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        events={events}
        eventClick={onEventClick}
        eventContent={eventRender}
        eventDrop={(eventDropInfo) => handleEventDrop(eventDropInfo.event)}
      />
      {selectedEvent && (
        <Modal
          title="Edit Event"
          visible={modalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Form layout="vertical">
            <Form.Item label="Event Title">
              <Input defaultValue={selectedEvent.title} />
            </Form.Item>
            <Form.Item label="Participants">
              <Select mode="multiple" placeholder="Select participants">
                {participants.map((p) => (
                  <Option key={p.email} value={p.email}>{p.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default ScheduleManager;