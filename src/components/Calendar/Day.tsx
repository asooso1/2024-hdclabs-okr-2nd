import React from "react";
import { DayProps, Event } from "./types";
import { isFirstDayOfEvent, isLastDayOfEvent, isDateInEvent } from "./utils";

const Day: React.FC<DayProps> = ({ date, events, isCurrentMonth, onClick }) => {
  const filteredEvents = events.filter(event => isDateInEvent(date, event));
  
  const isPreferredDate = filteredEvents.some(event => event.color === '#34D399');

  const sortedEvents = filteredEvents
    .sort((a, b) => {
      const startDiff = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      if (startDiff === 0) {
        const aLength = new Date(a.endTime).getTime() - new Date(a.startTime).getTime();
        const bLength = new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
        return bLength - aLength;
      }
      return startDiff;
    });

  return (
    <div 
      className={`relative h-full min-h-[120px] p-2 border border-stroke dark:border-strokedark ${
        isCurrentMonth ? '' : 'bg-gray-100 dark:bg-meta-4'
      } ${isPreferredDate ? 'bg-[#34D399]/10 dark:bg-[#34D399]/20' : ''}`}
      onClick={() => onClick?.(date)}
    >
      <div className="w-full h-full">
        <span
          className={`font-medium ${isCurrentMonth ? "text-black dark:text-white" : "text-gray-400"}`}
        >
          {date.getDate()}
        </span>
        <div className="absolute left-0 right-0 top-8 flex flex-col gap-0.5  h-full">
          {sortedEvents.slice(0, 3).map((event, index) => {
            const isFirst = isFirstDayOfEvent(date, event);
            const isLast = isLastDayOfEvent(date, event);
            
            return (
              <div
                key={`${event.id}-${index}`}
                style={{
                  position: 'absolute',
                  top: `${index * 1.5}rem`,
                  left: 0,
                  right: 0,
                  backgroundColor: event.color ? `${event.color}20` : '#3C50E020'
                }}
                className={`flex h-5 items-center ${
                  isFirst ? `pl-2 rounded-l-full border-l-4 ${
                    event.color ? `border-[${event.color}]` : 'border-blue-500'
                  }` : "pl-0"
                }
                  ${isLast ? "pr-2 rounded-r-full" : "pr-0"}
                  ${!isFirst && !isLast ? "px-0" : ""}`}
              >
                {isFirst && (
                  <span className={`text-xs whitespace-nowrap z-10 font-medium ${
                    event.color ? `text-[${event.color}]` : 'text-blue-800'
                  } sm:truncate dark:text-blue-100`}>
                    {event.title}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Day;
