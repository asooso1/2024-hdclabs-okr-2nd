"use client";

import React, { useState } from "react";
import { CalendarProps, Event } from "./types";
import { getDaysInMonth, getEventsForDate } from "./utils";
import Day from "./Day";
import EventModal from "@/components/Calendar/EventModal";

const Calendar: React.FC<CalendarProps> = ({
  events = [],
  className,
  onDateClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = getDaysInMonth(currentDate);

  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date);
    }
  };

  return (
    <div
      className={`w-full max-w-full rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ${className}`}
    >
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => {
            const newDate = new Date(currentDate);
            newDate.setMonth(currentDate.getMonth() - 1);
            setCurrentDate(newDate);
          }}
          className="p-2"
        >
          이전
        </button>
        <h2 className="text-xl font-semibold">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h2>
        <button
          onClick={() => {
            const newDate = new Date(currentDate);
            newDate.setMonth(currentDate.getMonth() + 1);
            setCurrentDate(newDate);
          }}
          className="p-2"
        >
          다음
        </button>
      </div>

      <table className="w-full">
        <thead>
          <tr className="grid grid-cols-7 rounded-t-sm bg-primary text-white">
            {weekDays.map((day) => (
              <th
                key={day}
                className="flex h-15 items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5"
              >
                <span className="hidden lg:block">{day}</span>
                <span className="block lg:hidden">{day.slice(0, 3)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, weekIndex) => (
            <tr key={weekIndex} className="grid grid-cols-7">
              {days
                .slice(weekIndex * 7, (weekIndex + 1) * 7)
                .map((date, dayIndex) => (
                  <Day
                    key={dayIndex}
                    date={date}
                    events={getEventsForDate(date, events)}
                    isCurrentMonth={date.getMonth() === currentDate.getMonth()}
                    onClick={handleDateClick}
                  />
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Calendar;
