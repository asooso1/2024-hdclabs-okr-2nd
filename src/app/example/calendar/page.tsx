"use client";

import { useState } from "react";
import Calendar from "@/components/Calendar";
import { Event } from "@/components/Calendar/types";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function CalendarPage() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);

  const sampleEvents: Event[] = [
    // 전월 일정
    {
      id: "prev1",
      title: "전월 프로젝트 마감",
      startTime: new Date(currentYear, currentMonth - 1, 25),
      endTime: new Date(currentYear, currentMonth - 1, 28),
    },
    {
      id: "prev2",
      title: "전월 팀 미팅",
      startTime: new Date(currentYear, currentMonth - 1, 15),
      endTime: new Date(currentYear, currentMonth - 1, 15),
    },
    {
      id: "prev3",
      title: "전월 워크샵",
      startTime: new Date(currentYear, currentMonth - 1, 10),
      endTime: new Date(currentYear, currentMonth - 1, 12),
    },
    {
      id: "prev4",
      title: "전월 교육",
      startTime: new Date(currentYear, currentMonth - 1, 5),
      endTime: new Date(currentYear, currentMonth - 1, 7),
    },
    {
      id: "prev5",
      title: "전월 회의",
      startTime: new Date(currentYear, currentMonth - 1, 20),
      endTime: new Date(currentYear, currentMonth - 1, 20),
    },

    // 당월 일정
    {
      id: "current1",
      title: "당월 프로젝트 시작",
      startTime: new Date(currentYear, currentMonth, 5),
      endTime: new Date(currentYear, currentMonth, 8),
    },
    {
      id: "current2",
      title: "당월 정기 미팅",
      startTime: new Date(currentYear, currentMonth, 15),
      endTime: new Date(currentYear, currentMonth, 15),
    },
    {
      id: "current3",
      title: "당월 세미나",
      startTime: new Date(currentYear, currentMonth, 20),
      endTime: new Date(currentYear, currentMonth, 22),
    },
    {
      id: "current4",
      title: "당월 발표",
      startTime: new Date(currentYear, currentMonth, 25),
      endTime: new Date(currentYear, currentMonth, 25),
    },
    {
      id: "current5",
      title: "당월 휴가",
      startTime: new Date(currentYear, currentMonth, 28),
      endTime: new Date(currentYear, currentMonth + 1, 1),
    },

    // 다음월 일정
    {
      id: "next1",
      title: "다음월 킥오프",
      startTime: new Date(currentYear, currentMonth + 1, 3),
      endTime: new Date(currentYear, currentMonth + 1, 5),
    },
    {
      id: "next2",
      title: "다음월 컨퍼런스",
      startTime: new Date(currentYear, currentMonth + 1, 10),
      endTime: new Date(currentYear, currentMonth + 1, 12),
    },
    {
      id: "next3",
      title: "다음월 워크샵",
      startTime: new Date(currentYear, currentMonth + 1, 15),
      endTime: new Date(currentYear, currentMonth + 1, 17),
    },
    {
      id: "next4",
      title: "다음월 미팅",
      startTime: new Date(currentYear, currentMonth + 1, 20),
      endTime: new Date(currentYear, currentMonth + 1, 20),
    },
    {
      id: "next5",
      title: "다음월 프로젝트 마감",
      startTime: new Date(currentYear, currentMonth + 1, 25),
      endTime: new Date(currentYear, currentMonth + 1, 28),
    },
  ];

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);

    const eventsOnDate = sampleEvents.filter((event) => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      return date >= eventStart && date <= eventEnd;
    });

    setSelectedEvents(eventsOnDate);
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="월간 일정표" />
      <Calendar events={sampleEvents} onDateClick={handleDateClick} />

      {selectedDate && (
        <div className="mt-4 rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
            {selectedDate.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
          {selectedEvents.length > 0 ? (
            <div className="flex flex-col gap-2">
              {selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex w-full border-l-6 border-[#34D399] bg-[#34D399] bg-opacity-[15%] px-7 py-3 shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30 md:p-9 items-center"
                >
                  <div className="mr-5 flex h-9 w-full max-w-[36px] items-center justify-center rounded-xl bg-[#34D399]">
                    <svg
                      width="16"
                      height="12"
                      viewBox="0 0 16 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15.2984 0.826822L15.2868 0.811827L15.2741 0.797751C14.9173 0.401867 14.3238 0.400754 13.9657 0.794406L5.91888 9.45376L2.05667 5.2868C1.69856 4.89287 1.10487 4.89389 0.747996 5.28987C0.417335 5.65675 0.417335 6.22337 0.747996 6.59026L0.747959 6.59029L0.752701 6.59541L4.86742 11.0348C5.14445 11.3405 5.52858 11.5 5.89581 11.5C6.29242 11.5 6.65178 11.3355 6.92401 11.035L15.2162 2.11161C15.5833 1.74452 15.576 1.18615 15.2984 0.826822Z"
                        fill="white"
                        stroke="white"
                      ></path>
                    </svg>
                  </div>
                  <div className="w-full">
                    <h5 className="mb-1 text-lg font-semibold text-black dark:text-[#34D399] ">
                      {event.title}
                    </h5>
                    <p className="text-base leading-relaxed text-body">
                      {event.startTime.toLocaleDateString()} -{" "}
                      {event.endTime.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              해당 날짜에 예정된 일정이 없습니다.
            </p>
          )}
        </div>
      )}
    </DefaultLayout>
  );
}
