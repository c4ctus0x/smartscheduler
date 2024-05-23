import React, { createContext, useContext, useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';

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

  const errorHandler = (error: unknown, defaultMessage: string): ErrorResponse => {
    let errMsg: string;
    let errDetails: string;

    if (axios.isAxiosError(error)) {
      errMsg = error.response?.data.message || defaultMessage;
      errDetails = error.response?.data.details || 'No details provided';
    } else if (error instanceof Error) {
      errMsg = defaultMessage;
      errDetails = error.message;
    } else {
      errMsg = defaultMessage;
      errDetails = 'No details available';
    }

    console.error(errMsg, errDetails);
    return { message: errMsg, details: errDetails };
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get<Schedule[]>(`${process.env.REACT_APP_BACKEND_URL}/schedules`);
      setSchedules(response.data);
    } catch (error) {
      errorHandler(error, 'Failed to fetch schedules');
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
      errorHandler(error, 'Failed to update schedule');
    }
  };

  const addSchedule = async (newSchedule: Schedule) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/schedules`, newSchedule);
      setSchedules(prevSchedules => [...prevSchedules, response.data]);
    } catch (error) {
      errorHandler(error, 'Failed to add schedule');
    }
  };

  useEffect(() => {
    const eventSource = new EventSource(`${process.env.REACT_APP_BACKEND_URL}/schedules/events`);
    eventSource.onmessage = (event) => {
      const updatedSchedule: Schedule = JSON.parse(event.data);
      setSchedules(currentSchedules =>
        currentSchedules.map(schedule =>
          schedule.id === updatedSchedule.id ? updatedSchedule : schedule
        )
      );
    };
    eventSource.onerror = () => {
      console.error('EventSource failed');
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