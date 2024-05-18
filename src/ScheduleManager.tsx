import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar, { EventApi, EventClickArg, EventContentArg, EventAddArg, DateSelectArg } from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Button, Modal, Form, Input, Select, notification } from 'antd';
import './ScheduleManager.css';
import { debounce } from 'lodash';
import { v4 as uuidv4 } from 'uuid'; 

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
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [form] = Form.useForm();

  useEffect(() => {
    
  }, []);

  useEffect(() => {
    
  }, [events]);

  const onEventAdded = (selectInfo: DateSelectArg) => {
    const title = prompt('Please enter a new title for your event');
    const id = uuidv4(); 
    const newEvent: ScheduleEvent = {
      id,
      title: title || 'New Event',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    };

    if (title) {
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
  };

  const onEventClick = (clickInfo: EventClickArg) => {
    const clickedEvent: ScheduleEvent = {
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      participants: [], 
    };
    
    setSelectedEvent(clickedEvent);
    form.setFieldsValue({
      title: clickedEvent.title,
      participants: [], 
    });
    setModalVisible(true);
  };

  const debouncedEventUpdate = useCallback(debounce(async (event: ScheduleEvent) => {
    
  }, 1000), []);

  const handleEventDrop = (event: EventApi) => {
    const updatedEvent: ScheduleEvent = {
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
    };

    debouncedEventUpdate(updatedEvent);
    setEvents((prevEvents) => prevEvents.map((evt) => (evt.id === event.id ? updatedEvent : evt)));
  };

  const handleOk = () => {
    if (selectedEvent) {
      
      form.validateFields().then((values) => {
        const updatedEvent: ScheduleEvent = {
          ...selectedEvent,
          title: values.title,
          participants: values.participants,
        };
        setEvents((prevEvents) => prevEvents.map((evt) => (evt.id === updatedEvent.id ? updatedEvent : evt)));
        setSelectedEvent(null); 
        setModalVisible(false); 
      });
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setSelectedEvent(null); 
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
        select={onEventAdded}
      />
      <Modal
        title="Edit Event"
        visible={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Event Title" rules={[{ required: true, message: 'Please input the title of the event!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="participants" label="Participants">
            <Select mode="multiple" placeholder="Select participants">
              {participants.map((p) => (
                <Option key={p.email} value={p.email}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScheduleManager;