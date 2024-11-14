import React from "react";
import { DayProps, Event } from "./types";
import { isFirstDayOfEvent, isLastDayOfEvent } from "./utils";

const Day: React.FC<DayProps & { onClick?: (date: Date) => void }> = ({
  date,
  events,
  isCurrentMonth,
  onClick
}) => {
  return (
    <td
      onClick={() => onClick?.(date)}
      className={`ease relative h-24 border border-stroke p-2 transition duration-500 dark:border-strokedark cursor-pointer hover:bg-gray-50 dark:hover:bg-meta-4
        ${!isCurrentMonth ? "text-gray-400" : ""}
        ${date.getDate() === new Date().getDate() &&
          date.getMonth() === new Date().getMonth() &&
          date.getFullYear() === new Date().getFullYear()
          ? "bg-blue-50 dark:bg-blue-900/20"
          : ""
        }
      `}
    >
      <div className="w-full h-full">
        <span
          className={`font-medium ${isCurrentMonth ? "text-black dark:text-white" : "text-gray-400"
            }`}
        >
          {date.getDate()}
        </span>
        <div className="absolute left-0 right-0 top-8 flex flex-col gap-0.5">
          {events.map((event) => (
            <div
              key={event.id}
              className={`flex h-5 items-center ${isFirstDayOfEvent(date, event) ? "pl-2 rounded-l-full" : "pl-0"
                } ${isLastDayOfEvent(date, event) ? "pr-2 rounded-r-full" : "pr-0"
                } ${!isFirstDayOfEvent(date, event) && !isLastDayOfEvent(date, event)
                  ? "px-0"
                  : ""
                } bg-blue-500/20 dark:bg-blue-500/30`}
            >
              {isFirstDayOfEvent(date, event) && (
                <span className="text-xs font-medium text-blue-800 sm:truncate dark:text-blue-100">
                  {event.title}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </td>
  );
};

export default Day;
