"use client";

import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";
import { Event } from "@/components/Calendar/types";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { projectApi } from "@/lib/api/projects";
import { Project } from "@/lib/api/types";
import dynamic from 'next/dynamic';
import Link from 'next/link';

const StaticMap = dynamic(() => import("@/components/Maps/StaticMap"), {
  ssr: false,
});

interface ExtendedEvent extends Event {
  description: string;
  workType: string;
}

export default function CalendarPage() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ExtendedEvent | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectApi.getManagedProjects('6744379551dad806db3c9f23');

        // 프로젝트 데이터를 Event 형식으로 변환
        const projectEvents: ExtendedEvent[] = response.map((project: Project) => ({
          id: project.id,
          title: project.name,
          startTime: new Date(project.from),
          endTime: new Date(project.to),
          latitude: project.latitude,
          longitude: project.longitude,
          description: project.description,
          workType: project.workType
        }));

        setEvents(projectEvents);
      } catch (error) {
        console.error("프로젝트 데이터 가져오기 실패:", error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.style.overflowY = 'auto';
      mainElement.style.height = 'calc(100vh - 72px)';
    }

    return () => {
      if (mainElement) {
        mainElement.style.overflowY = '';
        mainElement.style.height = '';
      }
    };
  }, []);

  useEffect(() => {
    if (selectedEvents) {
      const mainElement = document.querySelector('main');
      if (mainElement) {
        setTimeout(() => {
          mainElement.scrollTo({
            top: mainElement.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [selectedEvents]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);

    const eventsOnDate = events.filter((event) => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);

      // event의 날짜를 YYYY-MM-DD 형식으로 변환하여 비교
      const eventStartDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
      const eventEndDate = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
      const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      return selectedDate >= eventStartDate && selectedDate <= eventEndDate;
    });
    setSelectedEvents(eventsOnDate);
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="월간 일정표" />
      <Calendar events={events} onDateClick={handleDateClick} />

      {/* 이벤트 목록 */}
      {selectedEvents.length > 0 ?
        (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
              <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
                {selectedDate?.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <div className="flex flex-col gap-4">
                {selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`flex flex-col w-full border-l-6 border-[#34D399] ${selectedEvent?.id === event.id
                        ? 'bg-[#34D399] bg-opacity-[25%]'
                        : 'bg-[#34D399] bg-opacity-[15%]'
                      } px-7 py-3 shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30 md:p-6 cursor-pointer`}
                    onClick={() => setSelectedEvent(event as ExtendedEvent)}
                  >
                    <div className="flex items-center">
                      {/* <div className="mr-5 flex h-9 w-full max-w-[36px] items-center justify-center rounded-xl bg-[#34D399]">
                      <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.2984 0.826822L15.2868 0.811827L15.2741 0.797751C14.9173 0.401867 14.3238 0.400754 13.9657 0.794406L5.91888 9.45376L2.05667 5.2868C1.69856 4.89287 1.10487 4.89389 0.747996 5.28987C0.417335 5.65675 0.417335 6.22337 0.747996 6.59026L0.747959 6.59029L0.752701 6.59541L4.86742 11.0348C5.14445 11.3405 5.52858 11.5 5.89581 11.5C6.29242 11.5 6.65178 11.3355 6.92401 11.035L15.2162 2.11161C15.5833 1.74452 15.576 1.18615 15.2984 0.826822Z" fill="white" stroke="white"></path>
                      </svg>
                    </div> */}
                      <div className="w-full">
                        <h5 className="mb-1 text-lg font-semibold text-black dark:text-[#34D399]">
                          {event.title}
                        </h5>
                        <p className="text-sm text-body">
                          {event.startTime.toLocaleDateString()} - {event.endTime.toLocaleDateString()}
                        </p>
                        <p className="text-sm text-body mt-1">
                          공종: {(event as ExtendedEvent).workType}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
              {selectedEvent ? (
                <>
                  <div className="mb-4">
                    <h4 className="text-xl font-semibold text-black dark:text-white mb-2">
                      {selectedEvent.title}
                    </h4>
                    <p className="text-sm text-body mb-2">
                      작업 기간: {selectedEvent.startTime.toLocaleDateString()} - {selectedEvent.endTime.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-body mb-2">
                      공종: {selectedEvent.workType}
                    </p>
                    <p className="text-sm text-body mb-4">
                      작업 내용: {selectedEvent.description}
                    </p>
                    <Link
                      href={`/admin/projects/${selectedEvent.id}`}
                      className="inline-block px-6 py-2.5 bg-primary text-white font-medium text-xs leading-tight rounded shadow-md hover:bg-primary-700 hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg transition duration-150 ease-in-out"
                    >
                      상세보기
                    </Link>
                  </div>
                  <div className="w-full h-[300px]">
                    <StaticMap
                      lat={selectedEvent.latitude || 37.566826}
                      lng={selectedEvent.longitude || 126.9786567}
                      height="300px"
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    작업을 선택해주세요
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}

      {/* 선택된 이벤트 상세 정보 및 지도 */}

    </DefaultLayout>
  );
}
