import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface Schedule {
  id: string;
  timestamp: string;
  task: string;
}

interface ScheduleContextType {
  schedules: Schedule[];
  fetchSchedules: () => void;
  updateSchedule: (updatedSchedule: Schedule) => void;
  addSchedule: (newSchedule: Schedule) => void;
}

interface ErrorResponse {
  message: string;
  details?: string;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

const ScheduleProvider: React.FC = ({ children }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const errorHandler = (error: any, defaultMessage: string): ErrorResponse => {
    if (axios.isAxiosError(error)) {
      return {
        message: error.response?.data.message || defaultMessage,
        details: error.response?.data.details || 'No details provided'
      };
    } else {
      return {
        message: defaultMessage,
        details: error.message || 'No details available'
      };
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/schedules`);
      setSchedules(response.data);
    } catch (error) {
      const { message, details } = errorHandler(error, 'Failed to fetch schedules');
      console.error(message, details);
    }
  };

  const updateSchedule = async (updatedSchedule: Schedule) => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/schedules/${updatedSchedule.id}`, updatedSchedule);
      const updatedSchedules = schedules.map(schedule =>
        schedule.id === updatedSchedule.id ? updatedSchedule : schedule
      );
      setSchedules(updatedSchedules);
    } catch (error) {
      const { message, details } = errorHandler(error, 'Failed to update schedule');
      console.error(message, details);
    }
  };

  const addSchedule = async (newSchedule: Schedule) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/schedules`, newSchedule);
      setSchedules(prevSchedules => [...prevSchedules, response.data]);
    } catch (error) {
      const { message, details } = errorHandler(error, 'Failed to add schedule');
      console.error(message, details);
    }
  };

  useEffect(() => {
    const eventSource = new EventSource(`${process.env.REACT_APP_BACKEND_URL}/schedules/events`);
    eventSource.onmessage = (event) => {
      const updatedSchedule = JSON.parse(event.data);
      setSchedules(currentSchedules =>
        currentSchedules.map(schedule =>
          schedule.id === updatedSchedule.id ? updatedSchedule : schedule
        )
      );
    };
    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <ScheduleContext.Provider value={{ schedules, fetchSchedules, updateSchedule, addSchedule }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedules = (): ScheduleContextType => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedules must be used within a ScheduleProvider');
  }
  return context;
};

export default ScheduleProvider;