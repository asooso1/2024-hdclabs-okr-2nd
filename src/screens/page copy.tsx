"use client";

import { useEffect, useState } from "react";
import Calendar from "@/components/Calendar";
import { Event } from "@/components/Calendar/types";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { projectApi } from "@/lib/api/projects";
import { Project } from "@/lib/api/types";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Loader from "@/components/common/Loader";
import StaticMap from "@/components/Maps/StaticMap";

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [preferenceEvents, setPreferenceEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        const projectData = await projectApi.getProjectForWorker(projectId);
        setProject(projectData);
        
        // 프로젝트 기간을 이벤트로 변환
        const projectEvent: Event = {
          id: projectData.id,
          title: projectData.name,
          startTime: new Date(projectData.from),
          endTime: new Date(projectData.to),
          color: '#3C50E0' // 프로젝트 기간 색상
        };

        // 선호 날짜들을 이벤트로 변환
        const preferenceEvents: Event[] = projectData.preferences?.map((date: string) => ({
          id: `pref-${date}`,
          title: "추천 작업일",
          startTime: new Date(date),
          endTime: new Date(date),
          color: '#34D399' // 추천 작업일 색상 (초록색)
        })) || [];

        setEvents([projectEvent]);
        setPreferenceEvents(preferenceEvents);
      } catch (error) {
        console.error("프로젝트 상세 정보 가져오기 실패:", error);
        toast.error("프로젝트 정보를 가져오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const handleDateClick = async (date: Date) => {
    // 선호 날짜인지 확인
    const isPreferredDate = preferenceEvents.some(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });

    if (!isPreferredDate) {
      toast.warning("추천 작업일만 선택할 수 있습니다.");
      return;
    }

    setSelectedDate(date);

    if (searchParams.get('type') === 'accept' && window.confirm('이 날짜로 작업 일정을 선택하시겠습니까?')) {
      try {
        await projectApi.acceptProject(projectId!, {
          workDate: date.toISOString().split('T')[0]
        });
        toast.success("작업 일정이 선택되었습니다.");
      } catch (error) {
        console.error("작업 일정 선택 실패:", error);
        toast.error("작업 일정 선택에 실패했습니다.");
      }
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-full">
          <Loader />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      {searchParams.get('type') === 'accept' ? (
        <Breadcrumb pageName="일정 선택" />
      ) : (
        <Breadcrumb pageName="근로계획 확인" />
      )}

      {project && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                프로젝트 정보
              </h3>
            </div>
            <div className="p-6.5">
              <div className="mb-4.5">
                <h4 className="mb-3 text-xl font-semibold text-black dark:text-white">
                  {project.name}
                </h4>
              </div>
              <div className="mb-4">
                <p className="mb-2"><span className="font-medium">공종:</span> {project.workType}</p>
                <p className="mb-2"><span className="font-medium">주소:</span> {project.address}</p>
                <p className="mb-2">
                  <span className="font-medium">작업 기간:</span>{" "}
                  {new Date(project.from).toLocaleDateString()} ~{" "}
                  {new Date(project.to).toLocaleDateString()}
                </p>
                <p><span className="font-medium">작업 내용:</span> {project.description}</p>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                작업 위치
              </h3>
            </div>
            <div className="p-6.5">
              <StaticMap 
                lat={project.latitude} 
                lng={project.longitude} 
                height="300px"
              />
            </div>
          </div>
        </div>
      )}

      <Calendar 
        events={[...events, ...preferenceEvents]} 
        onDateClick={handleDateClick} 
      />

      {/* {selectedDate && (
        <div className="mt-4 rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
            {selectedDate.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex w-full border-l-6 border-[#34D399] bg-[#34D399] bg-opacity-[15%] px-7 py-3 shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30 md:p-9 items-center">
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
                <h5 className="mb-1 text-lg font-semibold text-black dark:text-[#34D399]">
                  추천 작업일
                </h5>
                <p className="text-base leading-relaxed text-body">
                  {selectedDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </DefaultLayout>
  );
}
