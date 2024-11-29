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
import dynamic from "next/dynamic";

const StaticMap = dynamic(() => import('@/components/Maps/StaticMap'), {
  ssr: false
});

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
          userId: localStorage.getItem('userId') || '' || '',
          schedules: [date.toISOString().split('T')[0]]
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
      <Breadcrumb pageName="작업계획 선택" />
      <div className="mx-auto max-w-5xl">
        {project && (
          <div className="mb-8">
            <div className="bg-white dark:bg-boxdark rounded-xl shadow-default overflow-hidden mb-6">
              <div className="relative h-40 bg-gradient-to-r from-primary/90 to-primary">
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
                <div className="absolute bottom-6 left-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 text-sm font-medium bg-white text-primary rounded-full">
                      {project.workType}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {project.name}
                  </h1>
                  <div className="flex items-center text-white/90">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm">{project.address}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                        작업 기간
                      </h3>
                      <div className="flex items-center text-black dark:text-white">
                        <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="font-medium">
                          {new Date(project.from).toLocaleDateString()} ~ {new Date(project.to).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                        작업 내용
                      </h3>
                      <p className="font-medium text-black dark:text-white">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  <div className="h-full min-h-[200px] rounded-lg overflow-hidden">
                    <StaticMap
                      lat={project.latitude}
                      lng={project.longitude}
                      height="100%"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-boxdark rounded-xl shadow-default">
          <div className="p-6 border-b border-stroke dark:border-strokedark">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black dark:text-white">
                {searchParams.get('type') === 'accept' ? '작업일 선택' : '근로계획 확인'}
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#34D399] mr-2"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">추천 작업일</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-primary/20 mr-2"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">작업 기간</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <Calendar
              events={[...events, ...preferenceEvents]}
              onDateClick={handleDateClick}
            />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}