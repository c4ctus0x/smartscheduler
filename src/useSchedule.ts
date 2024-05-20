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

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

const ScheduleProvider: React.FC = ({ children }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/schedules`);
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch schedules', error);
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
      console.error('Failed to update schedule', error);
    }
  };

  const addSchedule = async (newSchedule: Schedule) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/schedules`, newSchedule);
      setSchedules(prevSchedules => [...prevSchedules, response.data]);
    } catch (error) {
      console.error('Failed to add schedule', error);
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