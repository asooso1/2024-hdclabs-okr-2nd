import { Event } from "./types";

export const getDaysInMonth = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const days: Date[] = [];
  const currentDate = new Date(startDate);

  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
};

export const getEventsForDate = (date: Date, events: Event[]): Event[] => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return events.filter((event) => {
    const eventStart = new Date(event.startTime);
    eventStart.setHours(0, 0, 0, 0);
    const eventEnd = new Date(event.endTime);
    eventEnd.setHours(23, 59, 59, 999);

    return startOfDay <= eventEnd && endOfDay >= eventStart;
  });
};

export const isFirstDayOfEvent = (date: Date, event: Event): boolean => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const eventStart = new Date(event.startTime);
  eventStart.setHours(0, 0, 0, 0);

  return startOfDay.getTime() === eventStart.getTime();
};

export const isLastDayOfEvent = (date: Date, event: Event): boolean => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const eventEnd = new Date(event.endTime);
  eventEnd.setHours(0, 0, 0, 0);

  return startOfDay.getTime() === eventEnd.getTime();
};

export const isDateInEvent = (date: Date, event: Event): boolean => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const eventStart = new Date(event.startTime);
  eventStart.setHours(0, 0, 0, 0);
  
  const eventEnd = new Date(event.endTime);
  eventEnd.setHours(0, 0, 0, 0);

  return startOfDay >= eventStart && startOfDay <= eventEnd;
};
