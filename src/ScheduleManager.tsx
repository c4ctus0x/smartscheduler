import React, { useState, useEffect } from 'react';
import FullCalendar, { EventApi, EventClickArg, EventContentArg } from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction'; // for drag-and-drop
import timeGridPlugin from '@fullcalendar/timegrid';
import { Button, Modal, Form, Input, Select, notification } from 'antd';
import './ScheduleManager.css'; // Assume appropriate CSS for layout and styling

const { Option } = Select;

interface ScheduleEvent {
  id: string;
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string
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

  // Load events from local storage or any API
  useEffect(() => {
    // Here you can replace it with API call
    const loadedEvents: ScheduleEvent[] = []; // Load from local storage or API
    setEvents(loadedEvents);
  }, []);

  const onEventAdded = (event: ScheduleEvent) => {
    setEvents((prevEvents) => [...prevEvents, event]);
    // Save to local storage or send to your API
  };

  const onEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo.event);
    setModalVisible(true);
  };

  const handleEventDrop = (event: EventApi) => {
    // Logic to handle event drop for rescheduling
    // Check for conflicts and optionally prompt the user
    // Update the event in the state and backend
  };

  const handleOk = () => {
    // Logic when modal OK is clicked
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
              <Input  placeholder={selectedEvent.title}/>
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